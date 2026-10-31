import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { openPlayStoreListing } from "../native/playStore";
import { useAppStore } from "../state/AppStore";
import { ConfirmDialog } from "./ConfirmDialog";

interface ReinstallButtonProps {
  packageName: string;
  block?: boolean;
  label?: string;
}

/**
 * Opens the Play Store listing for a package. It never installs anything and
 * says so when no listing can be opened.
 */
export function ReinstallButton({ packageName, block = false, label = "Reinstall" }: ReinstallButtonProps) {
  const { notify } = useAppStore();
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  async function handleOpen() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await openPlayStoreListing(packageName);
      if (result === "unavailable") setUnavailable(true);
      else if (result === "web-fallback") notify("Opened the Play Store listing in your browser.");
    } finally {
      setBusy(false);
    }
  }

  async function copyPackageName() {
    try {
      await navigator.clipboard.writeText(packageName);
      notify("Package name copied.");
    } catch {
      notify(`Package name: ${packageName}`);
    }
    setUnavailable(false);
  }

  return (
    <>
      <button
        type="button"
        className={`btn btn-primary btn-sm${block ? " btn-block" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          void handleOpen();
        }}
        aria-busy={busy}
      >
        {busy ? <Loader2 className="spin" size={15} aria-hidden="true" /> : <ExternalLink size={15} aria-hidden="true" />}
        {label}
      </button>

      <ConfirmDialog
        open={unavailable}
        title="Play Store listing unavailable"
        tone="primary"
        confirmLabel="Copy package name"
        cancelLabel="Close"
        onConfirm={() => void copyPackageName()}
        onCancel={() => setUnavailable(false)}
        body={
          <>
            <p>
              App History could not open a Play Store listing for <strong>{packageName}</strong>. Nothing was
              installed or restored.
            </p>
            <p>
              You can search for the app by name in the Play Store. Apps that were never distributed on the Play
              Store have no listing at all.
            </p>
          </>
        }
      />
    </>
  );
}
