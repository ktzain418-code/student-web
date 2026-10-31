// Light / dark / system theme handling.

const media = window.matchMedia('(prefers-color-scheme: dark)');
let currentMode = 'system';

export function resolveTheme(mode) {
  if (mode === 'light' || mode === 'dark') return mode;
  return media.matches ? 'dark' : 'light';
}

export function applyTheme(mode) {
  currentMode = ['light', 'dark', 'system'].includes(mode) ? mode : 'system';
  const resolved = resolveTheme(currentMode);
  document.documentElement.dataset.theme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0b1120' : '#2563eb');

  const button = document.getElementById('themeToggle');
  if (button) {
    button.innerHTML =
      resolved === 'dark'
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 13.2A8.6 8.6 0 1 1 10.8 3a6.8 6.8 0 0 0 10.2 10.2z"/></svg>';
    button.setAttribute(
      'aria-label',
      resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }
  return resolved;
}

export function nextThemeMode() {
  const resolved = resolveTheme(currentMode);
  return resolved === 'dark' ? 'light' : 'dark';
}

media.addEventListener('change', () => {
  if (currentMode === 'system') applyTheme('system');
});
