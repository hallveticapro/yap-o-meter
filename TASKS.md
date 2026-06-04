# TASKS.md

## Project

- Project name: Classroom Voice Meter / Yap-o-Meter
- Production URL: https://yap.ahall.dev
- App type: classroom web app
- Intended users: elementary classroom teacher and students
- Deployment environment: This app is deployed on the owner’s Unraid server.
- Deployment note: Docker, GHCR, compose, reverse proxy, networking, microphone permissions, HTTPS, and environment-variable guidance should account for self-hosted deployment on Unraid.

## Source of Truth

Before making changes, read:

1. `AGENTS.md`
2. the most recent `references/POST_IMPLEMENTATION_AUDIT-*.md`
3. the most recent `references/AUDIT-*.md`
4. `UPDATES.md`, if it exists
5. `README.md`, if it exists
6. `package.json`
7. Docker, compose, and GitHub Actions workflow files

Use `TASKS.md` and the latest post-implementation audit as the implementation roadmap.

## Main Objective

Implement all remaining safe recommendations from the Yap-o-Meter post-implementation audit.

The repository is already in good local shape, so this pass should focus on remaining issues, deployment polish, documentation accuracy, CI/tooling maintenance, and final organization.

Work from highest priority to lowest priority:

1. Remaining Medium findings
2. Remaining Low findings
3. Deferred or manual verification items that can be automated or documented
4. Docker/GHCR/Unraid improvements
5. README, AGENTS.md, and UPDATES.md updates
6. Markdown reference organization
7. Final validation and push

Do not implement an item if it:

- requires secrets, credentials, paid services, or external accounts you do not have
- requires physical access to the owner’s Unraid server or classroom devices
- creates a privacy risk
- exposes microphone data, raw audio, classroom data, student data, or sensitive configuration
- requires a broad rewrite outside the audit’s intent
- conflicts with a higher-priority recommendation
- cannot be safely completed in the current repo state

Any skipped item must be documented in `UPDATES.md` with the reason it was deferred.

## Voice Meter Safety Rules

Preserve microphone/audio privacy.

Do not:

- request microphone access before explicit teacher action
- record, store, cache, upload, or log raw audio
- transmit raw audio
- add analytics or tracking
- expose secrets, tokens, private keys, credentials, or `.env` values
- break the existing local-only audio analysis model

Must preserve or improve:

- explicit start/stop microphone flow
- clear microphone permission states
- clear inactive/paused/stopped states
- local audio processing
- media stream cleanup
- AudioContext cleanup
- analyser node cleanup
- alert output AudioContext cleanup
- timer/interval cleanup
- `requestAnimationFrame` cleanup
- reduced-motion support
- display/projector mode
- classroom preset behavior
- settings/profile import/export safety
- browser compatibility notes

Pay special attention to:

- iOS Safari
- Android Chrome
- Chromebooks
- school-managed devices
- smartboards/projectors
- long-running display sessions
- battery/performance impact
- browser autoplay/audio policies
- HTTPS microphone requirements

## Required Remaining Work From The Post-Implementation Audit

### 1. Resolve full `npm audit` dev-toolchain advisories

The post-implementation audit says production dependency audit passes, but full `npm audit` still fails due to Vite/esbuild dev-toolchain advisories.

Implement a safe dependency maintenance pass if possible.

Requirements:

- inspect current Vite, Vitest, plugin, and esbuild versions
- determine whether the advisories can be resolved without unsafe force upgrades
- avoid blind `npm audit fix --force` if it installs a breaking major version
- if upgrading is safe, update dependencies and lockfile
- run lint, typecheck, tests, build, production smoke, Docker build, and compose checks afterward
- if a major upgrade is required, implement it only if it can be completed safely in this pass
- if not safe, document exact remaining advisories and recommended upgrade path in `UPDATES.md`

### 2. Improve Docker production defaults

The post-implementation audit says raw Docker image runs work, but without `NODE_ENV=production`, the app logs development environment. Compose already sets production.

Improve this if safe.

Preferred fix:

- set `ENV NODE_ENV=production` in the Dockerfile runtime stage
- verify raw `docker run` logs production by default
- preserve compose behavior
- update README and AGENTS.md if Docker behavior changes

Do not break Unraid or compose deployment.

### 3. Address GitHub Actions Node runtime deprecation

The post-implementation audit says GitHub Actions emitted Node.js 20 action runtime deprecation annotations.

Inspect `.github/workflows/`.

If safe:

- update action versions to current stable versions that avoid the warning
- preserve GHCR multi-platform build/push behavior
- verify workflow syntax locally as much as possible
- after push, use GitHub CLI to check whether the workflow starts and succeeds if authenticated

If not safe:

- document the exact follow-up needed in `UPDATES.md`

### 4. Add or document deployment security headers/CSP

The post-implementation audit says security headers/CSP remain a future hardening task.

Implement if safe.

Options:

- add appropriate server-side security headers if the app server owns them
- document recommended reverse-proxy headers for Unraid if headers are expected to be set in NGINX Proxy Manager, SWAG, Cloudflare, or another proxy
- add CSP only if it can be verified without breaking Vite assets, service worker behavior, canvas rendering, alert audio, profile import/export, or app startup

Do not over-tighten CSP in a way that breaks the app.

If full CSP needs real deployment testing, document the recommended header plan and manual verification steps.

### 5. Manual classroom-device validation checklist

The audit says real-device validation remains incomplete.

Because Codex cannot physically test classroom devices, update documentation with a clear manual validation checklist.

README should include or link to a checklist for:

