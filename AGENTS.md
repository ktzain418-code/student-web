# Working on this repo

## What this is
**App History** — a mobile-first app (HTML/CSS/vanilla ES modules, no build step) plus a
required native Kotlin module in `android/`. The web layer is the product UI, local
database, scan reconciliation and settings; it cannot read Android's installed-app
list. That is the native module's job.

`legacy-nearhelp/` holds an unrelated static site that the repo used to serve; it is
not part of the app.

## Running it (Base44 sandbox)
```bash
docker compose -f docker-compose.base44.yml up -d
```
* `web` is a plain `python:3.12-slim` image running `.base44/serve.py` with the repo
  bind-mounted read-only at `/app`, so it serves the cloned source (no prebuilt bundle).
* Public entry point: host port 3000 → container port 80.
* `.base44/serve.py` adds `Cache-Control: no-store`; without it the browser keeps a
  stale `js/*.js` after an edit. No hot reload — edits show on the next page load; call
  `reload_preview` if the preview holds an old response.
* Healthcheck probes `/` with `urllib`.

## Architecture notes
* Routing is hash-based (`#/installed`, `#/uninstalled`, `#/history`, `#/settings`,
  `#/app/<package>`) so a reload never hits a 404 from the static server.
* State lives in `js/state.js` (hydrated from IndexedDB via `js/db.js`). All views read
  from that module; actions in `js/main.js` mutate the DB then call `reloadData()` and
  re-render.
* `js/scan.js` reconciles a scan against stored history: new packages become
  `INSTALLED`, previously uninstalled packages that reappear become `INSTALLED`, and
  stored `INSTALLED` packages missing from the scan become `UNINSTALLED`. Detection
  events are deduplicated to once per 12 h per app.
* `js/native.js` is the only place that talks to Android. It looks for
  `window.AppHistoryNative` or `Capacitor.Plugins.AppHistory`. If neither exists it
  throws instead of inventing data — the UI shows "Native module not connected".
* Demo mode (`js/demo.js`) is off by default, clearly labelled, and replaces history
  with sample records; turning it off removes that sample data. Never enable it by
  default.
* Native Kotlin sources in `android/` are reference implementations for a Capacitor
  host (package scan, Play Store resolution, capabilities, Room schema). They are not
  built in this sandbox — no Android SDK — so never claim the preview verified them.

## Testing in the preview
Onboarding privacy gate → accept → Settings → Demo mode on → scan, search, details,
history, theme switch. In a browser the top banner always reads "UI preview — the
native Android module is not connected here", which is expected and must not be
replaced with fake installed-app data.

## Notes
* `.github/workflows/npm-publish-github-packages.yml` expects `npm ci` / `npm test`, but
  this repo has no `package.json` — that workflow cannot run as-is.
