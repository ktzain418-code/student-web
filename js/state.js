// Shared in-memory state, hydrated from the local database.

import * as db from './db.js';

const DEFAULT_SETTINGS = { theme: 'system', demoMode: false, consent: false };

export const state = {
  ready: false,
  apps: [],
  events: [],
  meta: {},
  settings: { ...DEFAULT_SETTINGS },
};

function readSettings(meta) {
  const stored = meta.settings;
  if (!stored || typeof stored !== 'object') return { ...DEFAULT_SETTINGS };
  return {
    theme: ['system', 'light', 'dark'].includes(stored.theme) ? stored.theme : 'system',
    demoMode: stored.demoMode === true,
    consent: stored.consent === true,
  };
}

export async function loadState() {
  const [apps, events, meta] = await Promise.all([
    db.getAllApps(),
    db.getRecentEvents(500),
    db.getAllMeta(),
  ]);
  state.apps = apps.sort((a, b) => (a.appName || '').localeCompare(b.appName || ''));
  state.events = events;
  state.meta = meta;
  state.settings = readSettings(meta);
  state.ready = true;
  return state;
}

export async function reloadData() {
  const [apps, events, meta] = await Promise.all([
    db.getAllApps(),
    db.getRecentEvents(500),
    db.getAllMeta(),
  ]);
  state.apps = apps.sort((a, b) => (a.appName || '').localeCompare(b.appName || ''));
  state.events = events;
  state.meta = meta;
  return state;
}

export async function updateSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  await db.setMeta('settings', state.settings);
  return state.settings;
}

export function lastScan() {
  const value = state.meta.lastScan;
  return value && typeof value.at === 'number' ? value : null;
}

export function installedApps() {
  return state.apps.filter((app) => app.status === 'INSTALLED');
}

export function uninstalledApps() {
  return state.apps.filter((app) => app.status === 'UNINSTALLED');
}

export function findApp(packageName) {
  return state.apps.find((app) => app.packageName === packageName) || null;
}

export function isNativeAvailable() {
  const native = getNativePlugin();
  return Boolean(native && typeof native.scanInstalledApps === 'function');
}

export function getNativePlugin() {
  const direct = window.AppHistoryNative;
  if (direct && typeof direct.scanInstalledApps === 'function') return direct;
  const capacitor = window.Capacitor?.Plugins?.AppHistory;
  if (capacitor && typeof capacitor.scanInstalledApps === 'function') return capacitor;
  return null;
}
