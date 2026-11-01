import { demoProvider } from "./demoProvider";
import { deviceProvider } from "./deviceProvider";
import type { InstalledAppsProvider } from "./types";

export function getProvider(demoMode: boolean): InstalledAppsProvider {
  return demoMode ? demoProvider : deviceProvider;
}

export { demoProvider, deviceProvider };
export type { InstalledAppsProvider, ScannedApp, ScanOutcome } from "./types";
export { ScanError, toScanError } from "./types";
