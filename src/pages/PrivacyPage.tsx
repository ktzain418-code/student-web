import { ShieldCheck } from "lucide-react";
import { useAppStore } from "../state/AppStore";
import { PageHeader } from "../components/PageHeader";
import { DataControls } from "../components/DataControls";
import { Notice } from "../components/Notice";

export default function PrivacyPage() {
  const { settings, acceptPrivacy, privacyAccepted } = useAppStore();

  return (
    <div className="page">
      <PageHeader title="Privacy" subtitle="How App History handles your data" back />

      <div className="page-body">
        <Notice tone="info" title="Plain summary">
          Everything App History knows lives on this device. There is no account and no upload.
        </Notice>

        <section className="card">
          <h2 className="card-title">What this app reads</h2>
          <p className="card-body-text">
            This app checks your device's accessible installed-app information to maintain your personal app
            history. Your app history should remain on this device unless the user explicitly enables cloud
            backup.
          </p>
          <p className="card-body-text">
            For each app it can see, App History stores the app name, package name, launcher icon, when it was
            first and last detected, and whether it later disappeared from the device.
          </p>
        </section>

        <section className="card">
          <h2 className="card-title">What is never collected</h2>
          <ul className="plain-list">
            <li>No contacts, messages, photos, files, location or usage statistics.</li>
            <li>No app data or contents — only the package-level facts listed above.</li>
            <li>No account, advertising identifier or analytics profile.</li>
            <li>No copy of your app list leaves the device in this version.</li>
          </ul>
        </section>

        <section className="card">
          <h2 className="card-title">Android visibility limits</h2>
          <p className="card-body-text">
            Android 11 and later restrict which installed apps any app may see. App History never claims to see
            apps that Android hides from it, and a scan that suddenly loses apps is treated as a visibility
            problem rather than an uninstall.
          </p>
          {settings.demoMode ? (
            <p className="card-body-text">
              Demo mode is active, so the records on screen are samples stored in a separate database.
            </p>
          ) : null}
        </section>

        <section className="card">
          <h2 className="card-title">Your controls</h2>
          <DataControls />
          {!privacyAccepted ? (
            <button type="button" className="btn btn-primary btn-block" onClick={acceptPrivacy}>
              Accept and continue
            </button>
          ) : null}
        </section>

        <section className="card">
          <h2 className="card-title">
            <ShieldCheck size={16} aria-hidden="true" /> Cloud backup
          </h2>
          <p className="card-body-text">
            Cloud backup is not available in this version. If it is added later, it will be opt-in and will
            require signing in — local storage stays the default.
          </p>
        </section>

        <p className="footnote">
          App History remembers apps this app previously detected. It cannot recover a deleted app.
        </p>
      </div>
    </div>
  );
}
