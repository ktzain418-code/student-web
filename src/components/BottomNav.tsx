import { NavLink } from "react-router-dom";
import { History, Home, LayoutGrid, PackageX, Settings } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/installed", label: "Installed", icon: LayoutGrid, end: false },
  { to: "/uninstalled", label: "Uninstalled", icon: PackageX, end: false },
  { to: "/history", label: "History", icon: History, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `nav-item${isActive ? " is-active" : ""}`}
        >
          <span className="nav-icon">
            <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
