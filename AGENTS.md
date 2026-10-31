# Working on this repo

## What this is
A single-page static site: `index.html`, `styles.css`, `script.js`. No package.json,
no build step, no backend, no environment variables or external credentials.
Provider listings are hardcoded in `script.js`; images load from Unsplash URLs.

## Running it (Base44 sandbox)
```bash
docker compose -f docker-compose.base44.yml up -d
```
* `web` is a plain `python:3.12-slim` image running `.base44/serve.py` with the
  repository bind-mounted read-only at `/app`, so the container serves the cloned
  source — never a prebuilt bundle.
* Public entry point: host port 3000 → container port 80.
* `.base44/serve.py` is `http.server` plus `Cache-Control: no-store`; without it the
  browser keeps a stale `script.js` after an edit (plain `http.server` only sends
  `Last-Modified`). There is no hot reload — edits show up on the next page load;
  call `reload_preview` if the preview still holds an old response.
* Healthcheck hits `/` with `urllib`; failures mean the server process died.

## Notes
* `.github/workflows/npm-publish-github-packages.yml` expects `npm ci` / `npm test`,
  but this repo has no `package.json` — that workflow cannot run as-is and is not
  used by the sandbox setup.
* The nav toggle, course filters, search, provider modal and registration form are
  all client-side logic in `script.js`; nothing is persisted anywhere.
