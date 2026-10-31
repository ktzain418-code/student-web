import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEMO_DB, LocalRepository, REAL_DB } from "../db/repository";
import { getProvider } from "../native";
import type { InstalledAppsProvider } from "../native/types";
import { ScanError } from "../native/types";
import { resetDemoScenario } from "../native/demoProvider";
import { executeScan } from "../scan/executeScan";
import { applyTheme } from "../lib/theme";
import {
  DEFAULT_SETTINGS,
  type HistoryEvent,
  type ScanRecord,
  type Settings,
  type TrackedApp,
} from "../types";

const SETTINGS_KEY = "apphistory.settings.v1";
const PRIVACY_KEY = "apphistory.privacy.v1";

/** Automatic startup check only runs if the last scan is older than this. */
const AUTO_SCAN_INTERVAL_MS = 6 * 60 * 60 * 1000;

interface AppStoreValue {
  ready: boolean;
  initError: string | null;
  apps: TrackedApp[];
  events: HistoryEvent[];
  lastScan: ScanRecord | null;
  settings: Settings;
  privacyAccepted: boolean;
  scanning: boolean;
  scanError: string | null;
  scanWarning: string | null;
  notice: string | null;
  nativeAvailable: boolean;
  provider: InstalledAppsProvider;
  scanNow: (trigger?: "manual" | "auto") => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => void;
  acceptPrivacy: () => void;
  deleteApp: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteAllData: () => Promise<void>;
  resetDemo: () => Promise<void>;
  dismissScanError: () => void;
  notify: (message: string) => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      theme: parsed.theme === "light" || parsed.theme === "dark" ? parsed.theme : "system",
      autoScan: typeof parsed.autoScan === "boolean" ? parsed.autoScan : DEFAULT_SETTINGS.autoScan,
      demoMode: parsed.demoMode === true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadPrivacyAccepted(): boolean {
  try {
    return localStorage.getItem(PRIVACY_KEY) === "accepted";
  } catch {
    return false;
  }
}

function sortByName(apps: TrackedApp[]): TrackedApp[] {
  return [...apps].sort((a, b) => a.appName.localeCompare(b.appName, undefined, { sensitivity: "base" }));
}

function sortEvents(events: HistoryEvent[]): HistoryEvent[] {
  return [...events].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(() => loadPrivacyAccepted());
  const [apps, setApps] = useState<TrackedApp[]>([]);
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [lastScan, setLastScan] = useState<ScanRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanWarning, setScanWarning] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const scanningRef = useRef(false);
  const autoScanAttempted = useRef(false);
  const noticeTimer = useRef<number | null>(null);

  const provider = useMemo(() => getProvider(settings.demoMode), [settings.demoMode]);
  const repo = useMemo(
    () => new LocalRepository(settings.demoMode ? DEMO_DB : REAL_DB),
    [settings.demoMode],
  );

  const nativeAvailable = useMemo(() => {
    try {
      return provider.isAvailable();
    } catch {
      return false;
    }
  }, [provider]);

