import { Database, FlaskConical, Smartphone } from "lucide-react";
import { useAppStore } from "../state/AppStore";
import { PageHeader } from "../components/PageHeader";
import { ToggleRow } from "../components/Toggle";
import { Notice } from "../components/Notice";
import { DataControls } from "../components/DataControls";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useState } from "react";
import { relativeTime } from "../lib/format";
import type { ThemeMode } from "../types";

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsPage() {
  const { settings, updateSettings, lastScan, nativeAvailable, resetDemo } = useAppStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  const scanStatus = settings.demoMode
    ? "Demo provider"
    : nativeAvailable
      ? "Available on this build"
      : "Needs the Android build";

  return (
    <div className="page">
      <PageHeader title="Settings" subtitle="App History" />

      <div className="page-body">
        <section className="card">
          <h2 className="card-title">Appearance</h2>
          <div className="segmented segmented--wide" role="group" aria-label="Theme">
            {THEMES.map((theme) => (
              <button
                key={theme.value}
                type="button"
                className={`segmented-btn${settings.theme === theme.value ? " is-active" : ""}`}
                aria-pressed={settings.theme === theme.value}
                onClick={() => updateSettings({ theme: theme.value })}
              >
                {theme.label}
              </button>
            ))}
          </div>
          <p className="card-hint">System follows your Android light or dark setting.</p>
        </section>

        <section className="card">
          <h2 className="card-title">Scanning</h2>
          <ToggleRow
            checked={settings.autoScan}
            onChange={(checked) => updateSettings({ autoScan: checked })}
            label="Check automatically when the app opens"
            description="At most once every 6 hours, so the battery is not drained."
          />
          <div className="meta-row meta-row--plain">
            <dt>Last scan</dt>
            <dd>{lastScan ? relativeTime(lastScan.at) : "Not scanned yet"}</dd>
          </div>
          <div className="meta-row meta-row--plain">
            <dt>Device scanning</dt>
            <dd>{scanStatus}</dd>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Privacy</h2>
          <p className="card-body-text">
            App History reads only the installed-app information your device allows, and keeps the history on this
            device. Nothing is uploaded.
          </p>
          <DataControls />
        </section>

        <section className="card">
          <h2 className="card-title">
            <FlaskConical size={16} aria-hidden="true" /> Developer
          </h2>
          <ToggleRow
            checked={settings.demoMode}
            onChange={(checked) => updateSettings({ demoMode: checked })}
            label="Demo mode"
            description="Sample apps for testing the interface without a device. Stored in a separate database."
          />
          {settings.demoMode ? (
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => setConfirmReset(true)}
            >
              Reset demo scenario
            </button>
          ) : null}
        </section>

        <section className="card about">
          <h2 className="card-title">About</h2>
          <div className="about-row">
            <span className="about-icon" aria-hidden="true">
              <Smartphone size={17} />
            </span>
            <div>
              <p className="about-label">App History 1.0.0</p>
              <p className="about-sub">Remember the apps you've used.</p>
            </div>
          </div>
          <div className="about-row">
            <span className="about-icon" aria-hidden="true">
              <Database size={17} />
            </span>
            <div>
              <p className="about-label">On-device storage</p>
              <p className="about-sub">No account, no server, no cloud backup in this version.</p>
            </div>
          </div>
          {!nativeAvailable && !settings.demoMode ? (
            <Notice tone="warning" title="Native Android module required">
              Reading installed packages needs the Android build with the App History native module. This window
              only shows the interface.
            </Notice>
          ) : null}
          <p className="footnote">
            App History remembers apps this app previously detected. It cannot recover or restore a deleted app.
          </p>
        </section>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo scenario?"
        confirmLabel="Reset"
        tone="danger"
        busy={busy}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setBusy(true);
          void resetDemo().finally(() => {
            setBusy(false);
            setConfirmReset(false);
          });
        }}
        body={<p>Clears the demo database and makes the next demo scan start from the full sample list again.</p>}
      />
    </div>
  );
}
