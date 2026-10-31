import { icon } from '../ui.js';

export function renderPrivacyGate(root, onAccept) {
  root.innerHTML = `
    <section class="gate">
      <span class="gate-icon">${icon('shield')}</span>
      <h1>Your app history stays on your device</h1>
      <p class="lead">Before the first scan, here is exactly what App History reads and saves.</p>

      <blockquote class="quote">
        “This app checks your device's accessible installed-app information to maintain your personal
        app history. Your app history should remain on this device unless the user explicitly enables
        cloud backup.”
      </blockquote>

      <ul class="checklist">
        <li>${icon('check')}<span><strong>Reads:</strong> accessible app names, package names and icons, plus detection dates.</span></li>
        <li>${icon('check')}<span><strong>Never reads:</strong> contacts, messages, accounts, files or app usage.</span></li>
        <li>${icon('check')}<span><strong>Stored locally:</strong> the history lives in this device's local database — nothing is uploaded and there is no account.</span></li>
        <li>${icon('check')}<span><strong>Limited by Android:</strong> package visibility rules mean some installed apps may never be visible to this app.</span></li>
      </ul>

      <p class="note">
        App History remembers apps that this app previously detected. It cannot recover or restore a
        deleted app — it can only show the previous record and open a Play Store listing when available.
      </p>

      <button class="btn btn-primary btn-block" type="button" id="acceptPrivacy">
        ${icon('check')}I understand — continue
      </button>
    </section>
  `;

  root.querySelector('#acceptPrivacy')?.addEventListener('click', onAccept);
}
