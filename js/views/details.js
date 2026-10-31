import { findApp } from '../state.js';
import * as db from '../db.js';
import {
  esc,
  appIcon,
  statusBadge,
  fmtDate,
  fmtLongDate,
  fmtTime,
  relTime,
  eventLabel,
  emptyState,
  icon,
} from '../ui.js';

function detailEventRow(event) {
  return `
    <div class="timeline-item">
      <span class="timeline-dot ${esc(event.type)}"></span>
      <span class="timeline-body">
        <span class="timeline-label">${esc(eventLabel(event.type))}</span>
        <span class="timeline-app">${esc(fmtDate(event.at))} · ${esc(fmtTime(event.at))}</span>
      </span>
    </div>`;
}

export async function renderDetails(root, packageName) {
  const app = findApp(packageName);

  if (!app) {
    root.innerHTML =
      `<button class="back-btn" type="button" data-action="back">${icon('back')}Back</button>` +
      emptyState({
        iconName: 'alert',
        title: 'App record not found',
        text: 'This app record may have been deleted from your history.',
      });
    return;
  }

  let events = [];
  try {
    events = await db.getEventsFor(packageName);
  } catch (error) {
    events = [];
  }

  const isUninstalled = app.status === 'UNINSTALLED';

  root.innerHTML = `
    <button class="back-btn" type="button" data-action="back">${icon('back')}Back</button>

    <section class="card">
      <div class="detail-hero">
        ${appIcon(app)}
        <div class="app-meta">
          <span class="app-name">${esc(app.appName)}</span>
          <span class="app-pkg">${esc(app.packageName)}</span>
          <span style="margin-top: 7px">${statusBadge(app.status)}</span>
        </div>
      </div>

      <dl class="kv">
        <div class="kv-row"><dt>Current status</dt><dd>${isUninstalled ? 'Uninstalled' : 'Installed'}</dd></div>
        <div class="kv-row"><dt>First seen</dt><dd>${esc(fmtLongDate(app.firstSeen))}</dd></div>
        <div class="kv-row"><dt>Last seen</dt><dd>${esc(fmtDate(app.lastSeen))} · ${esc(relTime(app.lastSeen))}</dd></div>
        ${
          isUninstalled
            ? `<div class="kv-row"><dt>Uninstall detected</dt><dd>${esc(fmtDate(app.uninstallDetectedAt))}</dd></div>`
            : ''
        }
      </dl>

      <div class="app-card-actions">
        ${
          isUninstalled
            ? `<button class="btn btn-primary" type="button" data-action="reinstall" data-package="${esc(
                app.packageName
              )}">${icon('external')}Reinstall</button>`
            : ''
        }
        <button class="btn btn-danger" type="button" data-action="delete-app" data-package="${esc(
          app.packageName
        )}">${icon('trash')}Delete history</button>
      </div>

      ${
        isUninstalled
          ? `<p class="note">Reinstall opens the Google Play Store listing for this package when one can be resolved. App History cannot install or restore the app itself.</p>`
          : ''
      }
    </section>

    <section class="section">
      <div class="section-head"><h2>Recorded activity</h2></div>
      <div class="timeline-list">
        ${
          events.length
            ? events.map(detailEventRow).join('')
            : '<p class="page-sub">No activity recorded for this app yet.</p>'
        }
      </div>
    </section>
  `;
}
