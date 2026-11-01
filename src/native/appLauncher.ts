import { Capacitor, registerPlugin } from "@capacitor/core";

/**
 * JS side of `InstalledApps.openApp(packageName)`.
 *
 * Android can only launch an app that is actually installed. The Kotlin method
 * asks PackageManager for the package's launch intent and rejects with
 * `NOT_INSTALLED` when there is none, so the UI can tell the user to scan again
 * instead of silently doing nothing.
 *
 * This is the same native plugin that `deviceProvider` uses for scanning; it is
 * registered once by name, so both files talk to one Kotlin class.
 */
interface NativeLauncherApi {
  openApp(options: { packageName: string }): Promise<void>;
}

const InstalledApps = registerPlugin<NativeLauncherApi>("InstalledApps");

export type OpenAppResult = "opened" | "not-installed" | "unsupported" | "failed";

export function canOpenApps(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  } catch {
    return false;
  }
}

export async function openInstalledApp(packageName: string): Promise<OpenAppResult> {
  if (!packageName || !canOpenApps()) return "unsupported";
  try {
    await InstalledApps.openApp({ packageName });
    return "opened";
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error && typeof error.code === "string"
        ? error.code
        : "";
    return code === "NOT_INSTALLED" ? "not-installed" : "failed";
  }
}
