// Development-only demo data. Never loaded unless the user enables Demo mode
// in Settings, and it is always labelled in the interface.

import * as db from './db.js';

const DAY = 24 * 60 * 60 * 1000;

// Fictional apps and package names used only for UI testing.
const LIBRARY = [
  { packageName: 'com.instagram.android', appName: 'Instagram', installed: true },
  { packageName: 'com.whatsapp', appName: 'WhatsApp', installed: true },
  { packageName: 'com.spotify.music', appName: 'Spotify', installed: true },
  { packageName: 'com.android.chrome', appName: 'Chrome', installed: true },
  { packageName: 'com.google.android.apps.maps', appName: 'Maps', installed: true },
  { packageName: 'com.netflix.mediaclient', appName: 'Netflix', installed: true },
  { packageName: 'com.demo.puzzleroyale', appName: 'Puzzle Royale', installed: false },
  { packageName: 'com.demo.photoeditor', appName: 'Photo Editor', installed: false },
  { packageName: 'com.demo.noteslite', appName: 'Notes Lite', installed: false },
];

export function getDemoScan() {
  return LIBRARY.filter((app) => app.installed).map((app) => ({
    packageName: app.packageName,
    appName: app.appName,
    icon: null,
  }));
}

export async function seedDemoData() {
  const now = Date.now();
  const apps = [];
  const events = [];

  LIBRARY.forEach((app, index) => {
    const firstSeen = now - (38 + index * 4) * DAY - 3 * 60 * 60 * 1000;
    const lastSeen = app.installed ? now - (index % 3) * DAY - 2 * 60 * 60 * 1000 : now - (9 + index) * DAY;
    const uninstallDetectedAt = app.installed ? null : lastSeen + 2 * DAY;
    const status = app.installed ? 'INSTALLED' : 'UNINSTALLED';

    apps.push({
      packageName: app.packageName,
      appName: app.appName,
      icon: null,
      status,
      firstSeen,
      lastSeen,
      uninstallDetectedAt,
      demo: true,
    });

    events.push({ packageName: app.packageName, appName: app.appName, type: 'detected', at: firstSeen });
    if (lastSeen - firstSeen > DAY) {
      events.push({ packageName: app.packageName, appName: app.appName, type: 'detected', at: lastSeen });
    }
    if (uninstallDetectedAt) {
      events.push({
        packageName: app.packageName,
        appName: app.appName,
        type: 'uninstalled',
        at: uninstallDetectedAt,
      });
    }
  });

  await db.saveApps(apps);
  await db.addEvents(events);
  await db.setMeta('lastScan', {
    at: now - 2 * 60 * 60 * 1000,
    count: getDemoScan().length,
    source: 'demo',
  });
}
