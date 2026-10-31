// Shared UI primitives: escaping, formatting, icons, cards, toasts and sheets.

const ICONS = {
  search:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.3-3.3"/></svg>',
  scan:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 3.5V9h-5.5"/><circle cx="12" cy="12" r="2.6"/></svg>',
  shield:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.6 3 8.2 7 9.5 4-1.3 7-4.9 7-9.5V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 12.5 5 5 10-11"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg>',
  external:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 5H5a1 1 0 0 0-1 1v10"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 3 20h18z"/><path d="M12 10v4"/><path d="M12 17.2v.1"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.8v.1"/></svg>',
  archive:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="4.5" rx="1.6"/><path d="M5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5"/><path d="M10 12.5h4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  apps:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
};

export function icon(name) {
  return ICONS[name] || '';
}

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

const DAY = 24 * 60 * 60 * 1000;

export function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function fmtLongDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function fmtTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function relTime(ts) {
  if (!ts) return 'never';
  const diff = Date.now() - ts;
  if (diff < 60 * 1000) return 'just now';
  if (diff < 60 * 60 * 1000) return `${Math.round(diff / (60 * 1000))} min ago`;
  if (diff < DAY) {
    const hours = Math.round(diff / (60 * 60 * 1000));
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.round(diff / DAY);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return fmtDate(ts);
}

export function hashHue(text) {
  let hash = 0;
  const value = String(text || 'app');
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return hash;
}

export function appIcon(app, size = '') {
  const source = typeof app?.icon === 'string' && app.icon.startsWith('data:image/') ? app.icon : null;
  const sizeClass = size ? ` app-icon-${size}` : '';
  if (source) {
    return `<img class="app-icon${sizeClass}" src="${esc(source)}" alt="" loading="lazy" />`;
  }
  const letter = (app?.appName || app?.packageName || '?').trim().charAt(0).toUpperCase();
  return `<span class="app-icon app-icon-letter${sizeClass}" style="--hue:${hashHue(
    app?.packageName || app?.appName
  )}" aria-hidden="true">${esc(letter)}</span>`;
}

export function statusBadge(status) {
  const installed = status === 'INSTALLED';
  return `<span class="badge ${installed ? 'badge-installed' : 'badge-uninstalled'}">${
    installed ? 'Installed' : 'Uninstalled'
  }</span>`;
}

export function appCard(app) {
  const uninstalled = app.status === 'UNINSTALLED';
  const sub = uninstalled
    ? `Previously detected ${fmtDate(app.lastSeen)} · Uninstalled ${fmtDate(app.uninstallDetectedAt)}`
    : `Last detected ${relTime(app.lastSeen)}`;

  return `
    <article class="app-card">
      <button class="app-card-main" type="button" data-action="open" data-package="${esc(app.packageName)}">
        ${appIcon(app)}
        <span class="app-meta">
          <span class="app-name">${esc(app.appName)}</span>
          <span class="app-pkg">${esc(app.packageName)}</span>
          <span class="app-sub">${esc(sub)}</span>
        </span>
        ${statusBadge(app.status)}
      </button>
      ${
        uninstalled
          ? `<div class="app-card-actions">
               <button class="btn btn-primary btn-small" type="button" data-action="reinstall" data-package="${esc(
                 app.packageName
               )}">${icon('external')}Reinstall</button>
             </div>`
          : ''
      }
    </article>`;
}

export function emptyState({ iconName = 'apps', title, text, actionHtml = '' }) {
  return `
    <div class="empty">
      ${icon(iconName)}
      <strong>${esc(title)}</strong>
      ${text ? `<p>${esc(text)}</p>` : ''}
      ${actionHtml}
    </div>`;
}

export function eventLabel(type) {
  switch (type) {
    case 'uninstalled':
      return 'App marked as uninstalled';
    case 'reinstalled':
      return 'App reinstalled';
    default:
      return 'App detected';
  }
}

let toastTimer = null;
export function toast(message, { tone = 'default', duration = 3000 } = {}) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = `toast show${tone === 'error' ? ' error' : ''}`;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.className = 'toast';
  }, duration);
}

let closeHandler = null;

export function closeSheet() {
  const root = document.getElementById('modalRoot');
  if (root) root.innerHTML = '';
  document.body.classList.remove('sheet-open');
  document.removeEventListener('keydown', onSheetKey);
  const handler = closeHandler;
  closeHandler = null;
  if (handler) handler();
}

function onSheetKey(event) {
  if (event.key === 'Escape') closeSheet();
}

export function openSheet({ title, body = '', actions = [], onClose = null }) {
  const root = document.getElementById('modalRoot');
  if (!root) return;

  closeHandler = onClose;
  const actionsHtml = actions
    .map(
      (action, index) =>
        `<button class="btn ${esc(action.className || 'btn-ghost')}" type="button" data-sheet-action="${index}">${
          action.label
        }</button>`
    )
    .join('');

  root.innerHTML = `
    <div class="sheet-backdrop" data-sheet-close="true"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <h2>${esc(title)}</h2>
      <div class="sheet-body">${body}</div>
      <div class="sheet-actions${actions.length > 1 ? ' row' : ''}">${actionsHtml}</div>
    </div>`;

  root.querySelector('[data-sheet-close]')?.addEventListener('click', closeSheet);
  actions.forEach((action, index) => {
    root.querySelector(`[data-sheet-action="${index}"]`)?.addEventListener('click', () => {
      const result = action.onClick?.();
      if (result === false) return;
      closeSheet();
    });
  });
  document.addEventListener('keydown', onSheetKey);
  document.body.classList.add('sheet-open');
  root.querySelector('.btn')?.focus();
}

export function confirmSheet({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
}) {
  return new Promise((resolve) => {
    let settled = false;
    openSheet({
      title,
      body: `<p>${esc(message)}</p>`,
      onClose: () => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      },
      actions: [
        {
          label: cancelLabel,
          className: 'btn-ghost',
          onClick: () => {
            settled = true;
            resolve(false);
          },
        },
        {
          label: confirmLabel,
          className: tone === 'danger' ? 'btn-danger-solid' : 'btn-primary',
          onClick: () => {
            settled = true;
            resolve(true);
          },
        },
      ],
    });
  });
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
}
