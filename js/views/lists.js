import { installedApps, uninstalledApps, lastScan } from '../state.js';
import { esc, appCard, emptyState, icon } from '../ui.js';

const DAY = 24 * 60 * 60 * 1000;

const viewState = {
  installed: { q: '', sort: 'az', filter: 'all' },
  uninstalled: { q: '', sort: 'recent', filter: 'all' },
};

function matches(app, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    (app.appName || '').toLowerCase().includes(q) || app.packageName.toLowerCase().includes(q)
  );
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function filtered(kind) {
  const ui = viewState[kind];
  let apps = kind === 'installed' ? installedApps() : uninstalledApps();
  apps = apps.filter((app) => matches(app, ui.q));

  if (kind === 'installed' && ui.filter !== 'all') {
    const cutoff = ui.filter === 'today' ? startOfToday() : Date.now() - 7 * DAY;
    apps = apps.filter((app) => (app.lastSeen || 0) >= cutoff);
  }

  if (ui.sort === 'az') {
    return apps.sort((a, b) => (a.appName || '').localeCompare(b.appName || ''));
  }
  if (kind === 'uninstalled') {
    return apps.sort((a, b) => (b.uninstallDetectedAt || 0) - (a.uninstallDetectedAt || 0));
  }
  return apps.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
}

function toolbar(kind, { withFilter = false } = {}) {
  const ui = viewState[kind];
  return `
    <div class="toolbar">
      <label class="field">
        ${icon('search')}
        <input
          id="listSearch"
          type="search"
          value="${esc(ui.q)}"
          placeholder="Search name or package"
          aria-label="Search apps"
          autocomplete="off"
        />
      </label>
    </div>
    <div class="controls">
      <div class="segmented" role="group" aria-label="Sort order">
        <button type="button" data-sort="az" aria-pressed="${ui.sort === 'az'}">A–Z</button>
        <button type="button" data-sort="recent" aria-pressed="${ui.sort === 'recent'}">Recent</button>
      </div>
      ${
        withFilter
          ? `<select class="select" id="listFilter" aria-label="Filter by detection time">
              <option value="all" ${ui.filter === 'all' ? 'selected' : ''}>All detected</option>
              <option value="today" ${ui.filter === 'today' ? 'selected' : ''}>Detected today</option>
              <option value="week" ${ui.filter === 'week' ? 'selected' : ''}>Detected this week</option>
            </select>`
          : ''
      }
    </div>
    <div id="listBody" class="list" aria-live="polite"></div>`;
}

function bodyHtml(kind) {
  const apps = filtered(kind);
  if (apps.length) return apps.map(appCard).join('');

  const noScan = !lastScan();

  if (kind === 'installed') {
    return emptyState({
      iconName: 'apps',
      title: noScan ? 'Scan your device to create your app history.' : 'No installed apps detected',
      text: noScan
        ? 'Installed apps are read through the native Android module.'
        : 'Android package visibility may limit which applications this app can see.',
      actionHtml: `<button class="btn btn-primary btn-small" type="button" data-action="scan">Scan Now</button>`,
    });
  }

  return emptyState({
    iconName: 'archive',
    title: 'No previously uninstalled apps found.',
    text: noScan
      ? 'Scan your device to create your app history.'
      : 'When an app you previously detected is no longer installed, it appears here.',
  });
}

function bind(root, kind) {
  const body = root.querySelector('#listBody');
  if (!body) return;
  const paint = () => {
    body.innerHTML = bodyHtml(kind);
  };
  paint();

  const search = root.querySelector('#listSearch');
  search?.addEventListener('input', () => {
    viewState[kind].q = search.value;
    paint();
  });

  root.querySelectorAll('[data-sort]').forEach((button) => {
    button.addEventListener('click', () => {
      viewState[kind].sort = button.dataset.sort;
      root.querySelectorAll('[data-sort]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      paint();
    });
  });

  const filter = root.querySelector('#listFilter');
  filter?.addEventListener('change', () => {
    viewState[kind].filter = filter.value;
    paint();
  });
}

export function renderInstalled(root) {
  const total = installedApps().length;
  root.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">Installed apps</span>
      <h1 class="page-title">Currently Installed</h1>
      <p class="page-sub">${total} application${total === 1 ? '' : 's'} detected on this device.</p>
    </div>
    ${toolbar('installed', { withFilter: true })}
  `;
  bind(root, 'installed');
}

export function renderUninstalled(root) {
  const total = uninstalledApps().length;
  root.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">App history</span>
      <h1 class="page-title">Uninstalled Apps</h1>
      <p class="page-sub">${total} previously detected app${total === 1 ? '' : 's'} no longer installed.</p>
    </div>
    ${toolbar('uninstalled')}
  `;
  bind(root, 'uninstalled');
}
