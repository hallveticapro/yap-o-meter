# TASKS.md

## Project

- Project name: Classroom Voice Meter / Yap-O-Meter
- Production URL: https://yap.ahall.dev
- App type: classroom web app
- Intended users: elementary classroom teacher and students
- Deployment environment: This app is deployed on the owner’s Unraid server.
- Deployment note: Docker, GHCR, compose, reverse proxy, networking, and environment-variable guidance should account for self-hosted deployment on Unraid.

## Source of Truth

Before making changes, read:

1. `AGENTS.md`
2. the most recent `AUDIT-*.md`
3. `UPDATES.md`, if it exists
4. `README.md`, if it exists

Use `TASKS.md` and the latest audit as the implementation roadmap.

## Main Objective

Implement all safe recommendations from the completed audit.

Work from highest priority to lowest priority:

1. Critical findings
2. High findings
3. Medium findings
4. Low findings
5. Immediate functionality opportunities
6. Next functionality opportunities
7. Later/Future functionality suggestions

Lower priority does not mean optional. Implement the full roadmap as much as safely possible.

Do not implement an item if it:

- requires secrets, credentials, paid services, or external accounts you do not have
- requires a product/design decision that needs human approval
- creates a privacy risk
- exposes student data, classroom data, microphone data, raw audio, or sensitive configuration
- requires a broad rewrite outside the audit’s intent
- conflicts with a higher-priority recommendation
- cannot be safely completed in the current repo state

Any skipped item must be documented in `UPDATES.md` with the reason it was deferred.

## Voice Meter Safety Rules

Preserve microphone/audio privacy.

Do not:

- request microphone access before explicit user action
- record, store, cache, upload, or log raw audio
- transmit raw audio unless the audit explicitly supports that design
- add analytics or tracking
- expose secrets, tokens, private keys, credentials, or `.env` values

Must preserve or improve:

- clear microphone permission state
- clear inactive/paused/stopped state
- local audio processing, if that is the current design
- media stream cleanup
- AudioContext cleanup
- analyser node cleanup
- timer/interval cleanup
- `requestAnimationFrame` cleanup
- reduced-motion support
- classroom/projector readability
- browser compatibility

Pay special attention to:

- iOS Safari
- Android browsers
- Chromebooks
- school-managed devices
- smartboards/projectors
- long-running display sessions
- battery/performance impact
- students seeing controls while projected

## Replit Cleanup

Search the entire repository for Replit references and unused Replit legacy files.

Look for:

- `.replit`
- `replit.nix`
- Replit deployment references
- Replit setup instructions
- Replit URLs
- Replit-specific scripts
- Replit-specific environment assumptions
- Replit comments
- old Replit-generated files
- unused server or startup files left from Replit
- package scripts that only existed for Replit
- README content that still mentions Replit

Remove Replit references from active code and documentation unless there is a confirmed current reason to keep them.

Delete legacy Replit files only when they are clearly unused.

If uncertain, keep the file and document the uncertainty in `UPDATES.md`.

## README Requirement

Update `README.md`.

The README should accurately reflect the current state of the app after implementation.

Include or update:

- project description
- current local development instructions
- package manager and commands
- environment variables by name only, with no secret values
- build instructions
- Docker/GHCR usage if applicable
- Unraid deployment notes
- example `docker run` or compose guidance if appropriate
- expected GHCR image name, if discoverable
- required ports
- required environment variables by name only
- restart policy recommendation
- reverse proxy notes if applicable
- deployment notes
- microphone/privacy notes
- browser compatibility notes
- reduced-motion/accessibility notes
- known limitations
- removal of stale Replit references

Keep the README human-friendly. Put agent-specific details in `AGENTS.md`, not the README.

## AGENTS.md Requirement

Update `AGENTS.md` if implementation changes:

- commands
- architecture
- microphone behavior
- audio processing behavior
- storage behavior
- Docker/GHCR/Unraid behavior
- privacy rules
- testing expectations
- project conventions
- known risks
- future-agent instructions

Keep `AGENTS.md` concise and practical.

## Docker, GHCR, and Unraid Deployment Verification

This app is deployed on the owner’s Unraid server.

Verify the container/GHCR build path as much as possible, and make sure the resulting documentation is useful for an Unraid-based deployment.

Inspect:

- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`
- `compose.yml`
- `.github/workflows/`
- GHCR references such as `ghcr.io`
- package scripts
- deployment documentation
- Unraid-specific notes, if any
- reverse proxy assumptions, if any
- exposed ports
- volume mounts
- required environment variables
- runtime configuration patterns

Check:

1. whether a Dockerfile exists
2. whether GHCR publishing is configured
3. the expected image name, if discoverable
4. whether the local Docker image builds
5. whether compose config/build works, if applicable
6. whether the GitHub Actions GHCR workflow exists and appears valid
7. whether the workflow starts/succeeds after push, if GitHub CLI access is available
8. whether the README explains how to run the app from GHCR on Unraid
9. whether any compose examples or Docker run examples are accurate for Unraid
10. whether ports, environment variables, volumes, reverse proxy notes, and restart policy are documented clearly

Use commands only when appropriate:

```bash
docker build -t yap-o-meter-audit-verify .
docker compose config
docker compose build
gh workflow list
gh run list --limit 5
gh run view --log
```

Do not invent a GHCR workflow unless the audit explicitly recommends it or the repo clearly expects it.

Do not manually push a GHCR image unless the repo already has an established publishing process and credentials are available.

If Unraid-specific deployment cannot be fully verified from inside the repo, document what was verified and what the owner should manually confirm on the Unraid server.

## Git Checkpoint Rules

Use git throughout the task.

Before changes:

```bash
git status --short
git branch --show-current
git remote -v
```

If pre-existing uncommitted changes exist, do not overwrite or discard them. Document them.

Commit after major checkpoints, such as:

- audit findings implementation
- functionality improvements
- Replit cleanup
- README/AGENTS updates
- Docker/GHCR/Unraid fixes
- final validation updates

Before each commit:

1. run `git status --short`
2. review changed files
3. make sure no secrets, raw audio, generated junk, or unnecessary build artifacts are staged
4. stage only intended files
5. commit with a clear message

Example commit messages:

```bash
git commit -m "Implement voice meter audit findings"
git commit -m "Improve microphone privacy and cleanup"
git commit -m "Add classroom display functionality improvements"
git commit -m "Remove unused Replit legacy files"
git commit -m "Update README and agent documentation"
git commit -m "Verify Docker GHCR and Unraid deployment docs"
```

At the end:

1. run final validation
2. commit remaining intentional changes
3. push to the current branch with `git push` if remote/auth are available
4. never force push

If push fails, document why in `UPDATES.md` and the final response.

## Validation

Run the safest available validation commands from the repo.

Prefer commands listed in `AGENTS.md` or `package.json`.

Examples, only when appropriate:

```bash
npm run lint
npm run typecheck
npm test
npm run test
npm run build
docker build -t yap-o-meter-audit-verify .
docker compose config
docker compose build
```

Use the actual package manager based on the lockfile.

Fix failures caused by your changes.

If a command cannot run, document why.

## UPDATES.md Requirement

Append a dated entry to `UPDATES.md`. Do not erase previous entries.

Use this structure:

```md
## [CURRENT-DATE] - Audit implementation

### Summary

Briefly describe what was implemented.

### Files Changed

List files changed.

### Audit Findings Addressed

List finding IDs addressed.

### Functionality Opportunities Implemented

Group by:

- Immediate
- Next
- Later/Future

### README Updates

Summarize README changes.

### AGENTS.md Updates

Summarize AGENTS.md changes.

### Replit Cleanup

Document removed Replit references/files and anything intentionally kept.

### Docker, GHCR, and Unraid Verification

Document what was checked, what passed, and what could not be verified.

### Git Checkpoints

List branch, commit hashes, and whether push succeeded.

### Commands Run

| Command        | Result                              | Notes       |
| -------------- | ----------------------------------- | ----------- |
| `command here` | Passed/Failed/Blocked/Not available | Brief notes |

### Remaining Follow-Up

List every audit recommendation or functionality suggestion not implemented.

For each item, include:

- finding ID or functionality ID
- reason deferred
- what is needed before implementation
- recommended next action
```

Do not silently omit skipped items.

## Final Response

When finished, respond with:

1. files changed
2. audit findings addressed
3. functionality opportunities implemented
4. items deferred and why
5. README updates completed
6. AGENTS.md updates completed
7. Replit cleanup completed
8. Docker/GHCR/Unraid verification result
9. git commits created
10. whether final push succeeded
11. commands run and whether they passed
12. remaining risks or follow-up items
