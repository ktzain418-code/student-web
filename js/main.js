// App shell: routing, global actions and the scan / data workflows.

import {
  state,
  loadState,
  reloadData,
  updateSettings,
  findApp,
  isNativeAvailable,
} from './state.js';
import * as db from './db.js';
import { applyTheme, nextThemeMode } from './theme.js';
import { performScan } from './scan.js';
import { openPlayStore } from './native.js';
import { seedDemoData } from './demo.js';
import { openSheet, confirmSheet, toast, copyText, icon, esc } from './ui.js';
import { renderPrivacyGate } from './views/privacy.js';
import { renderHome } from './views/home.js';
import { renderInstalled, renderUninstalled } from './views/lists.js';
import { renderHistory } from './views/history.js';
import { renderSettings } from './views/settings.js';
import { renderDetails } from './views/details.js';

const root = () => document.getElementById('view');

function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const parts = raw.split('?')[0].split('/').filter(Boolean);
  try {
    return {
      name: parts[0] ? decodeURIComponent(parts[0]) : 'home',
      param: parts[1] ? decodeURIComponent(parts[1]) : null,
    };
  } catch (error) {
    return { name: 'home', param: null };
  }
}

function navigate(hash) {
  if (location.hash === hash) {
    render();
    return;
  }
  location.hash = hash;
}

const TITLES = {
  home: 'Dashboard',
  installed: 'Currently Installed',
  uninstalled: 'Uninstalled Apps',
  history: 'History',
  settings: 'Settings',
  app: 'App Details',
};

