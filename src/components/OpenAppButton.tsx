import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import type { TrackedApp } from "../types";
import { openInstalledApp } from "../native/appLauncher";
import { useAppStore } from "../state/AppStore";

interface OpenAppButtonProps {
  app: TrackedApp;
  block?: boolean;
  label?: string;
}

/**
 * Launches an app Android currently reports as installed. It is never rendered
 * for an uninstalled app, and if Android says the package has no launch intent
 * (deleted since the last scan) the status is refreshed by a new scan.
 */
export function OpenAppButton({ app, block = false, label = "Open app" }: OpenAppButtonProps) {
  const { notify, scanNow } = useAppStore();
  const [busy, setBusy] = useState(false);

  if (app.status !== "INSTALLED") return null;

  async function handleOpen() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await openInstalledApp(app.packageName);
      if (result === "unsupported") {
        notify("Opening apps works in the Android build of App History, not in this preview.");
      } else if (result === "not-installed") {
        notify(`${app.appName} is no longer installed — scanning to update its status.`);
        void scanNow("manual");
      } else if (result === "failed") {
        notify(`Android could not open ${app.appName}.`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`btn btn-secondary btn-sm${block ? " btn-block" : ""}`}
      onClick={() => void handleOpen()}
      aria-busy={busy}
      aria-label={`Open ${app.appName}`}
    >
      {busy ? <Loader2 className="spin" size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
      {label}
    </button>
  );
}
