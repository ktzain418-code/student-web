/**
 * Play Store hand-off.
 *
 * App History never installs anything itself. The Reinstall button only opens
 * the Play Store listing for a package. Android gives web content no reliable
 * way to ask "does a store listing exist for this package?", so we:
 *   1. reject anything that is not a plausible package name,
 *   2. try the `market://` intent and detect whether the app was backgrounded,
 *   3. otherwise open the web listing in a new tab,
 *   4. report failure so the UI can show "Play Store listing unavailable".
 */

const PACKAGE_NAME = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/;

export type PlayStoreResult = "opened" | "web-fallback" | "unavailable";

export function isValidPackageName(packageName: string | null | undefined): packageName is string {
  if (!packageName) return false;
  if (packageName.length > 155 || packageName.length < 3) return false;
  return PACKAGE_NAME.test(packageName);
}

export function playStoreWebUrl(packageName: string): string {
  return `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}`;
}

function isAndroidDevice(): boolean {
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}

/** True when handing the URL to the system appears to have left our page. */
function tryIntent(url: string, timeoutMs = 1400): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (opened: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("blur", onHide);
      resolve(opened);
    };
    const onHide = () => finish(true);
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    window.addEventListener("blur", onHide);
    try {
      window.location.href = url;
    } catch {
      finish(false);
    }
  });
}

export async function openPlayStoreListing(packageName: string | null | undefined): Promise<PlayStoreResult> {
  if (!isValidPackageName(packageName)) return "unavailable";

  if (isAndroidDevice()) {
    const opened = await tryIntent(`market://details?id=${encodeURIComponent(packageName)}`);
    if (opened) return "opened";
  }

  try {
    const win = window.open(playStoreWebUrl(packageName), "_blank", "noopener,noreferrer");
    return win ? "web-fallback" : "unavailable";
  } catch {
    return "unavailable";
  }
}
