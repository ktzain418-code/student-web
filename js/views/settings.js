import { state, lastScan, isNativeAvailable } from '../state.js';
import { esc, fmtDate, fmtTime, icon } from '../ui.js';

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function renderSettings(root) {
  const scan = lastScan();
  const native = isNativeAvailable();

  root.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">Preferences</span>
      <h1 class="page-title">Settings</h1>
      <p class="page-sub">Privacy, appearance and Android integration.</p>
    </div>

    <section class="settings-group">
      <h2>Appearance</h2>
      <div class="card">
        <div class="segmented theme-seg" role="group" aria-label="Theme">
          ${THEMES.map(
            (theme) =>
              `<button type="button" data-action="set-theme" data-theme-value="${theme.value}" aria-pressed="${
                state.settings.theme === theme.value
              }">${theme.label}</button>`
          ).join('')}
        </div>
        <p class="page-sub" style="margin-top: 10px; font-size: 12.5px">System follows your device appearance.</p>
      </div>
    </section>

    <section class="settings-group">
      <h2>Privacy &amp; data</h2>
      <div class="settings-card">
        <div class="settings-row" style="cursor: default">
          <div class="row-text">
            <strong>Stored on this device</strong>
            <span>Your app history is never uploaded. There is no account and no cloud backup.</span>
          </div>
        </div>
        <button class="settings-row" type="button" data-action="privacy">
          <div class="row-text">
            <strong>Privacy details</strong>
            <span>What is read and what is stored</span>
          </div>
          <span class="chev">${icon('chevron')}</span>
        </button>
        <button class="settings-row" type="button" data-action="clear-history">
          <div class="row-text">
            <strong>Clear history</strong>
            <span>Keep app records, remove the activity timeline</span>
          </div>
          <span class="chev">${icon('chevron')}</span>
        </button>
        <button class="settings-row danger" type="button" data-action="delete-all">
          <div class="row-text">
            <strong>Delete all data</strong>
            <span>Remove all app records and activity from this device</span>
          </div>
          <span class="chev">${icon('chevron')}</span>
        </button>
      </div>
    </section>

    <section class="settings-group">
      <h2>Android integration</h2>
      <div class="settings-card">
        <div class="settings-row" style="cursor: default">
          <div class="row-text">
            <strong>${native ? 'Native module connected' : 'Native module not connected'}</strong>
            <span>${
              native
                ? 'Installed apps are read with Android package-manager APIs.'
                : 'This build runs in a browser preview, so Android package access is unavailable.'
            }</span>
          </div>
          <span class="badge ${native ? 'badge-installed' : 'badge-uninstalled'}">${
            native ? 'Ready' : 'Unavailable'
          }</span>
        </div>
        <button class="settings-row" type="button" data-action="integration">
          <div class="row-text">
            <strong>Package visibility limitations</strong>
            <span>Why some apps may not be visible to the scanner</span>
          </div>
          <span class="chev">${icon('chevron')}</span>
        </button>
      </div>
    </section>

    <section class="settings-group">
      <h2>Development</h2>
      <div class="settings-card">
        <button class="settings-row" type="button" data-action="toggle-demo">
          <div class="row-text">
            <strong>Demo mode</strong>
            <span>Sample data for testing the interface. Never used in production.</span>
          </div>
          <span class="switch" role="switch" aria-checked="${state.settings.demoMode}" aria-label="Demo mode"></span>
        </button>
      </div>
    </section>

    <section class="settings-group">
      <h2>About</h2>
      <div class="settings-card">
        <div class="settings-row" style="cursor: default">
          <div class="row-text">
            <strong>App History</strong>
            <span>Version 1.0.0 · Remember the apps you've used.</span>
          </div>
        </div>
        <div class="settings-row" style="cursor: default">
          <div class="row-text">
            <strong>Last scan</strong>
            <span>${scan ? `${esc(fmtDate(scan.at))} at ${esc(fmtTime(scan.at))}` : 'No scan yet'}</span>
          </div>
        </div>
      </div>
    </section>

    <p class="note">
      <strong>App History remembers apps that this app previously detected.</strong>
      It cannot restore or recover a deleted application. The Reinstall button only opens the Google
      Play Store listing when one is available.
    </p>
  `;
}
