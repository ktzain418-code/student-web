/**
 * Domain model for App History.
 *
 * Everything here lives on the device only (IndexedDB inside the WebView /
 * browser). There is no server sync in this build.
 */

export type AppStatus = "INSTALLED" | "UNINSTALLED";

/** How confident we are that a missing package was really uninstalled. */
export type UninstallConfidence = "confirmed" | "limited-visibility";

/** Where the record came from. Demo records never share a database with real ones. */
export type RecordSource = "device" | "demo";

export interface TrackedApp {
  id: string;
  appName: string;
  packageName: string;
  /** Base64 data URL of the launcher icon, when the platform exposes it. */
  icon: string | null;
  firstSeen: string;
  lastSeen: string;
  status: AppStatus;
  uninstallDetectedAt: string | null;
  /** False when the label was missing and we fell back to the package name. */
  isSystemApp: boolean;
  source: RecordSource;
  uninstallConfidence?: UninstallConfidence;
}

export type HistoryEventType = "DETECTED" | "UNINSTALLED" | "REINSTALLED";

export interface HistoryEvent {
  id: string;
  appId: string;
  appName: string;
  packageName: string;
  type: HistoryEventType;
  at: string;
}

/**
 * - `full`    – the app can enumerate every installed package (QUERY_ALL_PACKAGES
 *               granted/declared, Android 10 or older, or demo mode).
 * - `limited` – Android package visibility only exposes a subset. A package that
 *               disappears may be uninstalled *or* simply hidden from us.
 * - `unavailable` – no scan was possible.
 */
export type Visibility = "full" | "limited" | "unavailable";

export interface ScanRecord {
  at: string;
  detected: number;
  newApps: number;
  uninstalled: number;
  reinstalled: number;
  visibility: Visibility;
  source: RecordSource;
  trigger: "manual" | "auto";
  durationMs: number;
  /** Human readable warnings produced by the scan (safety guards). */
  warning: string | null;
}

export type ThemeMode = "system" | "light" | "dark";

export interface Settings {
  theme: ThemeMode;
  autoScan: boolean;
  demoMode: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  autoScan: true,
  demoMode: false,
};
