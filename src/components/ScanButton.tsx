import { Loader2, RefreshCw } from "lucide-react";
import { useAppStore } from "../state/AppStore";

export function ScanButton() {
  const { scanNow, scanning, nativeAvailable } = useAppStore();
  const disabled = scanning || !nativeAvailable;

  return (
    <div className="scan-block">
      <button
        type="button"
        className="scan-btn"
        onClick={() => void scanNow("manual")}
        disabled={disabled}
        aria-busy={scanning}
      >
        {scanning ? <Loader2 className="spin" size={22} aria-hidden="true" /> : <RefreshCw size={22} aria-hidden="true" />}
        <span>{scanning ? "Scanning…" : "SCAN NOW"}</span>
      </button>
      {!nativeAvailable ? (
        <p className="scan-hint">Scanning requires the native Android build of App History.</p>
      ) : null}
    </div>
  );
}
