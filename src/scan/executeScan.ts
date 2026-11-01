import { createId } from "../db/idb";
import type { LocalRepository } from "../db/repository";
import type { HistoryEvent, ScanRecord, TrackedApp } from "../types";
import type { ScanOutcome } from "../native/types";
import { ScanError, toScanError } from "../native/types";

export interface ScanExecution {
  apps: TrackedApp[];
  events: HistoryEvent[];
  scan: ScanRecord;
}

/**
 * A scan that suddenly loses most of the previously installed apps is far more
 * likely to be a package-visibility change than 20 real uninstalls, so we refuse
 * to rewrite history in that case and tell the user instead.
 */
function massMissingLimit(installedCount: number): number {
  return Math.max(5, Math.ceil(installedCount * 0.8));
}

/**
 * Compares a fresh scan with the stored history and produces the records to
 * write. Pure decision-making happens here; persistence is one atomic commit.
 */
export async function executeScan(
  repo: LocalRepository,
  outcome: ScanOutcome,
  options: { trigger: "manual" | "auto"; startedAt: number },
): Promise<ScanExecution> {
  let existing: TrackedApp[];
  try {
    existing = await repo.getAllApps();
  } catch (error) {
    throw new ScanError("DATABASE", "Your saved app history could not be read. Nothing was changed.");
  }

  if (outcome.apps.length === 0) {
    const message =
      outcome.visibility === "limited"
        ? "The scan could not see any installed apps. Android's package visibility is restricted, so nothing was changed."
        : "The scan returned no apps, so nothing was changed. Try scanning again.";
    throw new ScanError("EMPTY_RESULT", message);
  }

  const at = new Date().toISOString();
  const byPackage = new Map(existing.map((app) => [app.packageName, app]));
  const scannedPackages = new Set<string>();
  const upserts: TrackedApp[] = [];
  const events: HistoryEvent[] = [];
  let newApps = 0;
  let reinstalled = 0;

  for (const item of outcome.apps) {
    const packageName = item.packageName?.trim();
    if (!packageName) continue;
    if (scannedPackages.has(packageName)) continue;
    scannedPackages.add(packageName);

    const previous = byPackage.get(packageName);
    if (!previous) {
      const app: TrackedApp = {
        id: createId("app"),
        appName: item.appName || packageName,
        packageName,
        icon: item.icon ?? null,
        firstSeen: at,
        lastSeen: at,
        status: "INSTALLED",
        uninstallDetectedAt: null,
        isSystemApp: item.isSystemApp,
        source: outcome.source,
      };
      upserts.push(app);
      events.push(makeEvent(app, "DETECTED", at));
      newApps += 1;
      continue;
    }

    const wasUninstalled = previous.status === "UNINSTALLED";
    const app: TrackedApp = {
      ...previous,
      appName: item.appName || previous.appName,
      icon: item.icon ?? previous.icon,
      isSystemApp: item.isSystemApp,
      status: "INSTALLED",
      uninstallDetectedAt: null,
      uninstallConfidence: undefined,
      lastSeen: at,
    };
    upserts.push(app);
    if (wasUninstalled) {
      events.push(makeEvent(app, "REINSTALLED", at));
      reinstalled += 1;
    }
  }

  const missing = existing.filter(
    (app) => app.status === "INSTALLED" && !scannedPackages.has(app.packageName),
  );

  const installedBefore = existing.filter((app) => app.status === "INSTALLED").length;
  let warning: string | null = null;
  let uninstalledCount = 0;

  if (missing.length > 0) {
    if (missing.length > massMissingLimit(installedBefore)) {
      warning = `${missing.length} previously detected apps were missing from this scan, which looks like Android package visibility rather than real uninstalls. They were kept as installed.`;
    } else {
      for (const previous of missing) {
        const app: TrackedApp = {
          ...previous,
          status: "UNINSTALLED",
          uninstallDetectedAt: at,
          uninstallConfidence: outcome.visibility === "full" ? "confirmed" : "limited-visibility",
        };
        upserts.push(app);
        events.push(makeEvent(app, "UNINSTALLED", at));
        uninstalledCount += 1;
      }
    }
  }

  const scan: ScanRecord = {
    at,
    detected: outcome.apps.length,
    newApps,
    uninstalled: uninstalledCount,
    reinstalled,
    visibility: outcome.visibility,
    source: outcome.source,
    trigger: options.trigger,
    durationMs: Math.max(0, Date.now() - options.startedAt),
    warning,
  };

  try {
    await repo.commitScan({ apps: upserts, events, scan });
  } catch (error) {
    throw new ScanError(
      "DATABASE",
      error instanceof Error && error.message
        ? `Your app history could not be saved: ${error.message}`
        : "Your app history could not be saved.",
    );
  }

  return { apps: upserts, events, scan };
}

function makeEvent(app: TrackedApp, type: HistoryEvent["type"], at: string): HistoryEvent {
  return {
    id: createId("evt"),
    appId: app.id,
    appName: app.appName,
    packageName: app.packageName,
    type,
    at,
  };
}

export function describeScanError(error: unknown): string {
  return toScanError(error, "The scan failed unexpectedly. Nothing was changed.").message;
}