function updateNav(name) {
  document.querySelectorAll('.nav-item').forEach((item) => {
    const active = item.dataset.nav === name;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
}

function renderBanner() {
  const banner = document.getElementById('statusBanner');
  if (!banner) return;

  if (state.settings.demoMode) {
    banner.className = 'banner banner-warn';
    banner.innerHTML = `${icon('info')}<span><strong>Demo mode</strong> — sample apps for development testing. No device data is used.</span>`;
    return;
  }

  if (!isNativeAvailable()) {
    banner.className = 'banner banner-info';
    banner.innerHTML = `${icon('info')}<span><strong>UI preview</strong> — the native Android module is not connected here, so device apps cannot be read. Enable Demo mode in Settings to explore the interface.</span>`;
    return;
  }

  banner.className = 'banner hidden';
  banner.innerHTML = '';
}

let lastKey = '';

async function render() {
  const container = root();
  if (!container) return;

  applyTheme(state.settings.theme);
  const route = parseRoute();
  const nav = document.getElementById('bottomNav');

  if (!state.settings.consent) {
    nav?.classList.add('hidden');
    renderPrivacyGate(container, acceptPrivacy);
    document.title = 'App History — Remember the apps you’ve used.';
    return;
  }

  nav?.classList.remove('hidden');
  renderBanner();

  const key = `${route.name}:${route.param || ''}`;
  if (key !== lastKey) window.scrollTo(0, 0);
  lastKey = key;

  switch (route.name) {
    case 'installed':
      renderInstalled(container);
      break;
    case 'uninstalled':
      renderUninstalled(container);
      break;
    case 'history':
      renderHistory(container);
      break;
    case 'settings':
      renderSettings(container);
      break;
    case 'app':
      await renderDetails(container, route.param);
      break;
    default:
      renderHome(container);
  }

  updateNav(route.name);
  document.title = `${TITLES[route.name] || 'Dashboard'} · App History`;
}

async function acceptPrivacy() {
  try {
    await updateSettings({ consent: true });
  } catch (error) {
    toast('Your privacy preference could not be saved on this device.', { tone: 'error' });
  }
  await render();
}

/* ---------------- scan ---------------- */

function showNativeSheet() {
  openSheet({
    title: 'Native Android module not connected',
    body: `<p>Reading installed applications requires the native Android module, which uses Android
        package-manager APIs. This build is running in a browser preview, so nothing can be scanned —
        and no app data is invented.</p>
      <p style="margin-top: 10px">Run the app inside the Android build for real device data, or enable
        Demo mode in Settings to test the interface with sample apps.</p>`,
    actions: [
      { label: 'Open Settings', className: 'btn-primary', onClick: () => navigate('#/settings') },
      { label: 'Close', className: 'btn-ghost' },
    ],
  });
}

async function handleScan(button) {
  if (!state.settings.consent) return;

  if (!state.settings.demoMode && !isNativeAvailable()) {
    showNativeSheet();
    return;
  }

  if (button) {
    button.disabled = true;
    button.innerHTML = `${icon('scan')}<span>Scanning…</span>`;
  }

  try {
    const result = await performScan();
    await reloadData();
    await render();

    const bits = [`${result.detected} app${result.detected === 1 ? '' : 's'} detected`];
    if (result.added) bits.push(`${result.added} new`);
    if (result.gone) bits.push(`${result.gone} now uninstalled`);
    if (result.reinstalled) bits.push(`${result.reinstalled} reinstalled`);
    toast(`Scan complete — ${bits.join(' · ')}`);
  } catch (error) {
    await render();
    toast(error.userMessage || 'The scan failed. Please try again.', { tone: 'error' });
  }
}

/* ---------------- reinstall / Play Store ---------------- */

function showPlayStoreFallback(packageName) {
  openSheet({
    title: 'Play Store listing unavailable',
    body: `<p>No Google Play listing could be opened for this package, so there is no automatic
        reinstall path for it.</p>
      <p class="sheet-pkg">${esc(packageName)}</p>
      <p style="margin-top: 12px">You can copy the package name and search for it manually in the
        Play Store.</p>`,
    actions: [
      {
        label: 'Copy package name',
        className: 'btn-outline',
        onClick: async () => {
          const copied = await copyText(packageName);
          toast(copied ? 'Package name copied' : 'Could not copy the package name', {
            tone: copied ? 'default' : 'error',
          });
        },
      },
      { label: 'Close', className: 'btn-ghost' },
    ],
  });
}

async function handleReinstall(packageName, button) {
  if (!packageName) return;
  if (button) button.disabled = true;
  const result = await openPlayStore(packageName);
  if (button) button.disabled = false;

  if (result.opened) {
    toast('Opening the Google Play Store…');
    return;
  }
  showPlayStoreFallback(packageName);
}

/* ---------------- data actions ---------------- */

async function handleDeleteApp(packageName) {
  const app = findApp(packageName);
  const name = app?.appName || packageName;
  const confirmed = await confirmSheet({
    title: 'Delete history?',
    message: `The saved record and activity for ${name} will be removed from this device. Nothing is installed or uninstalled.`,
    confirmLabel: 'Delete',
    tone: 'danger',
  });
  if (!confirmed) return;

  try {
    await db.deleteAppAndEvents(packageName);
    await reloadData();
    toast('History deleted');
    navigate('#/uninstalled');
    await render();
  } catch (error) {
    toast(error.userMessage || 'That record could not be deleted.', { tone: 'error' });
  }
}

async function handleClearHistory() {
  const confirmed = await confirmSheet({
    title: 'Clear history?',
    message: 'The activity timeline will be removed. App records and their statuses are kept.',
    confirmLabel: 'Clear history',
    tone: 'danger',
  });
  if (!confirmed) return;

  try {
    await db.clearEvents();
    await reloadData();
    await render();
    toast('History cleared');
  } catch (error) {
    toast(error.userMessage || 'The history could not be cleared.', { tone: 'error' });
  }
}

async function handleDeleteAll() {
  const confirmed = await confirmSheet({
    title: 'Delete all data?',
    message: 'Every app record and activity on this device will be removed. This cannot be undone.',
    confirmLabel: 'Delete everything',
    tone: 'danger',
  });
  if (!confirmed) return;

  try {
    const settings = { ...state.settings, demoMode: false };
    await db.eraseAllData();
    await db.setMeta('settings', settings);
    await loadState();
    await render();
    toast('All app data deleted');
  } catch (error) {
    toast(error.userMessage || 'Your data could not be deleted.', { tone: 'error' });
  }
}

async function handleToggleDemo() {
  if (state.settings.demoMode) {
    const confirmed = await confirmSheet({
      title: 'Turn off demo mode?',
      message: 'The sample data on this device will be removed.',
      confirmLabel: 'Turn off and remove',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      const settings = { ...state.settings, demoMode: false };
      await db.eraseAllData();
      await db.setMeta('settings', settings);
      await loadState();
      await render();
      toast('Demo mode off — sample data removed');
    } catch (error) {
      toast(error.userMessage || 'Demo data could not be removed.', { tone: 'error' });
    }
    return;
  }

  if (state.apps.length > 0) {
    const confirmed = await confirmSheet({
      title: 'Enable demo mode?',
      message:
        'Enabling demo mode replaces your current app history with sample data for testing the interface.',
      confirmLabel: 'Replace with demo data',
      tone: 'danger',
    });
    if (!confirmed) return;
    await db.eraseAllData();
  }

  try {
    await seedDemoData();
    await db.setMeta('settings', { ...state.settings, demoMode: true });
    await loadState();
    await render();
    toast('Demo mode on — sample data loaded');
  } catch (error) {
    toast(error.userMessage || 'Demo data could not be loaded.', { tone: 'error' });
  }
}

/* ---------------- informational sheets ---------------- */

function showPrivacyDetails() {
  openSheet({
    title: 'Privacy details',
    body: `<p>“This app checks your device's accessible installed-app information to maintain your
        personal app history. Your app history should remain on this device unless the user explicitly
        enables cloud backup.”</p>
      <p style="margin-top: 12px">Only the app name, package name, icon and detection dates are stored.
        Contacts, messages, accounts, files and app usage are never read. Nothing is uploaded and there
        is no account or cloud backup in this version.</p>
      <p style="margin-top: 12px">Android limits which installed apps an app can see. Broad visibility
        requires the restricted <code>QUERY_ALL_PACKAGES</code> permission (subject to Google Play
        policy) or explicit <code>&lt;queries&gt;</code> declarations, so some apps may never appear in
        your history.</p>`,
    actions: [{ label: 'Close', className: 'btn-ghost' }],
  });
}

function showIntegrationDetails() {
  const native = isNativeAvailable();
  openSheet({
    title: 'Android package visibility',
    body: `<p>App History reads installed applications through Android's package-manager APIs. Since
        Android 11, apps can only see a limited set of other packages unless they declare visibility.</p>
      <p style="margin-top: 12px"><strong>Most privacy-preserving approach:</strong> declare specific
        <code>&lt;queries&gt;</code> entries for the packages you care about. Broad access requires
        <code>QUERY_ALL_PACKAGES</code>, which Google Play restricts and which must be justified during
        review.</p>
      <p style="margin-top: 12px">Because visibility can never be guaranteed, App History never claims
        to see every app. Missing apps are not invented, and a record is only marked uninstalled when a
        scan no longer detects it.</p>
      <p style="margin-top: 12px">Native module in this build: <strong>${
        native ? 'connected' : 'not connected (browser preview)'
      }</strong>. The Kotlin implementation and integration notes live in the <code>android/</code>
        folder of the repository.</p>`,
    actions: [{ label: 'Close', className: 'btn-ghost' }],
  });
}

/* ---------------- events ---------------- */

async function onDocumentClick(event) {
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;

  const action = trigger.dataset.action;
  const packageName = trigger.dataset.package;

  try {
    switch (action) {
      case 'scan':
        await handleScan(trigger);
        break;
      case 'open':
        if (packageName) navigate(`#/app/${encodeURIComponent(packageName)}`);
        break;
      case 'reinstall':
        await handleReinstall(packageName, trigger);
        break;
      case 'delete-app':
        await handleDeleteApp(packageName);
        break;
      case 'clear-history':
        await handleClearHistory();
        break;
      case 'delete-all':
        await handleDeleteAll();
        break;
      case 'toggle-demo':
        await handleToggleDemo();
        break;
      case 'set-theme':
        applyTheme(trigger.dataset.themeValue);
        await updateSettings({ theme: trigger.dataset.themeValue });
        await render();
        break;
      case 'privacy':
        showPrivacyDetails();
        break;
      case 'integration':
        showIntegrationDetails();
        break;
      case 'go-history':
        navigate('#/history');
        break;
      case 'back':
        if (window.history.length > 1) window.history.back();
        else navigate('#/');
        break;
      default:
        break;
    }
  } catch (error) {
    toast(error.userMessage || 'Something went wrong. Please try again.', { tone: 'error' });
  }
}

async function onThemeToggle() {
  const mode = nextThemeMode();
  applyTheme(mode);
  try {
    await updateSettings({ theme: mode });
  } catch (error) {
    toast('The theme preference could not be saved.', { tone: 'error' });
  }
  await render();
}

/* ---------------- boot ---------------- */

function renderFatal(error) {
  const container = root();
  if (!container) return;
  container.innerHTML = `
    <section class="gate">
      <span class="gate-icon">${icon('alert')}</span>
      <h1>App history could not load</h1>
      <p class="lead">${esc(
        error?.userMessage || 'The local app history database could not be opened on this device.'
      )}</p>
      <button class="btn btn-primary btn-block" type="button" id="retryBoot">Try again</button>
    </section>`;
  container.querySelector('#retryBoot')?.addEventListener('click', boot);
}

let started = false;

async function boot() {
  try {
    await loadState();
  } catch (error) {
    renderFatal(error);
    return;
  }

  if (!started) {
    started = true;
    document.getElementById('themeToggle')?.addEventListener('click', onThemeToggle);
    window.addEventListener('hashchange', render);
    document.addEventListener('click', onDocumentClick);
  }

  await render();
}

boot();
