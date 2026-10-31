import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import { useAppStore } from "../state/AppStore";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { FilterBar } from "../components/FilterBar";
import { AppIcon } from "../components/AppIcon";
import { ScanButton } from "../components/ScanButton";
import { dayKey, formatLongDate, formatTime } from "../lib/format";
import type { HistoryEventType } from "../types";

const FILTERS = [
  { value: "all", label: "Everything" },
  { value: "DETECTED", label: "Detected" },
  { value: "UNINSTALLED", label: "Uninstalled" },
  { value: "REINSTALLED", label: "Installed again" },
];

const LABELS: Record<HistoryEventType, string> = {
  DETECTED: "App detected",
  UNINSTALLED: "App marked as uninstalled",
  REINSTALLED: "App detected again",
};

export default function HistoryPage() {
  const { events, apps } = useAppStore();
  const [filter, setFilter] = useState("all");

  const appById = useMemo(() => new Map(apps.map((app) => [app.id, app])), [apps]);

  const filtered = useMemo(
    () => (filter === "all" ? events : events.filter((event) => event.type === filter)),
    [events, filter],
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const event of filtered) {
      const key = dayKey(event.at);
      const bucket = map.get(key);
      if (bucket) bucket.push(event);
      else map.set(key, [event]);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="page">
      <PageHeader title="History" subtitle="Chronological record of detected changes" />

      <div className="page-body">
        {events.length > 0 ? <FilterBar chips={FILTERS} activeChip={filter} onChipChange={setFilter} /> : null}

        {filtered.length === 0 ? (
          <EmptyState
            icon={History}
            title={events.length === 0 ? "No history yet" : "Nothing in this filter"}
            body={
              events.length === 0
                ? "Scan your device to create your app history. Every scan adds what it detected or lost."
                : "Try a different event type."
            }
            action={events.length === 0 ? <ScanButton /> : undefined}
          />
        ) : (
          groups.map(([day, dayEvents]) => (
            <section className="history-group" key={day}>
              <h2 className="history-day">{formatLongDate(dayEvents[0].at)}</h2>
              <ul className="timeline">
                {dayEvents.map((event) => {
                  const app = appById.get(event.appId);
                  return (
                    <li className={`timeline-item timeline-item--${event.type.toLowerCase()}`} key={event.id}>
                      <span className="timeline-dot" aria-hidden="true" />
                      {app ? (
                        <AppIcon
                          appName={app.appName}
                          packageName={app.packageName}
                          icon={app.icon}
                          size={36}
                        />
                      ) : (
                        <span className="app-icon app-icon--letter" style={{ width: 36, height: 36 }} aria-hidden="true">
                          ?
                        </span>
                      )}
                      <div className="timeline-body">
                        <Link to={app ? `/app/${app.id}` : "/"} className="timeline-app">
                          {event.appName}
                        </Link>
                        <span className="timeline-label">{LABELS[event.type]}</span>
                        <span className="timeline-package">{event.packageName}</span>
                      </div>
                      <span className="timeline-time">{formatTime(event.at)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
