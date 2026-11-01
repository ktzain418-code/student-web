import type { RecordSource, Visibility } from "../types";

/** One row returned by the native Android module (or the demo provider). */
export interface ScannedApp {
  appName: string;
  packageName: string;
  /** Base64 data URL, or null when the platform could not expose an icon. */
  icon: string | null;
  isSystemApp: boolean;
}

export interface ScanOutcome {
  apps: ScannedApp[];
  visibility: Visibility;
  /** Android package-visibility detail worth showing to the user, if any. */
  note: string | null;
  source: RecordSource;
}

export interface InstalledAppsProvider {
  readonly id: RecordSource;
  /** True when this provider can actually enumerate apps on this platform. */
  isAvailable(): boolean;
  /** Why scanning is unavailable — shown verbatim in the interface. */
  unavailableReason(): string;
  scan(): Promise<ScanOutcome>;
}

export type ScanErrorCode =
  | "NATIVE_UNAVAILABLE"
  | "SCAN_FAILED"
  | "EMPTY_RESULT"
  | "MASS_MISSING"
  | "DATABASE";

export class ScanError extends Error {
  constructor(
    public readonly code: ScanErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ScanError";
  }
}

export function toScanError(error: unknown, fallback: string): ScanError {
  if (error instanceof ScanError) return error;
  if (error instanceof Error && error.message) {
    return new ScanError("SCAN_FAILED", error.message);
  }
  return new ScanError("SCAN_FAILED", fallback);
}
