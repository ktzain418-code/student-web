import { Route, Routes } from "react-router-dom";
import { useAppStore } from "./state/AppStore";
import { AppShell } from "./components/AppShell";
import { PrivacyGate } from "./pages/PrivacyGate";
import { SplashScreen } from "./components/SplashScreen";
import DashboardPage from "./pages/DashboardPage";
import InstalledPage from "./pages/InstalledPage";
import UninstalledPage from "./pages/UninstalledPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import AppDetailsPage from "./pages/AppDetailsPage";
import SearchPage from "./pages/SearchPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const { ready, privacyAccepted } = useAppStore();

  if (!ready) return <SplashScreen />;
  if (!privacyAccepted) return <PrivacyGate />;

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/installed" element={<InstalledPage />} />
        <Route path="/uninstalled" element={<UninstalledPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/app/:id" element={<AppDetailsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
