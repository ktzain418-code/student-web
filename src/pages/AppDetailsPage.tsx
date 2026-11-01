import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PackageSearch, Trash2 } from "lucide-react";
import { useAppStore } from "../state/AppStore";
import { PageHeader } from "../components/PageHeader";
import { AppIcon } from "../components/AppIcon";
import { StatusBadge } from "../components/StatusBadge";
import { ReinstallButton } from "../components/ReinstallButton";
import { OpenAppButton } from "../components/OpenAppButton";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { formatDateTime, formatDate, formatTime, formatLongDate } from "../lib/format";
import type { HistoryEventType } from "../types";

const EVENT_LABELS: Record<HistoryEventType, string> = {
  DETECTED: "App detected",
  UNINSTALLED: "App marked as uninstalled",
  REINSTALLED: "App detected again",
};

export default function AppDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apps, events, deleteApp, scanning } = useAppStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const app = apps.find((item) => item.id === id);

  const appEvents = useMemo(
    () => events.filter((event) => event.appId === id || (app && event.packageName === app.packageName)),
    [events, id, app],
  );

  /**
   * Dates come from the timeline so they survive a reinstall: the app row keeps
   * the latest uninstall date, and history keeps every earlier one.
   */
  const lastEventAt = (type: HistoryEventType): string | null => {
    const matches = appEvents.filter((event) => event.type === type);
    if (matches.length === 0) return null;
    return matches.reduce((latest, event) => (Date.parse(event.at) > Date.parse(latest) ? event.at : latest), matches[0].at);
  };
  const uninstalledAt = lastEventAt("UNINSTALLED") ?? app?.uninstallDetectedAt ?? null;
  const reinstalledAt = lastEventAt("REINSTALLED");

  if (!app) {
    return (
      <div className="page">
        <PageHeader title="App details" back />
        <div className="page-body">
          <EmptyState
            icon={PackageSearch}
            title="This app is not in your history"
            body="It may have been deleted from App History, or the link is out of date."
            action={
              <Link to="/" className="btn btn-primary">
                Back to dashboard
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  async function handleDelete() {
    if (!app) return;
    setBusy(true);
    try {
      await deleteApp(app.id);
      setConfirmDelete(false);
      navigate("/");
    } finally {
      setBusy(false);
    }
  }

  const installed = app.status === "INSTALLED";
  const limited = app.uninstallConfidence === "limited-visibility";

  return (
    <div className="page">
      <PageHeader title="App details" back />

      <div className="page-body">
        <section className="detail-hero">
          <AppIcon appName={app.appName} packageName={app.packageName} icon={app.icon} size={72} />
          <h2 className="detail-name">{app.appName}</h2>
          <p className="detail-package">{app.packageName}</p>
          <StatusBadge status={app.status} />
        </section>

        <section
          className={`detail-status ${installed ? "detail-status--installed" : "detail-status--uninstalled"}`}
          aria-label="Current status"
        >
          <div className="detail-status-head">
            <span className="detail-status-label">App status</span>
            <span className="detail-status-value">{installed ? "Installed" : "App uninstalled"}</span>
          </div>
          <p className="detail-status-note">
            {installed
              ? "Detected in the last scan. Open app launches it on this phone."
              : `Not found in the scan on ${formatDate(app.uninstallDetectedAt)}. Reinstall app opens the official Play Store listing for this package — App History never installs anything itself.`}
          </p>
          {installed ? (
            <OpenAppButton app={app} block label="Open app" />
          ) : (
            <ReinstallButton packageName={app.packageName} block label="Reinstall app" />
          )}
        </section>

        <section className="card">
          <dl className="meta-list">
            <div className="meta-row">
              <dt>Package name</dt>
              <dd className="mono">{app.packageName}</dd>
            </div>
            <div className="meta-row">
              <dt>Status</dt>
              <dd>{installed ? "Installed" : "Uninstalled"}</dd>
            </div>
            <div className="meta-row">
              <dt>First detected</dt>
              <dd>{formatDateTime(app.firstSeen)}</dd>
            </div>
            <div className="meta-row">
              <dt>Last detected</dt>
              <dd>{formatDateTime(app.lastSeen)}</dd>
            </div>
            {uninstalledAt ? (
              <div className="meta-row">
                <dt>Uninstalled</dt>
                <dd>{formatDateTime(uninstalledAt)}</dd>
              </div>
            ) : null}
            {reinstalledAt ? (
              <div className="meta-row">
                <dt>Reinstalled</dt>
                <dd>{formatDateTime(reinstalledAt)}</dd>
              </div>
            ) : null}
            <div className="meta-row">
              <dt>App type</dt>
              <dd>{app.isSystemApp ? "System app" : "User app"}</dd>
            </div>
          </dl>
          {limited ? (
            <p className="app-footnote">
              Android package visibility was limited when this app disappeared from the scan, so it may still be
              installed but hidden from App History.
            </p>
          ) : null}
        </section>

        <section className="section">
          <div className="section-head">
            <h2 className="section-title">History for this app</h2>
            {scanning ? <span className="section-note">scanning…</span> : null}
          </div>

          {appEvents.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No events recorded for this app yet" />
          ) : (
            <ul className="timeline timeline--compact">
              {appEvents.map((event) => (
                <li className={`timeline-item timeline-item--${event.type.toLowerCase()}`} key={event.id}>
                  <span className="timeline-dot" aria-hidden="true" />
                  <div className="timeline-body">
                    <span className="timeline-label">{EVENT_LABELS[event.type]}</span>
                    <span className="timeline-package">
                      {formatLongDate(event.at)} · {formatTime(event.at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <button
            type="button"
            className="btn btn-danger-ghost btn-block"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={17} aria-hidden="true" />
            Delete history for this app
          </button>
          <p className="footnote">Deleting removes this app and its events from App History only.</p>
        </section>

        <p className="footnote">
          Status changes only when a scan runs — App History is not notified the instant an app is removed. A
          reinstall is done in the Play Store, and the next scan marks the app installed again.
        </p>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${app.appName}?`}
        confirmLabel="Delete"
        tone="danger"
        busy={busy}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
        body={
          <p>
            This removes {app.appName} ({app.packageName}) and every recorded event for it from this device. It
            will appear again if a later scan detects it.
          </p>
        }
      />
    </div>
  );
}
