# App History

**Remember the apps you've used.**

App History is an Android app that keeps a private, on-device history of the
applications it detects on your phone. Apps that are currently installed are
listed as *Installed*; apps that were detected before but are no longer on the
device move to **Uninstalled Apps** with the date they disappeared.

> App History remembers apps that **this app previously detected**. It cannot
> recover, restore or reinstall a deleted app. Where a Play Store listing
> exists, it can open that listing for you.

## What it does

- **Dashboard** — Total Apps Tracked, Currently Installed, Previously Installed,
  Recently Uninstalled, a large **SCAN NOW** button and the last scan time.
- **Scanning** — reads the apps Android allows this app to see, then compares
  them with the saved history. A previously detected package missing from a scan
  is marked *uninstalled* with a timestamp and a history event.
- **Installed screen** — searchable, filterable (user/system) and sortable (A–Z,
  Recent) list of currently detected apps.
- **Uninstalled Apps screen** — every previously detected app that is no longer
  present, with both dates and a **Reinstall** button that opens the Play Store
  listing when one can be resolved, or says *"Play Store listing unavailable"*.
- **App details** — icon, name, package, status, first seen, last seen,
  uninstall date, per-app timeline, reinstall and delete-history actions.
- **Global search** — by app name or package name, across installed and
  uninstalled apps.
- **History** — chronological timeline ("App detected", "App marked as
  uninstalled", "App detected again") grouped by day.
- **Settings** — light / dark / system theme, automatic startup check toggle,
  Clear History, Delete All Data, privacy settings, developer demo mode.

## Privacy

Your app history stays on the device. There is no account, no server and no
upload; cloud backup is not part of this version.

- Only installed-app facts are read: app name, package name, launcher icon,
  detection dates, status.
- No contacts, files, messages, photos, location or usage statistics.
- The first launch explains this and requires an explicit **Continue** before
  any scan can run.
- **Clear History** removes the timeline; **Delete All Data** erases everything.

## Architecture

```
src/
  db/          IndexedDB storage (apps, history events, last scan)
  scan/        scan engine: comparison, safety guards, atomic commit
  native/      the ONLY place that touches installed-app data
    deviceProvider.ts   Capacitor bridge to the Kotlin plugin
    demoProvider.ts     clearly separated sample data for development
    playStore.ts        market:// + web Play Store hand-off
  state/       app store (React context): scan workflow, settings, theme
  pages/       Dashboard, Installed, Uninstalled, History, Details, Search,
               Settings, Privacy, first-run consent
android-native/  Kotlin module that reads PackageManager — see its README
```

**Native capability required.** Android does not let a web page enumerate
installed apps, so that part is a real native module, not a web feature:
`android-native/` contains `InstalledAppsReader` (PackageManager) and
`InstalledAppsPlugin` (Capacitor bridge). When the web UI runs outside that
Android shell – including this sandbox preview – the scan reports *unavailable*
and the interface explains why. **No device data is invented.**

**Package visibility.** The default Android build declares only the
`MAIN`/`LAUNCHER` `<queries>` intent, so App History sees launcher apps without
the Play-restricted `QUERY_ALL_PACKAGES` permission. That mode is reported as
*limited* in the UI. A scan that loses all or most known apps is treated as a
visibility change rather than a burst of uninstalls, and is never written as
such.

## Development

The app is served by Vite (React + TypeScript). In the Base44 sandbox:

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

or locally:

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
```

### Demo mode (development only)

The sandbox has no Android device, so the preview starts with an empty,
unavailable scan state. `Settings → Developer → Demo mode` switches to a
separate `apphistory-demo` database with sample apps; the first scan detects 12,
and every later scan is missing two of them so uninstall detection can be
reviewed. Demo records are labelled throughout and can never mix with a real
history. Production behaviour is unchanged: demo mode is off by default and
never seeded.

### Building the Android app

See [`android-native/README.md`](android-native/README.md) — `npx cap add
android`, copy the Kotlin package, merge the manifest, `npx cap sync android`.

## Limits, stated honestly

- Apps hidden by Android package visibility cannot be tracked, and the UI says
  when that applies.
- Apps with no Play Store listing cannot be reopened from the Play Store.
- Uninstalls are detected at scan time, not the moment they happen — there is no
  background listener in this version.
