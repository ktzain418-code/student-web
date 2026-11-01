import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Toast } from "./Toast";
import { useAppStore } from "../state/AppStore";

export function AppShell() {
  const { notice } = useAppStore();
  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNav />
      <Toast message={notice} />
    </div>
  );
}
