import { ShieldCheck } from "lucide-react";
import { useAppStore } from "../state/AppStore";

/**
 * First-run privacy explanation. Scanning cannot start before the user has read
 * this and continued, so no device data is read without consent.
 */
export function PrivacyGate() {
  const { acceptPrivacy } = useAppStore();

  return (
    <div className="gate">
      <div className="gate-inner">
        <div className="gate-brand">
          <span className="gate-mark" aria-hidden="true">
            <ShieldCheck size={26} />
          </span>
          <div>
            <h1 className="gate-title">App History</h1>
            <p className="gate-tagline">Remember the apps you've used.</p>
          </div>
        </div>

        <div className="gate-card">
          <h2 className="gate-card-title">Before your first scan</h2>
          <p className="gate-text">
            This app checks your device's accessible installed-app information to maintain your personal app
            history. Your app history should remain on this device unless the user explicitly enables cloud
            backup.
          </p>
          <ul className="gate-list">
            <li>App name, package name, icon and the dates it was detected.</li>
            <li>Stored locally on this device — no account, no upload.</li>
            <li>You can clear the history or delete everything at any time.</li>
            <li>Cloud backup is not enabled in this version.</li>
          </ul>
        </div>

        <div className="gate-note">
          <strong>Important:</strong> App History remembers apps that this app previously detected. It cannot
          recover or reinstall a deleted app for you.
        </div>

        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={acceptPrivacy}>
          Continue
        </button>
        <p className="gate-footnote">You can review this any time in Settings → Privacy.</p>
      </div>
    </div>
  );
}
