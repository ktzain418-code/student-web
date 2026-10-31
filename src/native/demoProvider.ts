import type { InstalledAppsProvider, ScannedApp, ScanOutcome } from "./types";

/**
 * DEVELOPMENT / TEST MODE ONLY.
 *
 * Demo mode exists so the interface can be reviewed without an Android device.
 * It writes to its own database (`apphistory-demo`) so demo apps can never be
 * mistaken for, or mixed with, a real device history. It is off by default and
 * every screen that shows demo records is labelled as such.
 */
const DEMO_SCAN_COUNT_KEY = "apphistory.demo.scanCount";

const FIRST_SCAN_APPS: ScannedApp[] = [
  { appName: "Instagram", packageName: "com.instagram.android", icon: null, isSystemApp: false },
  { appName: "WhatsApp", packageName: "com.whatsapp", icon: null, isSystemApp: false },
  { appName: "Spotify", packageName: "com.spotify.music", icon: null, isSystemApp: false },
  { appName: "Google Maps", packageName: "com.google.android.apps.maps", icon: null, isSystemApp: false },
  { appName: "Notion", packageName: "notion.id", icon: null, isSystemApp: false },
  { appName: "Subway Surfers", packageName: "com.kiloo.subwaysurf", icon: null, isSystemApp: false },
  { appName: "Kindle", packageName: "com.amazon.kindle", icon: null, isSystemApp: false },
  { appName: "Duolingo", packageName: "com.duolingo", icon: null, isSystemApp: false },
  { appName: "Photos", packageName: "com.google.android.apps.photos", icon: null, isSystemApp: false },
  { appName: "Camera", packageName: "com.android.camera", icon: null, isSystemApp: true },
  { appName: "Podcasts", packageName: "com.google.android.apps.podcasts", icon: null, isSystemApp: false },
  { appName: "Fitness Tracker", packageName: "com.fitnesstracker.app", icon: null, isSystemApp: false },
];

/** These two "disappear" from the second demo scan onward, to show uninstall detection. */
const REMOVED_ON_SECOND_SCAN = ["com.kiloo.subwaysurf", "com.fitnesstracker.app"];

export function resetDemoScenario(): void {
  try {
    localStorage.removeItem(DEMO_SCAN_COUNT_KEY);
  } catch {
    /* storage unavailable — nothing to reset */
  }
}

function readScanCount(): number {
  try {
    const raw = localStorage.getItem(DEMO_SCAN_COUNT_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

export const demoProvider: InstalledAppsProvider = {
  id: "demo",

  isAvailable(): boolean {
    return true;
  },

  unavailableReason(): string {
    return "";
  },

  async scan(): Promise<ScanOutcome> {
    const previous = readScanCount();
    const next = previous + 1;
    try {
      localStorage.setItem(DEMO_SCAN_COUNT_KEY, String(next));
    } catch {
      /* ignore: the demonstration still works for this session */
    }
    // Small delay so the scanning state is visible, like a real device scan.
    await new Promise((resolve) => setTimeout(resolve, 650));

    const apps =
      next >= 2 ? FIRST_SCAN_APPS.filter((app) => !REMOVED_ON_SECOND_SCAN.includes(app.packageName)) : FIRST_SCAN_APPS;

    return {
      apps: apps.map((app) => ({ ...app })),
      visibility: "full",
      note: "Demo mode — these are sample records, not apps from this device.",
      source: "demo",
    };
  },
};
