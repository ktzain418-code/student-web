import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SearchX, Sparkles } from "lucide-react";
import { useAppStore } from "../state/AppStore";
import { PageHeader } from "../components/PageHeader";
import { SearchField } from "../components/SearchField";
import { AppIcon } from "../components/AppIcon";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState } from "../components/EmptyState";
import { formatDate } from "../lib/format";
import { ChevronRight } from "lucide-react";

export default function SearchPage() {
  const { apps } = useAppStore();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!needle) return [];
    return apps
      .filter(
        (app) => app.appName.toLowerCase().includes(needle) || app.packageName.toLowerCase().includes(needle),
      )
      .sort((a, b) => a.appName.localeCompare(b.appName, undefined, { sensitivity: "base" }));
  }, [apps, needle]);

  return (
    <div className="page">
      <PageHeader title="Search" subtitle="All tracked apps, installed or not" back />

      <div className="page-body">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Instagram or com.instagram.android"
          autoFocus
          label="Search all apps"
        />

        {!needle ? (
          <EmptyState
            icon={Sparkles}
            title="Search your whole app history"
            body="Type an app name or a package name. Results include apps that are installed now and apps App History saw before."
          />
        ) : matches.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No apps found"
            body="Nothing in your history matches that name or package. Only apps App History has detected can be found."
          />
        ) : (
          <>
            <p className="list-count">
              {matches.length} result{matches.length === 1 ? "" : "s"}
            </p>
            <div className="card-list">
              {matches.map((app) => (
                <Link to={`/app/${app.id}`} className="app-card" key={app.id}>
                  <AppIcon appName={app.appName} packageName={app.packageName} icon={app.icon} />
                  <div className="app-card-body">
                    <div className="app-card-top">
                      <span className="app-name">{app.appName}</span>
                      <StatusBadge status={app.status} />
                    </div>
                    <span className="app-package">{app.packageName}</span>
                    <span className="app-meta">
                      {app.status === "INSTALLED"
                        ? `Last detected ${formatDate(app.lastSeen)}`
                        : `Uninstalled ${formatDate(app.uninstallDetectedAt)}`}
                    </span>
                  </div>
                  <ChevronRight className="app-chevron" size={18} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
