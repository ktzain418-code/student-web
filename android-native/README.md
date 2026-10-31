# App History — native Android module

The web UI in `src/` is a complete App History interface, but **Android does not
allow a web page to list installed apps**. That capability lives in this folder
as real Kotlin code, and it is the only native piece the app needs.

Nothing here is a stub or mock: `InstalledAppsReader` calls Android's
`PackageManager`, and `InstalledAppsPlugin` exposes it to the web layer through
Capacitor as `InstalledApps.scanInstalledApps()`.

## What the module returns

For every app the device lets us see:

| Field         | Source                                                       |
| ------------- | ------------------------------------------------------------ |
| `appName`     | `PackageManager.getApplicationLabel(applicationInfo)`         |
| `packageName` | `applicationInfo.packageName`                                 |
| `icon`        | launcher drawable, downscaled to 96 px PNG, base64 data URL   |
| `isSystemApp` | `ApplicationInfo.FLAG_SYSTEM`                                 |

…plus a `visibility` value (`full` / `limited`) and an explanatory `note`.

It does **not** read contacts, files, messages, usage stats or any app content,
and it uploads nothing. The web layer stores the result in IndexedDB on the
device only.

## Wiring it into an Android build

Prerequisites: Android Studio (or the Android SDK + JDK 17), and Node 20+.

```bash
# 1. Build the web assets Capacitor will bundle
npm install
npm run build

# 2. Generate the Android project (creates ./android)
npx cap add android

# 3. Overlay this module on top of the generated project
cp -R android-native/app/src/main/java/com/apphistory/tracker \
      android/app/src/main/java/com/apphistory/tracker
cp android-native/app/src/main/AndroidManifest.xml \
   android/app/src/main/AndroidManifest.xml   # or merge only the <queries> block

# 4. Merge the settings from android-native/app/build.gradle.kts into
#    android/app/build.gradle.kts (namespace, minSdk 23, Kotlin 17, Capacitor deps)

# 5. Copy the web build into the native project and run it
npx cap sync android
npx cap open android        # then Run ▶ on a device or emulator
```

`capacitor.config.ts` already sets `appId: com.apphistory.tracker`, so the Kotlin
package and the application id match.

After each `npm run build` of the UI, run `npm run android:sync`.

## Package visibility — what Android actually allows

**Default build (limited mode).** `AndroidManifest.xml` declares a `<queries>`
intent for `MAIN`/`LAUNCHER`. That means App History sees the apps that have a
launcher icon — which is exactly what a user thinks of as "their apps". No
special permission, no Play Store policy declaration. The reader reports
`visibility: "limited"`, and the UI says so.

**Full mode (opt-in).** Uncomment `QUERY_ALL_PACKAGES` in the manifest and the
reader will see every installed package, including apps without a launcher icon
and (on some devices) more system packages. Google Play restricts this
permission to declared, approved use cases; publishing without an approved
declaration can get the app rejected or removed. Only enable it if you have that
approval.

**Before Android 11 (API < 30)** there is no package filtering and the reader
reports `full`.

The web layer never assumes it can see everything:

- a scan that returns **zero** apps changes nothing and shows an error;
- a scan that suddenly loses **most** tracked apps is treated as a visibility
  change, not as dozens of uninstalls, and is reported to the user;
- when visibility is `limited`, an app that disappears is still marked
  uninstalled but flagged as *possible visibility issue* in the UI.

## Detection model (no fake OS events)

There is no `PACKAGE_REMOVED` broadcast listener in this build, so App History
never claims Android notified it. Uninstalls are detected **by comparison**: a
previously detected package missing from the next scan. Scans happen when:

- the user taps **Scan Now**, or
- the app opens and the last scan is older than 6 hours (setting can disable it).

No background service, no polling, no WorkManager job.

## Play Store hand-off

`Reinstall` never installs anything. `src/native/playStore.ts` opens
`market://details?id=<package>` and falls back to
`https://play.google.com/store/apps/details?id=<package>`. When neither can be
opened — or the package name is not a valid Play identifier — the UI shows
**"Play Store listing unavailable"** and offers to copy the package name.

Android gives web content no API to ask whether a store listing exists, so the
app does not pretend to know: it tries to open, watches whether the page was
backgrounded, and reports honestly when nothing happened.
