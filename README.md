# Yap-o-Meter

Yap-o-Meter is a classroom voice meter for teachers. It uses the browser microphone to measure live room volume locally, then turns the derived volume level into a projector-friendly visualizer.

Production URL: [https://yap.ahall.dev](https://yap.ahall.dev)

## What It Does

- Explicit microphone start/stop flow for each browser session.
- Local Web Audio API volume analysis; raw audio is not recorded, stored, uploaded, or sent to the server.
- Animated classroom visual themes with threshold feedback and optional audio alerts.
- Classroom presets for silent work, partner talk, group work, transitions, and indoor recess.
- Calibration suggestions that teachers can review before applying.
- A combined reduced-motion / low-stimulation display option.
- Display mode for fullscreen/projector use with teacher controls hidden.
- Short in-memory volume trend display.
- Local room profiles plus JSON settings import/export.
- Static-asset service worker for production PWA/offline readiness.

## Privacy And Microphone Behavior

The microphone is only requested after the teacher presses Start Microphone. If permission was granted in a previous browser session, Yap-o-Meter still waits for that in-app action before opening the microphone.

Audio processing happens in the browser with the Web Audio API. The app uses derived volume levels for the visualizer and alert logic. It does not use `MediaRecorder`, does not keep raw audio buffers, does not upload audio, and does not add analytics or tracking.

Settings and room profiles are stored in the browser's `localStorage`. Recent volume history is short-lived, aggregate, and in memory only.

Microphone access requires a secure browser context. Use HTTPS for hosted deployments such as Unraid behind a reverse proxy. `localhost` is acceptable for local development.

## Local Development

Requirements:

- Node.js 18 or newer
- npm, using the checked-in `package-lock.json`

Install dependencies:

```bash
npm ci
```

Start the local development server:

```bash
npm run dev
```

The app listens on `http://localhost:5000` by default unless `PORT` is set.

Useful commands:

```bash
npm run lint
npm run check
npm run test
npm run build
```

Run the production bundle locally after a build:

```bash
npm run build
npm run start
```

## Environment Variables

Only variable names are documented here; do not commit environment values.

- `PORT`: optional server port. Defaults to `5000`.
- `NODE_ENV`: set by the npm scripts; use `production` for the bundled server.

The current app does not require a database, session secret, account system, or persistent server-side storage.

## Docker

Build locally:

```bash
docker build -t yap-o-meter-audit-verify .
```

Run a local image:

```bash
docker run --rm -p 5000:5000 -e PORT=5000 yap-o-meter-audit-verify
```

Run from GHCR:

```bash
docker run -d \
  --name yap-o-meter \
  --restart unless-stopped \
  -p 5000:5000 \
  -e PORT=5000 \
  ghcr.io/hallveticapro/yap-o-meter:main
```

Health check endpoint:

```text
/api/health
```

Compose:

```bash
PORT=5000 docker compose up -d
```

No volume mounts are required for the app itself.

## GHCR

The repository includes `.github/workflows/build-and-deploy.yml`. On pushes to `main` or `master`, the workflow runs npm install/test/build steps, then builds and publishes a multi-platform Docker image to:

```text
ghcr.io/hallveticapro/yap-o-meter
```

Expected branch tag for the current main branch:

```text
ghcr.io/hallveticapro/yap-o-meter:main
```

The workflow also publishes `latest` on the default branch and SHA-prefixed tags.

## Unraid Deployment Notes

For an Unraid Docker template, use:

- Repository: `ghcr.io/hallveticapro/yap-o-meter:main`
- Network type: bridge, unless your reverse proxy setup needs a different network
- Container port: `5000`
- Host port: any free port, commonly `5000`
- Environment variable: `PORT=5000`
- Restart policy: `unless-stopped`
- Volumes: none required
- Health path for proxy checks: `/api/health`

For microphone access from classroom devices, serve the app over HTTPS through your reverse proxy, for example at `https://yap.ahall.dev`. Confirm that the proxy forwards to the Unraid container's host port and that browser microphone prompts appear on the final public URL.

After updating the image, pull the latest GHCR tag from Unraid and recreate/restart the container. If using a private package setting in GitHub Container Registry, make sure the Unraid server is authenticated to pull the image.

## Browser And Classroom Compatibility

Yap-o-Meter is designed for current Chrome, Edge, Firefox, Safari, Android Chrome, iOS Safari, Chromebooks, tablets, projectors, and smartboards. Browser support still depends on the device allowing microphone access through `navigator.mediaDevices.getUserMedia`.

Classroom checks to perform before relying on it live:

- Confirm microphone permission and input selection on the actual teacher device.
- Confirm HTTPS access on the final deployed URL.
- Test display mode on the projector or smartboard.
- Test reduced-motion / low-stimulation mode for classrooms that need calmer visuals.
- Leave a long session running on target hardware to watch battery/performance behavior.

## Known Limitations

- Manual cross-browser, smartboard, and Unraid-server validation still needs to be completed on the owner's actual hardware.
- `npm audit --omit=dev` is clean after the dependency maintenance pass.
- Full `npm audit` still reports Vite/esbuild dev-toolchain advisories that require a breaking major upgrade path.
- Room profiles are local to one browser unless exported and imported manually.
- The service worker caches static assets only. It intentionally does not cache microphone data or volume history.

## Connect

- GitHub: [hallveticapro/yap-o-meter](https://github.com/hallveticapro/yap-o-meter)
- Threads: [@hallveticapro](https://www.threads.net/@hallveticapro)
- Instagram: [@hallveticapro](https://www.instagram.com/hallveticapro)
- TikTok: [@hallveticapro](https://www.tiktok.com/@hallveticapro)

Created by Andrew Hall for classroom use.