  const notify = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 4200);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [storedApps, storedEvents, storedScan] = await Promise.all([
        repo.getAllApps(),
        repo.getEvents(),
        repo.getLastScan(),
      ]);
      setApps(sortByName(storedApps));
      setEvents(sortEvents(storedEvents));
      setLastScan(storedScan);
      setInitError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Your saved app history could not be opened.";
      setInitError(message);
    } finally {
      setReady(true);
    }
  }, [repo]);

  // Load (or reload) the active database whenever the mode changes.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setApps([]);
    setEvents([]);
    setLastScan(null);
    void (async () => {
      if (cancelled) return;
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  // Persist settings and keep the theme in sync with the system preference.
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* storage may be unavailable; the session still works */
    }
    applyTheme(settings.theme);
    if (settings.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    // "system" is re-resolved by applyTheme, so a preference change just reapplies it.
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    };
  }, []);

  const scanNow = useCallback(
    async (trigger: "manual" | "auto" = "manual") => {
      if (scanningRef.current) return;
      scanningRef.current = true;
      setScanning(true);
      setScanError(null);
      setScanWarning(null);
      const startedAt = Date.now();
      try {
        if (!provider.isAvailable()) {
          throw new ScanError("NATIVE_UNAVAILABLE", provider.unavailableReason());
        }
        const outcome = await provider.scan();
        const execution = await executeScan(repo, outcome, { trigger, startedAt });
        await refresh();
        setLastScan(execution.scan);
        if (execution.scan.warning) setScanWarning(execution.scan.warning);
        if (trigger === "manual") {
          const parts: string[] = [];
          if (execution.scan.newApps) parts.push(`${execution.scan.newApps} new`);
          if (execution.scan.uninstalled) parts.push(`${execution.scan.uninstalled} marked uninstalled`);
          if (execution.scan.reinstalled) parts.push(`${execution.scan.reinstalled} detected again`);
          notify(
            parts.length > 0
              ? `Scan complete — ${parts.join(", ")}.`
              : `Scan complete — ${execution.scan.detected} apps detected.`,
          );
        }
      } catch (error) {
        const message =
          error instanceof ScanError
            ? error.message
            : "The scan failed unexpectedly. Nothing was changed.";
        setScanError(message);
        if (trigger === "manual") notify("Scan could not be completed.");
      } finally {
        scanningRef.current = false;
        setScanning(false);
      }
    },
    [notify, provider, refresh, repo],
  );

  // Lightweight startup check: only when enabled, never in demo mode, and at
  // most once per 6 hours so the app does not scan needlessly.
  useEffect(() => {
    if (!ready || autoScanAttempted.current) return;
    if (!settings.autoScan || settings.demoMode) return;
    if (!nativeAvailable) return;
    autoScanAttempted.current = true;
    const last = lastScan ? Date.parse(lastScan.at) : 0;
    if (!last || Date.now() - last > AUTO_SCAN_INTERVAL_MS) {
      void scanNow("auto");
    }
  }, [ready, settings.autoScan, settings.demoMode, nativeAvailable, lastScan, scanNow]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const acceptPrivacy = useCallback(() => {
    setPrivacyAccepted(true);
    try {
      localStorage.setItem(PRIVACY_KEY, "accepted");
    } catch {
      /* ignore */
    }
  }, []);

  const deleteApp = useCallback(
    async (id: string) => {
      try {
        await repo.deleteApp(id);
        await refresh();
        notify("App removed from history.");
      } catch (error) {
        notify(error instanceof Error ? error.message : "That app could not be removed.");
      }
    },
    [notify, refresh, repo],
  );

  const clearHistory = useCallback(async () => {
    try {
      await repo.clearHistory();
      await refresh();
      notify("History cleared. Tracked apps are still saved.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "History could not be cleared.");
    }
  }, [notify, refresh, repo]);

  const deleteAllData = useCallback(async () => {
    try {
      await repo.deleteAllData();
      if (settings.demoMode) resetDemoScenario();
      await refresh();
      notify("All data deleted from this device.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Data could not be deleted.");
    }
  }, [notify, refresh, repo, settings.demoMode]);

  const resetDemo = useCallback(async () => {
    resetDemoScenario();
    await repo.deleteAllData();
    await refresh();
    notify("Demo scenario reset.");
  }, [notify, refresh, repo]);

  const dismissScanError = useCallback(() => setScanError(null), []);

  const value: AppStoreValue = {
    ready,
    initError,
    apps,
    events,
    lastScan,
    settings,
    privacyAccepted,
    scanning,
    scanError,
    scanWarning,
    notice,
    nativeAvailable,
    provider,
    scanNow,
    updateSettings,
    acceptPrivacy,
    deleteApp,
    clearHistory,
    deleteAllData,
    resetDemo,
    dismissScanError,
    notify,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const context = useContext(AppStoreContext);
  if (!context) throw new Error("useAppStore must be used inside AppStoreProvider");
  return context;
}
