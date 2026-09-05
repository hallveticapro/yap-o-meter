# AGENTS.md

## Project

Yap-o-Meter is a classroom voice meter for elementary teachers and students.
It requests microphone access only after a teacher action, analyzes volume locally
in the browser, and displays animated visual feedback for classroom volume.

- Production URL: https://yap.ahall.dev
- Deployment target: owner's Unraid server via Docker/GHCR and a reverse proxy.
- Main flow: start microphone, tune settings, optionally enter display mode, stop microphone.

## Stack

- React 18 + TypeScript + Vite 8.
- Wouter route `/` renders the voice meter.
- Express serves the production bundle, `/api/health`, and JSON `/api/*` 404s.
- Tailwind CSS with a small retained shadcn/Radix primitive set.
- npm with `package-lock.json`.
- Vitest + Testing Library, ESLint flat config.
- Dockerfile and GitHub Actions use Node.js 22.

## Key Files

- `client/src/pages/voice-meter.tsx`: main app state, settings, profiles, display mode, calibration, alerts.
- `client/src/hooks/use-microphone.ts`: microphone lifecycle, Web Audio analyser, cleanup, calibration.
- `client/src/lib/voice-meter-settings.ts`: defaults, presets, sanitization, calibration/profile helpers.
- `client/src/lib/audio-level.ts`: volume calculation helper.
- `client/src/lib/audio-alerts.ts`: generated local alert sounds from a teacher-initiated AudioContext.
- `client/src/components/canvas-visualizer.tsx`: canvas loop, visual themes, reduced-motion rendering.
- `client/src/components/settings-sidebar.tsx`: teacher settings, presets, profiles, import/export.
- `client/src/components/status-panel.tsx`: live status, stop/pause controls, history, calibration review.
- `client/public/sw.js`: service worker; navigation network-first, static assets cache-first.
- `server/routes.ts`: API health and JSON API 404s.
- `server/production.ts`: production static server with security headers/CSP.

## Commands

- Install: `npm ci`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- TypeScript: `npm run check`
- Tests: `npm run test`
- Build: `npm run build`
- Production start after build: `npm run start`
- Dependency audit: `npm audit --omit=dev` and `npm audit`
- Compose validation: `docker compose config`

## Environment

- `PORT`: server port, default `5000`.
- `NODE_ENV`: set by scripts, compose, and Docker image.
- `DEV_BIND_HOST`: dev bind host, default `127.0.0.1`.
- `DEV_ALLOWED_HOSTS`: comma-separated Vite dev host allowlist.
- `HOST_PORT`: Compose host port, default `5000`; container listens on `5000`.

No database, session secret, account system, or persistent server-side store is required.

## Privacy Rules

- Do not request microphone access before a clear in-app teacher action.
- Do not record, store, upload, transmit, or log raw audio.
- Do not add analytics or tracking without explicit approval and a privacy update.
- Keep live volume derived data in memory unless a future product decision explicitly allows persistence.
- Keep settings/profile exports limited to non-sensitive configuration values.
- Preserve true stop behavior: stop tracks, disconnect nodes, close AudioContexts, cancel rAF/timers.
- Keep pause wording clear: pausing visuals is not stopping the microphone.
- Keep service worker behavior and security headers compatible with browser microphone access.

## Development Rules

- Prefer small focused changes that follow existing React/Tailwind patterns.
- Keep browser API lifecycle work inside hooks where practical.
- Use `@/` and `@shared/` aliases already configured in Vite/TypeScript/Vitest.
- Use `apply_patch` for manual edits.
- Avoid touching shadcn-generated primitives unless the requested behavior requires it.
- Do not add dependencies without a concrete reason and validation.
- Keep docs accurate when commands, privacy behavior, deployment, or storage behavior changes.
- Check `git status --short` before finishing; do not stage unrelated work.

## Deployment Notes

- Expected image: `ghcr.io/hallveticapro/yap-o-meter:main`.
- Container listens on internal `PORT=5000`.
- Compose maps `${HOST_PORT:-5000}:5000`.
- Docker image defaults to `NODE_ENV=production`.
- Health check endpoint: `/api/health`.
- Restart policy recommendation: `unless-stopped`.
- Volumes: none required.
- Serve behind HTTPS on Unraid so browser microphone access works.

## Before Finishing Changes

- Choose checks for the affected behavior: lint/check for source changes, tests for changed behavior, build for client or server output, and `npm run start` after a build when server output changes.
- Run both npm audit commands after dependency changes and Docker/Compose checks when deployment behavior changes.
- Before a release, run the full relevant validation set and record any unavailable checks.
- Update `UPDATES.md` with one line: `YYYY-MM-DD: Short description.`
