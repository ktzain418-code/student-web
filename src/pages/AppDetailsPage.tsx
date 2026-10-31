import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PackageSearch, Trash2 } from "lucide-react";
import { useAppStore } from "../state/AppStore";
import { PageHeader } from "../components/PageHeader";
import { AppIcon } from "../components/AppIcon";
import { StatusBadge } from "../components/StatusBadge";
import { ReinstallButton } from "../components/ReinstallButton";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { formatDateTime, formatTime, formatLongDate } from "../lib/format";
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

        <section className="card">
          <dl className="meta-list">
            <div className="meta-row">
              <dt>Package name</dt>
              <dd className="mono">{app.packageName}</dd>
            </div>
            <div className="meta-row">
              <dt>Status</dt>
              <dd>{app.status === "INSTALLED" ? "Installed" : "Uninstalled"}</dd>
            </div>
            <div className="meta-row">
              <dt>First seen</dt>
              <dd>{formatDateTime(app.firstSeen)}</dd>
            </div>
            <div className="meta-row">
              <dt>Last seen</dt>
              <dd>{formatDateTime(app.lastSeen)}</dd>
            </div>
            {app.status === "UNINSTALLED" ? (
              <div className="meta-row">
                <dt>Uninstalled detected</dt>
                <dd>{formatDateTime(app.uninstallDetectedAt)}</dd>
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

        {app.status === "UNINSTALLED" ? (
          <section className="card detail-reinstall">
            <h3 className="card-title">Reinstall</h3>
            <p className="card-body-text">
              Opens the Play Store listing for this package. App History cannot install or restore an app itself.
            </p>
            <ReinstallButton packageName={app.packageName} block label="Open Play Store" />
          </section>
        ) : null}

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
          App History remembers apps this app previously detected. It cannot recover a deleted app — the record
          above is simply what was on this device when it was last scanned.
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
