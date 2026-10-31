import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "indigo" | "green" | "amber" | "rose";
  to: string;
}

export function StatCard({ label, value, icon: Icon, tone, to }: StatCardProps) {
  return (
    <Link to={to} className={`stat-card stat-card--${tone}`}>
      <span className="stat-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </Link>
  );
}
