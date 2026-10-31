// Scan workflow: read the current app list, then reconcile it with local history.

import * as db from './db.js';
import { state } from './state.js';
import { scanNative } from './native.js';
import { getDemoScan } from './demo.js';

const DETECT_EVENT_INTERVAL = 12 * 60 * 60 * 1000; // avoid flooding history with every scan

export class ScanError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ScanError';
    this.userMessage = message;
    this.cause = cause;
  }
}

export async function performScan() {
  const now = Date.now();
  const demoMode = state.settings.demoMode;
  const scanned = demoMode ? getDemoScan() : await scanNative();

  const existing = await db.getAllApps();
  const byPackage = new Map(existing.map((app) => [app.packageName, app]));
  const seen = new Set();

  const updates = [];
  const events = [];
  let added = 0;
  let reinstalled = 0;
  let gone = 0;

  for (const item of scanned) {
    seen.add(item.packageName);
    const record = byPackage.get(item.packageName);

    if (!record) {
      added += 1;
      updates.push({
        packageName: item.packageName,
        appName: item.appName,
        icon: item.icon,
        status: 'INSTALLED',
        firstSeen: now,
        lastSeen: now,
        uninstallDetectedAt: null,
      });
      events.push({ packageName: item.packageName, appName: item.appName, type: 'detected', at: now });
      continue;
    }

    const wasUninstalled = record.status === 'UNINSTALLED';
    const stale = now - (record.lastSeen || 0) > DETECT_EVENT_INTERVAL;

    updates.push({
      ...record,
      appName: item.appName || record.appName,
      icon: item.icon || record.icon || null,
      status: 'INSTALLED',
      lastSeen: now,
      uninstallDetectedAt: wasUninstalled ? null : record.uninstallDetectedAt || null,
    });

    if (wasUninstalled) {
      reinstalled += 1;
      events.push({ packageName: item.packageName, appName: item.appName, type: 'reinstalled', at: now });
    } else if (stale) {
      events.push({ packageName: item.packageName, appName: item.appName, type: 'detected', at: now });
    }
  }

  // Anything previously installed that the scan did not find is marked uninstalled.
  for (const app of existing) {
    if (app.status === 'INSTALLED' && !seen.has(app.packageName)) {
      gone += 1;
      updates.push({ ...app, status: 'UNINSTALLED', uninstallDetectedAt: now });
      events.push({ packageName: app.packageName, appName: app.appName, type: 'uninstalled', at: now });
    }
  }

  try {
    await db.saveApps(updates);
    await db.addEvents(events);
    await db.setMeta('lastScan', {
      at: now,
      count: scanned.length,
      source: demoMode ? 'demo' : 'native',
    });
  } catch (error) {
    throw new ScanError(
      'The scan finished, but the result could not be saved to local storage.',
      error
    );
  }

  return {
    at: now,
    detected: scanned.length,
    added,
    reinstalled,
    gone,
    changes: events.length,
  };
}
