import { state } from '../state.js';
import { esc, fmtLongDate, fmtTime, eventLabel, emptyState, icon } from '../ui.js';

function dayKey(ts) {
  const date = new Date(ts);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function historyRow(event) {
  const app = state.apps.find((item) => item.packageName === event.packageName);
  const name = event.appName || app?.appName || event.packageName;
  const inner = `
    <span class="timeline-dot ${esc(event.type)}"></span>
    <span class="timeline-body">
      <span class="timeline-label">${esc(eventLabel(event.type))}</span>
      <span class="timeline-app">${esc(name)} · ${esc(event.packageName)}</span>
    </span>
    <span class="timeline-time">${esc(fmtTime(event.at))}</span>`;

  if (app) {
    return `<button class="timeline-item" type="button" data-action="open" data-package="${esc(
      event.packageName
    )}">${inner}</button>`;
  }
  return `<div class="timeline-item">${inner}</div>`;
}

export function renderHistory(root) {
  const head = `
    <div class="page-head">
      <span class="eyebrow">Timeline</span>
      <h1 class="page-title">History</h1>
      <p class="page-sub">Every change this app detected, newest first.</p>
    </div>`;

  if (!state.events.length) {
    root.innerHTML =
      head +
      emptyState({
        iconName: 'clock',
        title: 'No history yet',
        text: 'Scan your device to create your app history. Detected and uninstalled apps are recorded here.',
        actionHtml: `<button class="btn btn-primary btn-small" type="button" data-action="scan">Scan Now</button>`,
      });
    return;
  }

  let lastKey = null;
  let currentItems = [];
  const groups = [];

  for (const event of state.events) {
    const key = dayKey(event.at);
    if (key !== lastKey) {
      if (currentItems.length) groups.push(currentItems);
      currentItems = [];
      lastKey = key;
    }
    currentItems.push(event);
  }
  if (currentItems.length) groups.push(currentItems);

  root.innerHTML =
    head +
    `<div class="timeline">
      ${groups
        .map(
          (group) => `
            <section>
              <p class="timeline-day">${esc(fmtLongDate(group[0].at))}</p>
              <div class="timeline-list">${group.map(historyRow).join('')}</div>
            </section>`
        )
        .join('')}
    </div>
    <p class="note">
      This timeline only contains apps that this app detected. Scans run when you press Scan Now or
      open the app — Android does not send this app a history of every installation.
      <button class="link" type="button" data-action="clear-history" style="display: inline; margin-left: 4px; color: var(--danger)">
        Clear history
      </button>
    </p>`;
}
