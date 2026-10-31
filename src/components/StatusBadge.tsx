import type { AppStatus } from "../types";

export function StatusBadge({ status }: { status: AppStatus }) {
  const installed = status === "INSTALLED";
  return (
    <span className={`badge ${installed ? "badge--installed" : "badge--uninstalled"}`}>
      <span className="badge-dot" aria-hidden="true" />
      {installed ? "Installed" : "Uninstalled"}
    </span>
  );
}