- iOS Safari microphone permission
- Android Chrome microphone permission
- Chromebook microphone permission
- school-managed browser permission behavior
- projector/smartboard display mode
- fullscreen behavior
- reduced-motion behavior
- alert audio after teacher start
- stop microphone cleanup
- long-running session behavior
- Unraid reverse proxy HTTPS behavior
- `/api/health` from final production URL

### 6. Organize markdown reference files

Create a `references/` folder and move historical/reference markdown files into it.

Move files such as:

- `AUDIT-*.md`
- `POST_IMPLEMENTATION_AUDIT-*.md`
- old audit briefs
- old Codex prompt briefs
- other markdown files that are clearly historical/reference material rather than active root documentation

Keep these files at repository root unless there is an explicit project reason to move them:

- `README.md`
- `AGENTS.md`
- `TASKS.md`
- `UPDATES.md`

After moving markdown files:

- update any links or references that point to the old file locations
- update README.md if it references audit files
- update AGENTS.md so future agents know to look in `references/`
- update UPDATES.md with what was moved
- make sure future agents can still find latest audits in `references/`
- do not move files blindly if a tool or convention expects them at root

### 7. Replit cleanup verification

Search again for Replit references.

Use:

```bash
rg -n "replit|\.replit|replit\.nix" . --glob '!node_modules/**' --glob '!.git/**' --glob '!dist/**'
```

If `rg` is unavailable, use:

```bash
grep -Rni "replit" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist
```

No active Replit config, scripts, setup instructions, deployment guidance, or runtime HTML should remain.

Historical mentions inside audit/task/update/reference records may remain if they are clearly historical.

Document the result in `UPDATES.md`.

## README Requirement

Update `README.md`.

The README should accurately reflect the final app after this pass.

Include or update:

- current project description
- local development commands
- package manager
- validation commands
- lint/typecheck/test/build commands
- microphone privacy behavior
- local-only audio analysis
- explicit start/stop flow
- alert audio behavior
- reduced-motion/display mode
- calibration behavior
- room profiles/import/export behavior
- browser compatibility notes
- manual classroom-device validation checklist
- Docker/GHCR usage
- Unraid deployment notes
- expected GHCR image name
- required ports
- required environment variables by name only
- restart policy recommendation
- reverse proxy/HTTPS notes
- `/api/health` behavior
- known limitations
- no active Replit guidance

Keep the README human-friendly. Put agent-specific details in `AGENTS.md`, not the README.

## AGENTS.md Requirement

Update `AGENTS.md` if any of these changed:

- commands
- architecture
- validation workflow
- test locations
- linting/tooling
- dependency audit status
- microphone behavior
- audio alert behavior
- Docker/GHCR/Unraid behavior
- CSP/security header guidance
- manual validation expectations
- references folder location
- future-agent instructions

Keep `AGENTS.md` concise and practical.

## Docker, GHCR, and Unraid Verification

Verify the deployment path again after changes.

Run appropriate checks, such as:

```bash
docker build -t yap-o-meter-final-verify .
docker compose config
docker compose build
```

If safe and available, also verify:

```bash
gh workflow list
gh run list --limit 5 --branch main
```

If you can run a local container, verify `/api/health`:

```bash
docker run --rm -p 5055:5000 yap-o-meter-final-verify
curl -fsS http://localhost:5055/api/health
```

If testing production env explicitly:

```bash
docker run --rm -e NODE_ENV=production -p 5056:5000 yap-o-meter-final-verify
curl -fsS http://localhost:5056/api/health
```

Document exactly what passed and what could not be verified.

Do not manually push a GHCR image unless the repo already has an established process and credentials are available. Prefer the existing GitHub Actions workflow.

## Validation

Run the full available validation set.

Use the repo’s actual package manager.

Run commands such as:

```bash
npm run lint
npm run check
npm test
npm run build
npm audit --omit=dev
npm audit
```

Run Docker/compose verification as described above.

Fix failures caused by your changes.

If a command cannot run, document why.

## Git Checkpoint Requirements

Before changes:

```bash
git status --short --branch
git branch --show-current
git remote -v
```

Do not discard or overwrite unrelated uncommitted work.

Commit after major checkpoints.

Suggested checkpoint commits:

```bash
git commit -m "Resolve Yap-o-Meter dependency audit follow-up"
git commit -m "Improve Yap-o-Meter Docker production defaults"
git commit -m "Update GHCR workflow actions"
git commit -m "Document classroom device validation checklist"
git commit -m "Organize markdown reference files"
git commit -m "Update README AGENTS and implementation notes"
git commit -m "Verify Docker GHCR and Unraid deployment path"
```

Before each commit:

1. run `git status --short`
2. review changed files
3. ensure no secrets, `.env` values, tokens, credentials, raw audio, generated junk, or unnecessary build artifacts are staged
4. stage only intentional files
5. commit with a clear message

At the end:

1. run final validation
2. commit remaining intentional changes
3. push to the current branch with `git push` if remote/auth are available
4. do not force push

If push fails, document why.

## UPDATES.md Entry

Append a dated entry to UPDATES.md with:

- summary
- files changed
- prior findings addressed
- functionality or deployment improvements implemented
- items deferred and why
- README updates
- AGENTS.md updates
- markdown files moved to `references/`
- Replit cleanup result
- Docker/GHCR/Unraid verification
- commands run and results
- git checkpoint commits
- push result
- remaining follow-up

Do not erase previous entries.

## Final Response

When finished, summarize:

1. files changed
2. findings addressed
3. functionality/deployment improvements implemented
4. items deferred and why
5. README updates
6. AGENTS.md updates
7. markdown files moved to `references/`
8. Replit cleanup result
9. Docker/GHCR/Unraid verification result
10. validation commands and results
11. git commits created
12. whether push succeeded
13. remaining follow-up

Do not include huge logs. Be specific and honest.
