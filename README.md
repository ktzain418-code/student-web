# App History

**Remember the apps you've used.**

App History tracks the apps installed on your Android device and keeps a local record
of the ones that later disappear. It does not recover deleted apps and never claims
to: it remembers apps that this app previously detected.

## What it does

- **Dashboard** — total apps tracked, currently installed, previously installed,
  recently uninstalled, last scan time and a prominent **Scan Now** button.
- **Currently Installed** — search by app name or package, sort A–Z or most recent,
  filter by detection date, status badge and last-detected date.
- **Uninstalled Apps** — apps previously detected that are no longer installed, with
  their last-seen and uninstall-detected dates and a **Reinstall** button that opens
  the Google Play Store listing (never a silent install).
- **History** — chronological timeline of detections, uninstalls and reinstalls.
- **App details** — package, status, first/last seen, uninstall date, reinstall and
  delete-history actions.
- **Settings** — light / dark / system theme, privacy details, clear history, delete
  all data, Android integration status and a development-only demo mode.

## Privacy

> This app checks your device's accessible installed-app information to maintain your
> personal app history. Your app history should remain on this device unless the user
> explicitly enables cloud backup.

Only app name, package name, icon and detection dates are stored — locally
(IndexedDB in the shared app layer, Room schema prepared for a fully native build).
Nothing is uploaded; there is no account and no cloud backup.

## Native Android module (required for real scans)

A browser cannot enumerate installed Android packages. The native Kotlin module lives
in [`android/`](android/README.md) and is the only component that reads device apps:

- `PackageScanner.kt` — `PackageManager` scan, base64 icons, self package excluded
- `AppHistoryPlugin.kt` — Capacitor plugin `AppHistory`: `scanInstalledApps`,
  `openPlayStore`, `getCapabilities`
- `AndroidManifest.xml` — `QUERY_ALL_PACKAGES` declaration plus `<queries>` for the
  Play Store, with the Google Play restricted-permission note
- `AppHistoryDatabase.kt` — Room reference schema for native storage

Without that module the UI shows **"Native module not connected"** and refuses to
fabricate data. Inside the Android WebView it detects `Capacitor.Plugins.AppHistory`
automatically.

### Package visibility limitations

Android 11+ hides most installed packages unless the app declares visibility. Broad
access needs `QUERY_ALL_PACKAGES`, which Google Play restricts and must be justified.
The app therefore explains the limitation in Settings and never claims to see
everything; a record is only marked uninstalled when a scan no longer detects it.

## Demo mode

Settings → **Demo mode** loads clearly labelled sample apps for development testing.
It is off by default, and enabling or disabling it never mixes sample records with
real ones.

## Running the interface

Static site, no build step:

```bash
docker compose -f docker-compose.base44.yml up -d   # Base44 sandbox, port 3000
# or
python3 -m http.server 8000
```

## Project layout

```
index.html                 app shell (top bar, bottom navigation)
css/app.css                Material-style light/dark design system
js/main.js                 routing, actions, scan workflow
js/db.js                   local database (IndexedDB)
js/scan.js                 scan reconciliation (installed → uninstalled)
js/native.js               native Android bridge + Play Store link handling
js/state.js                shared state and settings
js/demo.js                 development-only sample data
js/ui.js                   formatting, icons, cards, sheets, toasts
js/views/                  dashboard, installed, uninstalled, history, details, settings, privacy
android/                   required native Android module (Kotlin, Capacitor)
```

## Limits

- Cannot restore or reinstall an app automatically.
- Cannot see apps Android hides from the package scanner.
- Does not record installations that happened while the app was never opened and the
  app was never scanned.
