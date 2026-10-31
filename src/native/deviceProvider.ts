import { Capacitor, registerPlugin } from "@capacitor/core";
import type { InstalledAppsProvider, ScannedApp, ScanOutcome } from "./types";
import { ScanError } from "./types";
import type { Visibility } from "../types";

/**
 * JS side of the native Android module.
 *
 * The Kotlin implementation lives in `android-native/app/src/main/java/...`
 * (class `InstalledAppsPlugin`, registered as "InstalledApps"). It reads the
 * device's installed packages with Android's PackageManager and returns name,
 * package name, launcher icon and system-app flag for each one.
 *
 * On the web (including the Base44 preview) Capacitor reports a non-native
 * platform, so `isAvailable()` is false and App History never fabricates data.
 */
interface NativeAppRow {
  appName?: string;
  packageName?: string;
  icon?: string | null;
  isSystemApp?: boolean;
}

interface NativeScanResult {
  apps?: NativeAppRow[];
  visibility?: string;
  note?: string | null;
}

interface InstalledAppsPluginApi {
  scanInstalledApps(): Promise<NativeScanResult>;
}

const InstalledApps = registerPlugin<InstalledAppsPluginApi>("InstalledApps");

function normalizeVisibility(value: string | undefined): Visibility {
  if (value === "full" || value === "limited") return value;
  return "limited";
}

export const deviceProvider: InstalledAppsProvider = {
  id: "device",

  isAvailable(): boolean {
    try {
      return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
    } catch {
      return false;
    }
  },

  unavailableReason(): string {
    return "Reading installed apps requires the native Android build. This window is running the web UI, so Android does not allow it to list the apps on your phone.";
  },

  async scan(): Promise<ScanOutcome> {
    if (!this.isAvailable()) {
      throw new ScanError("NATIVE_UNAVAILABLE", this.unavailableReason());
    }
    let result: NativeScanResult;
    try {
      result = await InstalledApps.scanInstalledApps();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error && typeof error.message === "string"
          ? error.message
          : "The device scan failed.";
      throw new ScanError("SCAN_FAILED", message);
    }

    const apps: ScannedApp[] = (result.apps ?? [])
      .filter((row): row is NativeAppRow & { packageName: string } => typeof row.packageName === "string" && row.packageName.length > 0)
      .map((row) => ({
        appName: (row.appName ?? "").trim() || row.packageName,
        packageName: row.packageName,
        icon: row.icon ?? null,
        isSystemApp: Boolean(row.isSystemApp),
      }));

    return {
      apps,
      visibility: normalizeVisibility(result.visibility),
      note: result.note ?? null,
      source: "device",
    };
  },
};
