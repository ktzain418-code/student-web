import { state, lastScan, installedApps, uninstalledApps, isNativeAvailable } from '../state.js';
import { esc, fmtDate, fmtTime, relTime, appCard, emptyState, icon, eventLabel } from '../ui.js';

const DAY = 24 * 60 * 60 * 1000;

function matches(app, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    (app.appName || '').toLowerCase().includes(q) || app.packageName.toLowerCase().includes(q)
  );
}

function activityRow(event) {
  const app = state.apps.find((item) => item.packageName === event.packageName);
  const name = event.appName || app?.appName || event.packageName;
  const inner = `
    <span class="timeline-dot ${esc(event.type)}"></span>
    <span class="timeline-body">
      <span class="timeline-label">${esc(eventLabel(event.type))}</span>
      <span class="timeline-app">${esc(name)}</span>
    </span>
    <span class="timeline-time">${esc(relTime(event.at))}</span>`;

  if (app) {
    return `<button class="timeline-item" type="button" data-action="open" data-package="${esc(
      event.packageName
    )}">${inner}</button>`;
  }
  return `<div class="timeline-item">${inner}</div>`;
}

export function renderHome(root) {
  const installed = installedApps();
  const uninstalled = uninstalledApps();
  const recentCutoff = Date.now() - 30 * DAY;
  const recentlyUninstalled = uninstalled.filter(
    (app) => (app.uninstallDetectedAt || 0) >= recentCutoff
  );
  const scan = lastScan();
  const native = isNativeAvailable();
  const sourceLabel = state.settings.demoMode
    ? 'Demo mode'
    : native
      ? 'Device scan'
      : 'Native module not connected';

  root.innerHTML = `
    <div class="page-head">
      <span class="eyebrow">Dashboard</span>
      <h1 class="page-title">Your app history</h1>
      <p class="page-sub">Track what is installed now — and remember what you removed.</p>
    </div>

    <section class="card scan-card">
      <p class="scan-label">App scan</p>
      <h2 class="scan-title">Keep your history current</h2>
      <p class="scan-sub">${
        scan
          ? `Last scan ${esc(relTime(scan.at))} · ${esc(scan.count)} apps detected`
          : 'Scan your device to create your app history.'
      }</p>
      <button class="scan-btn" type="button" data-action="scan">
        ${icon('scan')}
        <span>Scan Now</span>
      </button>
      <div class="scan-meta">
        <span>${scan ? `Last scan ${esc(fmtDate(scan.at))}, ${esc(fmtTime(scan.at))}` : 'No scan yet'}</span>
        <span class="pill">${esc(sourceLabel)}</span>
      </div>
    </section>

    <div class="stats-grid">
      <div class="stat accent">
        <span class="stat-value">${state.apps.length}</span>
        <span class="stat-label">Total apps tracked</span>
      </div>
      <div class="stat">
        <span class="stat-value">${installed.length}</span>
        <span class="stat-label">Currently installed</span>
      </div>
      <div class="stat">
        <span class="stat-value">${uninstalled.length}</span>
        <span class="stat-label">Previously installed</span>
      </div>
      <div class="stat warn">
        <span class="stat-value">${recentlyUninstalled.length}</span>
        <span class="stat-label">Recently uninstalled</span>
      </div>
    </div>

    <div class="section">
      <label class="field">
        ${icon('search')}
        <input
          id="homeSearch"
          type="search"
          placeholder="Search by app name or package"
          aria-label="Search all tracked apps"
          autocomplete="off"
        />
      </label>
      <div id="searchResults" class="list" style="margin-top: 12px" hidden></div>
    </div>

    <div id="dashboardBody">
      ${
        state.apps.length === 0
          ? `<div class="section">${emptyState({
              iconName: 'apps',
              title: 'Scan your device to create your app history.',
              text: 'App History only records applications that this app detects on your device.',
              actionHtml: `<button class="btn btn-primary btn-small" type="button" data-action="scan">Scan Now</button>`,
            })}</div>`
          : `<section class="section">
              <div class="section-head">
                <h2>Recent activity</h2>
                <button class="link" type="button" data-action="go-history">View all</button>
              </div>
              <div class="timeline-list">
                ${state.events.slice(0, 4).map(activityRow).join('') || '<p class="page-sub">No activity recorded yet.</p>'}
              </div>
            </section>`
      }

      <p class="note">
        <strong>App History remembers apps that this app previously detected.</strong>
        It cannot restore or recover a deleted application. When a Play Store listing is available,
        the Reinstall button opens it for you.
      </p>
    </div>
  `;

  const search = root.querySelector('#homeSearch');
  const results = root.querySelector('#searchResults');
  const dashboard = root.querySelector('#dashboardBody');
  if (!search || !results || !dashboard) return;

  search.addEventListener('input', () => {
    const query = search.value;
    if (!query.trim()) {
      results.hidden = true;
      results.innerHTML = '';
      dashboard.hidden = false;
      return;
    }
    const matchesList = state.apps.filter((app) => matches(app, query)).slice(0, 8);
    results.hidden = false;
    dashboard.hidden = true;
    results.innerHTML = matchesList.length
      ? matchesList.map(appCard).join('')
      : emptyState({
          iconName: 'search',
          title: 'No matching apps',
          text: 'Try another app name or a package name such as com.instagram.android.',
        });
  });
}
