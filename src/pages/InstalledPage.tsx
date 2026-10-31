import { useMemo, useState } from "react";
import { LayoutGrid, SearchX } from "lucide-react";
import { useAppStore } from "../state/AppStore";
import { PageHeader } from "../components/PageHeader";
import { SearchField } from "../components/SearchField";
import { FilterBar } from "../components/FilterBar";
import { AppCard } from "../components/AppCard";
import { EmptyState } from "../components/EmptyState";
import { ScanButton } from "../components/ScanButton";

const FILTERS = [
  { value: "all", label: "All apps" },
  { value: "user", label: "User apps" },
  { value: "system", label: "System apps" },
];

const SORTS = [
  { value: "name", label: "A–Z" },
  { value: "recent", label: "Recent" },
];

export default function InstalledPage() {
  const { apps, scanning } = useAppStore();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");
  const [filter, setFilter] = useState("all");

  const installed = useMemo(() => apps.filter((app) => app.status === "INSTALLED"), [apps]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = installed.filter((app) => {
      if (filter === "user" && app.isSystemApp) return false;
      if (filter === "system" && !app.isSystemApp) return false;
      if (!needle) return true;
      return (
        app.appName.toLowerCase().includes(needle) || app.packageName.toLowerCase().includes(needle)
      );
    });
    return filtered.sort((a, b) =>
      sort === "recent"
        ? Date.parse(b.lastSeen) - Date.parse(a.lastSeen)
        : a.appName.localeCompare(b.appName, undefined, { sensitivity: "base" }),
    );
  }, [installed, query, sort, filter]);

  return (
    <div className="page">
      <PageHeader title="Installed" subtitle={`${installed.length} currently detected`} />

      <div className="page-body">
        <SearchField value={query} onChange={setQuery} placeholder="Search installed apps" />
        <FilterBar
          chips={FILTERS}
          activeChip={filter}
          onChipChange={setFilter}
          sortOptions={SORTS}
          sort={sort}
          onSortChange={setSort}
        />

        {visible.length === 0 ? (
          installed.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title="Nothing detected yet"
              body="Scan your device to create your app history."
              action={<ScanButton />}
            />
          ) : (
            <EmptyState
              icon={SearchX}
              title="No matching apps"
              body="Try another name or package, or clear the filters."
            />
          )
        ) : (
          <>
            <p className="list-count">
              {visible.length} app{visible.length === 1 ? "" : "s"}
              {scanning ? " · scanning…" : ""}
            </p>
            <div className="card-list">
              {visible.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
