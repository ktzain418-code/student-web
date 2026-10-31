# App History — native Android module

This folder is the **required native Android module** for the App History app. The web
layer in this repository (`index.html`, `js/`) is the complete product UI, database
model, scan workflow, history logic and settings; it cannot read Android's installed
package list by itself. That capability lives here.

The module is written for a Capacitor Android host, exposing a plugin named
`AppHistory` that the web layer detects automatically as
`Capacitor.Plugins.AppHistory` (or `window.AppHistoryNative`, if you inject it that
way). Without it, the UI reports "Native module not connected" and never invents data.

## What the native module provides

| Method | Purpose |
| --- | --- |
| `scanInstalledApps()` | Returns `{ apps: [{ packageName, appName, icon }], scannedAt }` using `PackageManager`. No contacts, accounts, usage stats or files are read. |
| `openPlayStore({ packageName })` | Resolves `market://details?id=<pkg>` first, falls back to the public `play.google.com` listing, and resolves `{ opened: false, reason }` when neither is available. |
| `getCapabilities()` | Reports SDK level and whether broad package visibility (`QUERY_ALL_PACKAGES`) is declared. |

## Files

- `app/src/main/java/com/apphistory/nativebridge/PackageScanner.kt` — package-manager
  scan, icon encoding to base64 PNG, self-package excluded.
- `app/src/main/java/com/apphistory/nativebridge/AppHistoryPlugin.kt` — Capacitor
  plugin bridge, Play Store resolution, capability reporting.
- `app/src/main/AndroidManifest.xml` — `QUERY_ALL_PACKAGES` declaration, `<queries>`
  for Play Store intents, and the policy comment.
- `app/src/main/java/com/apphistory/data/AppHistoryDatabase.kt` — Room schema
  (`TrackedApp`, `AppEvent`) for a future fully-native storage layer. **Not wired to
  the plugin**: the shipped build keeps history in the shared app layer so the same
  logic runs in the preview and on device.

## Package visibility (Android 11+)

Android does not let an app enumerate every installed package by default.

1. **Minimum approach.** Add `<queries>` entries for the intents you actually use
   (already included here for the Play Store). Only those packages are visible.
2. **Broad approach.** Declare `android.permission.QUERY_ALL_PACKAGES`. This is a
   Google Play *restricted* permission: the Play Console requires a declaration and
   approval, and it is only granted to apps whose core function needs it. App History
   falls in that category only if the policy reviewer accepts installed-app auditing
   as the app's core purpose.

If broad visibility is not granted, the scanner sees a subset of apps. The app must
therefore never claim to know every installed app — and it does not: apps are only
marked `UNINSTALLED` when a scan no longer detects a package that the app previously
recorded.

## Detecting uninstalled apps

The app deliberately does **not** register a background `PACKAGE_REMOVED` receiver:
that would require more permissions and could not report anything while the app was
stopped. Instead, reconciliation happens on each scan (Scan Now, or the lightweight
scan on app start):

- package found and not in history → new `INSTALLED` record with `firstSeen`/`lastSeen`
- package found and previously `UNINSTALLED` → back to `INSTALLED`, `uninstallDetectedAt` cleared
- recorded `INSTALLED` package not found → `UNINSTALLED` with `uninstallDetectedAt = now`

There is no claim of an OS notification, because none is used.

## Wiring it into a Capacitor Android project

```bash
npm install @capacitor/core @capacitor/android
npx cap add android
# copy the kotlin sources into android/app/src/main/java/com/apphistory/...
# copy the manifest entries into android/app/src/main/AndroidManifest.xml
npx cap sync android
```

The web assets in this repository are copied to `android/app/src/main/assets/public`
by `npx cap copy android`. No plugin registration is needed for a Capacitor 5+
project with `@CapacitorPlugin(name = "AppHistory")`.

## Not implemented here

- Cloud backup / sync (local-only by design).
- Background monitoring, periodic workers or battery-draining scans.
- Automatic installation or restoration of apps (impossible for third-party apps;
  the Play Store listing is opened instead).
