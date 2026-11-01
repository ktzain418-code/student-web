import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppStoreProvider } from "./state/AppStore";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { applyTheme } from "./lib/theme";
import type { ThemeMode } from "./types";
import "./styles/theme.css";
import "./styles/layout.css";
import "./styles/components.css";

// Apply the saved theme before the first paint to avoid a light flash.
function bootTheme(): void {
  let mode: ThemeMode = "system";
  try {
    const raw = localStorage.getItem("apphistory.settings.v1");
    const parsed = raw ? (JSON.parse(raw) as { theme?: ThemeMode }) : null;
    if (parsed?.theme === "light" || parsed?.theme === "dark") mode = parsed.theme;
  } catch {
    /* fall back to the system theme */
  }
  applyTheme(mode);
}

bootTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppStoreProvider>
          <App />
        </AppStoreProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
