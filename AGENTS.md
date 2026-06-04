# AGENTS.md

## Project Overview

Yap-o-Meter is a classroom voice meter for elementary teachers and students. It requests microphone access only after a teacher action, analyzes volume locally in the browser, and displays animated visual feedback for classroom volume.

- Production URL: https://yap.ahall.dev
- Deployment target: owner's Unraid server, usually via Docker/GHCR and a reverse proxy.
- Current primary flow: start microphone, tune preset/settings, optionally enter display mode, stop microphone when done.

## Tech Stack

- React 18 + TypeScript, built with Vite.
- Wouter routes `/` to the voice meter.
- Express serves the production bundle and `/api/health`.
- Tailwind CSS with shadcn/Radix primitives.
- npm with `package-lock.json`.
- Vitest + Testing Library for tests.
- ESLint flat config for linting.
- Dockerfile and GitHub Actions publish a GHCR image.

## Repository Map

- `client/src/pages/voice-meter.tsx`: main app state, settings, profiles, display mode, calibration, alerts.
- `client/src/hooks/use-microphone.ts`: explicit microphone lifecycle, Web Audio analyser, cleanup, calibration sampling.
- `client/src/lib/voice-meter-settings.ts`: defaults, presets, sanitization, calibration/profile helpers.
- `client/src/lib/audio-level.ts`: volume calculation helper.
- `client/src/lib/audio-alerts.ts`: generated local alert sounds; closes temporary AudioContexts.
- `client/src/components/canvas-visualizer.tsx`: stable canvas loop, visual themes, reduced-motion rendering.
- `client/src/components/settings-sidebar.tsx`: teacher settings, presets, profiles, import/export.
- `client/src/components/status-panel.tsx`: live status, stop/pause controls, history, calibration review.
- `client/public/sw.js`: static-asset service worker for production.
- `server/routes.ts`: currently registers `/api/health`.
- `server/production.ts`: production static server entry bundled by `npm run build`.

## Commands

| Purpose | Command | Current status |
| --- | --- | --- |
| Install dependencies | `npm ci` | Used by Docker/CI; local install currently present. |
| Dev server | `npm run dev` | Script exists; serves on `PORT` or 5000. |
| Lint | `npm run lint` | Passed on 2026-06-03. |
| TypeScript check | `npm run check` | Passed on 2026-06-03. |
| Tests | `npm run test` | Passed on 2026-06-03; 10 tests. |
| Build | `npm run build` | Passed on 2026-06-03. |
| Production start | `npm run start` | Passed via local smoke test on 2026-06-03 after build. |
| Docker build | `docker build -t yap-o-meter-audit-verify .` | Passed on 2026-06-03. |
| Compose validation | `docker compose config` | Passed on 2026-06-03. |
| Compose build | `docker compose build` | Passed on 2026-06-03. |
| Docker image smoke | run image and curl `/api/health` | Passed on 2026-06-03. |

## Environment Variables

- `PORT`: optional server port, defaults to `5000`.
- `NODE_ENV`: development or production; npm scripts set it.

No database URL, session secret, account system, or server-side data store is required by the current app.

## Privacy Rules

- Do not request microphone access before a clear in-app teacher action.
- Do not record, store, upload, transmit, or log raw audio.
- Do not add analytics or tracking without explicit approval and a privacy update.
- Keep derived live volume in memory unless a future product decision explicitly allows persistence.
- Keep settings/profile exports limited to non-sensitive configuration values.
- Preserve true stop behavior: stop tracks, disconnect nodes, close AudioContext, cancel rAF/timers.
- Keep pause wording clear: pausing visuals is not the same as stopping the microphone.

## Development Conventions

- Prefer small focused changes that follow existing React/Tailwind patterns.
- Keep browser API lifecycle work inside hooks where practical.
- Use `@/` and `@shared/` aliases already configured in Vite/TypeScript/Vitest.
- Use `apply_patch` for manual edits.
- Avoid touching shadcn-generated primitives unless the requested behavior requires it.
- Do not add dependencies without a concrete reason and validation.
- Keep docs accurate when commands, privacy behavior, deployment, or storage behavior changes.

## Docker, GHCR, And Unraid

- Expected image: `ghcr.io/hallveticapro/yap-o-meter:main`.
- Container listens on `PORT`, default `5000`.
- Health check endpoint: `/api/health`.
- Restart policy recommendation: `unless-stopped`.
- Volumes: none required.
- Unraid should serve the app behind HTTPS for browser microphone access on the deployed URL.
- If GHCR access is private, Unraid must be authenticated before pulling.

## Known Risks

- Manual device validation remains important: iOS Safari, Android Chrome, Chromebooks, projectors, and smartboards.
- `npm audit --omit=dev` is clean after the dependency maintenance pass.
- Full `npm audit` still reports Vite/esbuild dev-toolchain advisories that require a breaking major upgrade path.
- Service worker scope intentionally caches static assets only; do not cache audio-derived data.
- Room profiles are local browser settings unless exported/imported manually.

## Future Agent Checklist

Before finishing code changes:

1. Run `npm run lint`, `npm run check`, `npm run test`, and `npm run build`.
2. Run Docker/compose checks when deployment behavior changed.
3. Smoke test `npm run start` after a production build when server output changed.
4. Check `git status --short` and stage only intentional files.
5. Update `UPDATES.md` with commands, commits, deferred items, and honest verification results.
