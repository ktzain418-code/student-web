import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Eraser, ShieldCheck, Trash2 } from "lucide-react";
import { useAppStore } from "../state/AppStore";
import { ConfirmDialog } from "./ConfirmDialog";

export function DataControls() {
  const { clearHistory, deleteAllData, settings } = useAppStore();
  const [dialog, setDialog] = useState<"clear" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: "clear" | "delete") {
    setBusy(true);
    try {
      if (action === "clear") await clearHistory();
      else await deleteAllData();
    } finally {
      setBusy(false);
      setDialog(null);
    }
  }

  const scope = useMemo(
    () => (settings.demoMode ? "the demo database" : "this device"),
    [settings.demoMode],
  );

  return (
    <div className="control-list">
      <button type="button" className="control-row" onClick={() => setDialog("clear")}>
        <span className="control-icon" aria-hidden="true">
          <Eraser size={18} />
        </span>
        <span className="control-text">
          <span className="control-label">Clear History</span>
          <span className="control-description">Remove the timeline, keep tracked apps</span>
        </span>
        <ChevronRight size={17} className="control-chevron" aria-hidden="true" />
      </button>

      <button type="button" className="control-row control-row--danger" onClick={() => setDialog("delete")}>
        <span className="control-icon" aria-hidden="true">
          <Trash2 size={18} />
        </span>
        <span className="control-text">
          <span className="control-label">Delete All Data</span>
          <span className="control-description">Erase every app, event and scan record</span>
        </span>
        <ChevronRight size={17} className="control-chevron" aria-hidden="true" />
      </button>

      <ConfirmDialog
        open={dialog === "clear"}
        title="Clear history?"
        confirmLabel="Clear history"
        busy={busy}
        onCancel={() => setDialog(null)}
        onConfirm={() => void run("clear")}
        body={
          <p>
            This removes every timeline event stored in {scope}. Tracked apps keep their current status and
            first-detected dates, so nothing reappears as uninstalled.
          </p>
        }
      />

      <ConfirmDialog
        open={dialog === "delete"}
        title="Delete all data?"
        confirmLabel="Delete everything"
        tone="danger"
        busy={busy}
        onCancel={() => setDialog(null)}
        onConfirm={() => void run("delete")}
        body={
          <p>
            This permanently erases the app history stored in {scope}. It cannot be undone, and App History will
            start over with the next scan.
          </p>
        }
      />

      {settings.demoMode ? (
        <p className="footnote">Demo data lives in its own database and never touches a real device history.</p>
      ) : null}

      <Link to="/privacy" className="control-row">
        <span className="control-icon" aria-hidden="true">
          <ShieldCheck size={18} />
        </span>
        <span className="control-text">
          <span className="control-label">Privacy Settings</span>
          <span className="control-description">What is stored and what is never collected</span>
        </span>
      </Link>
    </div>
  );
}
