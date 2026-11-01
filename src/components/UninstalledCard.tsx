import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { TrackedApp } from "../types";
import { formatDate } from "../lib/format";
import { AppIcon } from "./AppIcon";
import { StatusBadge } from "./StatusBadge";
import { ReinstallButton } from "./ReinstallButton";

export function UninstalledCard({ app }: { app: TrackedApp }) {
  const limited = app.uninstallConfidence === "limited-visibility";
  return (
    <article className="app-card app-card--stacked">
      <Link to={`/app/${app.id}`} className="app-card-main">
        <AppIcon appName={app.appName} packageName={app.packageName} icon={app.icon} />
        <div className="app-card-body">
          <div className="app-card-top">
            <span className="app-name">{app.appName}</span>
            <StatusBadge status={app.status} />
          </div>
          <span className="app-package">{app.packageName}</span>
        </div>
        <ChevronRight className="app-chevron" size={18} aria-hidden="true" />
      </Link>

      <dl className="app-date-grid app-date-grid--triple">
        <div>
          <dt>First detected</dt>
          <dd>{formatDate(app.firstSeen)}</dd>
        </div>
        <div>
          <dt>Last detected</dt>
          <dd>{formatDate(app.lastSeen)}</dd>
        </div>
        <div>
          <dt>Uninstalled detected</dt>
          <dd>{formatDate(app.uninstallDetectedAt)}</dd>
        </div>
      </dl>

      {limited ? (
        <p className="app-footnote">
          Android package visibility was limited during this scan, so this app may still be installed but hidden
          from App History.
        </p>
      ) : null}

      <div className="app-card-actions">
        <ReinstallButton packageName={app.packageName} />
        <Link to={`/app/${app.id}`} className="btn btn-ghost btn-sm">
          Details
        </Link>
      </div>
    </article>
  );
}
