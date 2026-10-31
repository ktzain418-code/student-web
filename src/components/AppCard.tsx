import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { TrackedApp } from "../types";
import { formatDate } from "../lib/format";
import { AppIcon } from "./AppIcon";
import { StatusBadge } from "./StatusBadge";

export function AppCard({ app }: { app: TrackedApp }) {
  return (
    <Link to={`/app/${app.id}`} className="app-card">
      <AppIcon appName={app.appName} packageName={app.packageName} icon={app.icon} />
      <div className="app-card-body">
        <div className="app-card-top">
          <span className="app-name">{app.appName}</span>
          <StatusBadge status={app.status} />
        </div>
        <span className="app-package">{app.packageName}</span>
        <span className="app-meta">Last detected {formatDate(app.lastSeen)}</span>
      </div>
      <ChevronRight className="app-chevron" size={18} aria-hidden="true" />
    </Link>
  );
}
