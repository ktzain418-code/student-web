# App History — build notes for future sessions

## Stack

React 18 + TypeScript + Vite. No backend, no Base44 entities: all data lives in
IndexedDB on the device (`src/db/`). The Android shell is Capacitor with one
native plugin (`android-native/`).

## How to run / verify in the sandbox

```bash
docker compose -f docker-compose.base44.yml up -d --build
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/
docker compose -f docker-compose.base44.yml exec -T web npm run typecheck
```

Dependencies are installed at container startup into the `node_modules` volume
(the source is bind-mounted, so the image holds nothing). The first `up` takes
~1–2 minutes while npm installs.

## What the sandbox preview can and cannot do

- `http://localhost:3000` serves the real Vite dev server — edits hot-reload.
- **Installed-app scanning does not work in a browser.** `deviceProvider`
  reports unavailable (Capacitor is not native) and the UI says so; it never
  fabricates a device list.
- To exercise scanning, lists, uninstall detection and history in the preview,
  turn on **Settings → Developer → Demo mode**. Demo data uses a *separate*
  IndexedDB database (`apphistory-demo`), so it can never be confused with a real
  history. Demo scan #1 detects 12 sample apps; every later scan omits two of
  them, which demonstrates uninstall detection.
- Demo mode deliberately disables the automatic startup scan so the scenario
  stays deterministic: the first scan happens when you press SCAN NOW.

## Non-obvious rules in the code

- `executeScan` refuses to mark apps uninstalled when a scan returns zero apps,
  or when more than ~80 % of tracked installed apps would disappear at once —
  that pattern is Android package visibility, not real uninstalls. Keep those
  guards; they are the difference between honest and misleading history.
- Uninstalls are detected by comparing scans. There is **no** `PACKAGE_REMOVED`
  receiver, so copy must never claim Android notified the app.
- The automatic check runs on open **and** every return to the foreground
  (`visibilitychange`/`focus`), debounced by `AUTO_SCAN_MIN_GAP_MS` (20 s). That
  is what picks up a reinstall after the user comes back from the Play Store.
- `Open app` goes through `src/native/appLauncher.ts` →
  `InstalledApps.openApp`, which rejects with `NOT_INSTALLED` when the package
  has no launch intent. `OpenAppButton` never renders for `UNINSTALLED` records
  and triggers a scan on `NOT_INSTALLED`.
- Theme is applied before first paint in `src/main.tsx` (reads the same
  localStorage key as the store) to avoid a light flash in dark mode.
- `Reinstall` only opens the Play Store; it never installs. "Listing
  unavailable" is a real state produced by `src/native/playStore.ts`.

## Android

`android-native/README.md` has the overlay steps (`npx cap add android`, copy the
Kotlin package, merge the manifest `<queries>` block). The default build uses
launcher-only visibility; `QUERY_ALL_PACKAGES` is commented out and needs Play
Console approval. The module exposes two bridge methods: `scanInstalledApps` and
`openApp`.
