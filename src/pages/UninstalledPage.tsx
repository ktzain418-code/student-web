import { useMemo, useState } from "react";
import { PackageX, SearchX } from "lucide-react";
import { useAppStore } from "../state/AppStore";
import { PageHeader } from "../components/PageHeader";
import { SearchField } from "../components/SearchField";
import { FilterBar } from "../components/FilterBar";
import { UninstalledCard } from "../components/UninstalledCard";
import { EmptyState } from "../components/EmptyState";
import { ScanButton } from "../components/ScanButton";

const SORTS = [
  { value: "recent", label: "Recent" },
  { value: "name", label: "A–Z" },
];

export default function UninstalledPage() {
  const { apps } = useAppStore();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");

  const uninstalled = useMemo(() => apps.filter((app) => app.status === "UNINSTALLED"), [apps]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = uninstalled.filter((app) => {
      if (!needle) return true;
      return app.appName.toLowerCase().includes(needle) || app.packageName.toLowerCase().includes(needle);
    });
    return filtered.sort((a, b) =>
      sort === "name"
        ? a.appName.localeCompare(b.appName, undefined, { sensitivity: "base" })
        : Date.parse(b.uninstallDetectedAt ?? "") - Date.parse(a.uninstallDetectedAt ?? ""),
    );
  }, [uninstalled, query, sort]);

  return (
    <div className="page">
      <PageHeader title="Uninstalled Apps" subtitle={`${uninstalled.length} previously detected`} />

      <div className="page-body">
        <SearchField value={query} onChange={setQuery} placeholder="Search uninstalled apps" />

        {uninstalled.length > 0 ? (
          <FilterBar sortOptions={SORTS} sort={sort} onSortChange={setSort} />
        ) : null}

        {visible.length === 0 ? (
          uninstalled.length === 0 ? (
            <EmptyState
              icon={PackageX}
              title="No previously uninstalled apps found."
              body="Apps you remove from this phone appear here after a scan."
              action={<ScanButton />}
            />
          ) : (
            <EmptyState icon={SearchX} title="No matching apps" body="Try another name or package name." />
          )
        ) : (
          <>
            <p className="list-count">
              {visible.length} app{visible.length === 1 ? "" : "s"}
            </p>
            <div className="card-list">
              {visible.map((app) => (
                <UninstalledCard key={app.id} app={app} />
              ))}
            </div>
            <p className="footnote">
              Reinstall opens the Play Store listing when one exists. App History cannot install apps for you.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
