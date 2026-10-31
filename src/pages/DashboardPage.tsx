import { Link } from "react-router-dom";
import { Clock, Package, PackageCheck, PackageX, Search, ShieldCheck } from "lucide-react";
import { useAppStore } from "../state/AppStore";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { ScanButton } from "../components/ScanButton";
import { Notice } from "../components/Notice";
import { EmptyState } from "../components/EmptyState";
import { UninstalledCard } from "../components/UninstalledCard";
import { formatDateTime, relativeTime, withinDays } from "../lib/format";

export default function DashboardPage() {
  const { apps, lastScan, nativeAvailable, settings, scanError, scanWarning, initError, dismissScanError } =
    useAppStore();

  const installed = apps.filter((app) => app.status === "INSTALLED");
  const uninstalled = apps.filter((app) => app.status === "UNINSTALLED");
  const recentlyUninstalled = uninstalled.filter((app) => withinDays(app.uninstallDetectedAt, 7));
  const latestUninstalled = [...uninstalled]
    .sort((a, b) => Date.parse(b.uninstallDetectedAt ?? "") - Date.parse(a.uninstallDetectedAt ?? ""))
    .slice(0, 3);

  return (
    <div className="page">
      <PageHeader
        title="App History"
        subtitle="Remember the apps you've used."
        right={
          <>
            <Link to="/search" className="icon-btn" aria-label="Search apps">
              <Search size={19} />
            </Link>
            <Link to="/privacy" className="icon-btn" aria-label="Privacy">
              <ShieldCheck size={19} />
            </Link>
          </>
        }
      />

      <div className="page-body dashboard">
        {settings.demoMode ? (
          <Notice tone="demo" title="Demo mode is on">
            These are sample records kept in a separate database. They are never mixed with a real device
            history.
          </Notice>
        ) : null}

        {initError ? (
          <Notice tone="danger" title="Your saved history could not be opened">
            {initError}
          </Notice>
        ) : null}

        {!nativeAvailable && !settings.demoMode ? (
          <Notice tone="info" title="Device scanning needs the Android build">
            This window runs the App History interface, but Android only lets the native app read installed
            packages. No app data is invented here.
            <p className="notice-hint">Open Settings → Developer to explore with demo data.</p>
          </Notice>
        ) : null}

        <div className="stat-grid">
          <StatCard label="Total Apps Tracked" value={apps.length} icon={Package} tone="indigo" to="/search" />
          <StatCard label="Currently Installed" value={installed.length} icon={PackageCheck} tone="green" to="/installed" />
          <StatCard label="Previously Installed" value={uninstalled.length} icon={PackageX} tone="amber" to="/uninstalled" />
          <StatCard
            label="Recently Uninstalled"
            value={recentlyUninstalled.length}
            icon={Clock}
            tone="rose"
            to="/uninstalled"
          />
        </div>

        <section className="scan-card">
          <ScanButton />
          <div className="scan-meta">
            <span className="scan-meta-label">Last scan</span>
            <span className="scan-meta-value">
              {lastScan ? `${relativeTime(lastScan.at)} · ${formatDateTime(lastScan.at)}` : "Not scanned yet"}
            </span>
            {lastScan ? (
              <span className="scan-meta-sub">
                {lastScan.trigger === "auto" ? "Automatic check" : "Manual scan"} · {lastScan.detected} apps seen
                {lastScan.uninstalled > 0 ? ` · ${lastScan.uninstalled} marked uninstalled` : ""}
              </span>
            ) : null}
          </div>
        </section>

        {scanError ? (
          <Notice tone="danger" title="Scan could not be completed" onDismiss={dismissScanError}>
            {scanError}
          </Notice>
        ) : null}

        {scanWarning ? (
          <Notice tone="warning" title="Scan finished with a warning">
            {scanWarning}
          </Notice>
        ) : null}

        {lastScan?.visibility === "limited" && lastScan.source === "device" ? (
          <Notice tone="info" title="Limited app visibility">
            Android only lets App History see a subset of installed apps on this device, so this history may miss
            some apps.
          </Notice>
        ) : null}

        {!lastScan && apps.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Scan your device to create your app history."
            body="App History remembers what it detects, so an app shows up under Previously Installed once it is gone."
          />
        ) : null}

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Recently uninstalled</h2>
            {uninstalled.length > 0 ? (
              <Link to="/uninstalled" className="section-link">
                View all
              </Link>
            ) : null}
          </div>

          {latestUninstalled.length === 0 ? (
            <EmptyState icon={PackageX} title="No previously uninstalled apps found." />
          ) : (
            <div className="card-list">
              {latestUninstalled.map((app) => (
                <UninstalledCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </section>

        <p className="footnote">
          Deleted apps appear here after the next scan. Reinstall opens the app's Play Store listing — App History
          never installs or restores an app itself.
        </p>
      </div>
    </div>
  );
}
