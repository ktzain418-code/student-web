// Bridge to the native Android module (Kotlin → Capacitor plugin "AppHistory").
//
// The real installed-app scan can only happen inside the Android app. In a plain
// browser there is no such capability, and this module never invents data: it
// reports the native module as unavailable and the UI says so.

import { getNativePlugin } from './state.js';

export class NativeUnavailableError extends Error {
  constructor() {
    super('The native Android module is not connected in this build.');
    this.name = 'NativeUnavailableError';
    this.userMessage =
      'Installed apps can only be read by the native Android module. This preview runs in a browser, so no device apps were scanned.';
  }
}

export class NativeScanError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'NativeScanError';
    this.userMessage = message;
    this.cause = cause;
  }
}

export function isNativeAvailable() {
  return Boolean(getNativePlugin());
}

function normalize(result) {
  const list = Array.isArray(result) ? result : Array.isArray(result?.apps) ? result.apps : [];
  return list
    .filter((item) => item && typeof item.packageName === 'string' && item.packageName.trim())
    .map((item) => ({
      packageName: item.packageName.trim(),
      appName:
        typeof item.appName === 'string' && item.appName.trim()
          ? item.appName.trim()
          : item.packageName.trim(),
      icon: typeof item.icon === 'string' && item.icon.startsWith('data:image/') ? item.icon : null,
    }));
}

export async function scanNative() {
  const native = getNativePlugin();
  if (!native) throw new NativeUnavailableError();

  let result;
  try {
    result = await native.scanInstalledApps();
  } catch (error) {
    throw new NativeScanError(
      'Android could not read the installed-app list. Check the package-visibility settings and try again.',
      error
    );
  }

  const apps = normalize(result);
  if (!apps.length) {
    throw new NativeScanError(
      'No applications were visible to the scanner. Android package visibility may be restricting access.'
    );
  }
  return apps;
}

export function isValidPackageName(packageName) {
  return (
    typeof packageName === 'string' &&
    /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+$/.test(packageName)
  );
}

export async function openPlayStore(packageName) {
  if (!isValidPackageName(packageName)) {
    return { opened: false, reason: 'invalid-package' };
  }

  const native = getNativePlugin();
  if (native && typeof native.openPlayStore === 'function') {
    try {
      const result = await native.openPlayStore({ packageName });
      return { opened: Boolean(result?.opened), reason: result?.reason || null };
    } catch (error) {
      return { opened: false, reason: 'intent-failed' };
    }
  }

  // Browser fallback: open the public Play Store listing in a new tab.
  const url = `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}`;
  let opened = null;
  try {
    opened = window.open(url, '_blank', 'noopener');
  } catch (error) {
    opened = null;
  }
  return opened ? { opened: true, via: 'browser' } : { opened: false, reason: 'popup-blocked' };
}

export async function getCapabilities() {
  const native = getNativePlugin();
  if (!native) return { native: false };
  if (typeof native.getCapabilities === 'function') {
    try {
      return { native: true, ...(await native.getCapabilities()) };
    } catch (error) {
      return { native: true, error: true };
    }
  }
  return { native: true };
}
