# Codex Audit Brief: Classroom Voice Meter / Yap-O-Meter

You are auditing this repository for the first time. Treat this as a deep technical review, not a quick lint pass.

Project being audited:

- Project name: Classroom Voice Meter / Yap-O-Meter
- Production URL: https://yap.ahall.dev
- Project type: classroom web app
- Intended users: elementary classroom teacher and students
- Domain context: This app uses browser microphone input to provide visual feedback about classroom noise level. It may be displayed on a projector, smartboard, classroom screen, tablet, or teacher device.
- Current task date: Determine the current date at runtime.
- Required output files:
  - `AGENTS.md`
  - `AUDIT-[CURRENT-DATE].md`
  - `UPDATES.md`

Before creating the audit file, determine today’s date in `YYYY-MM-DD` format using the environment or shell if available.

Preferred command:

```bash
date +%F
```

If that command is unavailable, use the current date from the runtime environment. If neither is available, choose the best available current date from system context and document that limitation in the audit.

The audit file must be named using the actual current date discovered at runtime.

Examples:

- If today is 2026-06-09, create `AUDIT-2026-06-09.md`.
- If today is 2026-07-15, create `AUDIT-2026-07-15.md`.

Do not create a file literally named `AUDIT-YYYY-MM-DD.md`.
Do not create a file literally named `AUDIT-[CURRENT-DATE].md`.
Do not use an old date from this prompt.
Do not assume the date from examples.

Your job is to inspect the repository deeply, understand how it is built, identify risks and improvement opportunities, suggest improved functionality, and create durable documentation for future coding agents.

Do not assume prior knowledge of the repository. Build your understanding from the files in this repo.

Primary goals:

1. Reverse-engineer the project structure.
2. Identify the tech stack, build system, runtime assumptions, deployment model, and major app flows.
3. Audit for best practices, maintainability, security, privacy, accessibility, performance, reliability, and developer experience.
4. Pay special attention to microphone permissions, audio privacy, local vs remote audio processing, animation performance, browser compatibility, and classroom display usability.
5. Identify missing or underdeveloped functionality that would make the app more useful, safer, easier to maintain, or more classroom-ready.
6. Create an `AGENTS.md` that gives future coding agents concise, practical instructions for working in this repository.
7. Create an `AUDIT-[CURRENT-DATE].md` file containing your findings, evidence, recommendations, functionality suggestions, and prioritized next steps.
8. Create or update `UPDATES.md` to document every file you created or changed during this task.

Important operating rules:

- Do not rewrite the app.
- Do not make broad refactors.
- Do not implement new features during this audit.
- Do not change production behavior unless required to complete the documentation task.
- Do not add dependencies unless absolutely necessary for documentation generation, which should usually require none.
- Do not delete code.
- Do not “fix” findings silently. Document them instead.
- If you notice a tiny obvious typo in documentation, you may fix it, but avoid code changes unless explicitly necessary.
- If tests, linting, or builds fail, do not hide it. Document exactly what failed and include relevant command output summaries.
- If commands cannot be run because dependencies are missing, environment variables are unavailable, scripts are absent, or the sandbox lacks network access, document that clearly.
- Never include secrets, tokens, private keys, credentials, or sensitive environment values in any output file.
- If `.env`, `.env.local`, deployment files, or config files exist, inspect their variable names and usage patterns, but do not expose secret values.
- Prefer specific evidence over vague advice.
- Use file paths when referencing findings.
- When possible, include line numbers or function/component names.
- Separate confirmed issues from hypotheses.
- If you are unsure, say what evidence would be needed to confirm the issue.
- Functionality suggestions should be practical for a solo developer and appropriate for a classroom tool, not fantasy enterprise bloat.

Phase 1: Repository discovery

Inspect the repository before writing anything.

Review, at minimum, any files matching these categories if present:

- `README.md`
- existing `AGENTS.md`
- existing `UPDATES.md`
- prior audit files matching `AUDIT-*.md`
- `package.json`
- lockfiles such as `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`
- framework config files such as `vite.config.*`, `next.config.*`, `astro.config.*`, `svelte.config.*`, `nuxt.config.*`
- TypeScript configs
- ESLint configs
- Prettier configs
- Tailwind configs
- PostCSS configs
- test configs
- Dockerfiles
- compose files
- GitHub Actions workflows
- deployment configs
- route/app files
- API/server files
- auth/session files
- browser microphone utilities
- Web Audio API utilities
- MediaRecorder usage, if any
- audio analysis/calibration/threshold utilities
- animation/rendering components
- visualizer components
- settings/configuration components
- public assets and metadata files
- service worker/PWA files, if present

Create a mental map of:

- package manager
- framework
- frontend architecture
- backend/API architecture, if any
- data persistence model
- deployment assumptions
- environment variables
- test/lint/build commands
- important source directories
- critical user flows
- security/privacy boundaries
- microphone/audio lifecycle
- animation/rendering lifecycle
- areas likely to break during future work
- areas where the app may be missing teacher-friendly functionality

Phase 2: Run available verification commands

Determine the correct commands from the repository itself. Do not invent commands if package scripts clearly define them.

Run the safest available checks, such as:

- dependency install if needed and feasible
- typecheck
- lint
- test
- build

Prefer existing scripts from `package.json`.

Examples, only if appropriate:

```bash
npm install
npm ci
npm run lint
npm run typecheck
npm test
npm run test
npm run build
```

If the project uses pnpm, yarn, or bun, use the matching package manager based on the lockfile and package manager metadata.

Record:

- exact commands run
- whether each passed or failed
- important warnings
- important errors
- whether failures appear pre-existing
- whether failures block confidence in the audit

Do not spend the entire task fighting environment setup. If setup is blocked, move on to static analysis and document the limitation.

Phase 3: Security and privacy audit

Audit the app according to its actual architecture.

Check for:

- accidental secrets in the repo
- unsafe exposure of environment variables
- insecure client-side assumptions
- unsafe use of `dangerouslySetInnerHTML`, raw HTML injection, markdown rendering, or user-generated content
- XSS risks
- dependency risk signals
- outdated or risky packages, if determinable from lockfiles/package metadata
- unsafe CORS configuration, if backend exists
- missing input validation
- unsafe URL parsing
- overly broad permissions
- insecure storage of user/classroom settings
- excessive logging of microphone/audio-derived data
- unnecessary analytics/tracking
- lack of security headers, if applicable
- lack of content security policy, if applicable
- deployment config issues
- potential denial-of-service or performance abuse paths

Specific Classroom Voice Meter / Yap-O-Meter concerns:

- Determine whether microphone access happens only after explicit user action.
- Determine whether raw audio is ever sent to a server, third-party API, analytics service, or remote endpoint.
- Determine whether audio processing is local, remote, or mixed.
- Determine whether any audio is recorded, stored, cached, uploaded, logged, or persisted.
- Determine whether volume/noise metrics are persisted.
- Determine whether microphone permission states are handled clearly.
- Determine whether the app behaves safely when permission is denied.
- Determine whether the app provides a clear stopped/paused/inactive state.
- Determine whether media streams are stopped when no longer needed.
- Determine whether audio tracks are cleaned up on stop, page change, component unmount, or refresh.
- Determine whether AudioContext, analyser nodes, intervals, timeouts, requestAnimationFrame loops, and event listeners are cleaned up.
- Determine whether the app handles hidden tabs, locked screens, suspended audio contexts, and browser autoplay/audio restrictions.
- Determine whether the app communicates microphone status clearly to the teacher.
- Determine whether projected classroom display mode avoids unnecessary controls.
- Determine whether browser compatibility concerns exist, especially for iOS Safari, Chrome, Edge, Android browsers, Chromebooks, and school-managed devices.
- Determine whether threshold/calibration settings are clear and durable.

Phase 4: Maintainability and architecture audit

Evaluate:

- project organization
- component boundaries
- naming consistency
- state management approach
- audio lifecycle management
- animation lifecycle management
- separation of audio analysis logic from UI
- separation of settings/configuration logic from UI
- duplication
- complexity hotspots
- error handling
- loading/empty/error/permission-denied states
- TypeScript strictness and type safety
- use of `any`
- validation strategy
- testability
- accessibility patterns
- responsive/mobile behavior
- comments and documentation quality
- whether current abstractions help or hurt
- whether future agents can safely modify the code

Look for places where the code works but is fragile. Document those as maintainability risks, not necessarily bugs.

Phase 5: Accessibility and classroom usability audit

Because this is classroom software, audit practical usability too.

Check for:

- keyboard accessibility
- focus states
- touch target sizes
- color contrast
- readable font sizes on projector/classroom displays
- reduced motion support
- screen reader labels for controls
- understandable permission-denied states
- understandable microphone inactive states
- clear reset/undo behavior
- teacher-friendly error messages
- offline or poor-network behavior, if relevant
- compatibility with tablets, Chromebooks, interactive boards, and classroom projectors
- whether students can misuse exposed controls if the app is projected
- whether visual feedback is understandable from a distance
- whether animations could be distracting or overstimulating
- whether thresholds are configurable
- whether calibration is needed for different rooms/devices
- whether the app can be used without displaying unnecessary teacher controls
- whether the app respects reduced-motion preferences
- whether the app remains useful in noisy rooms, quiet rooms, small groups, and whole-class settings

Phase 6: Functionality opportunity analysis

In addition to auditing the existing code, suggest improved functionality the project may be missing.

Do not implement these suggestions. Document them in the audit.

For each suggestion, include:

- suggestion title
- problem it solves
- expected user value
- rough implementation complexity: Low, Medium, or High
- privacy/security considerations
- recommended priority: Immediate, Next, or Later
- whether it requires product/design decisions before implementation

Consider ideas such as:

- first-run setup or calibration wizard
- room/device calibration profiles
- teacher-defined noise thresholds
- preset modes such as silent work, partner work, group work, transitions, and indoor recess
- visible microphone status indicator
- pause/resume control
- display-only mode that hides teacher controls
- fullscreen/projector mode
- reduced-motion mode
- low-stimulation theme
- high-contrast theme
- sound sensitivity curve adjustment
- visual history of recent noise levels
- session timer
- countdown timer integration
- class goal mode
- positive reinforcement mode
- gentle warning states
- customizable characters, themes, or classroom-safe visuals
- device/browser compatibility messaging
- privacy notice explaining that raw audio is not stored or transmitted, if true
- offline/PWA support
- settings import/export
- keyboard shortcuts for teacher controls
- automatic cleanup when navigating away
- battery/performance safeguards for long display sessions
- demo mode without microphone access
- manual test checklist for iOS Safari, Chromebooks, projectors, and smartboards

Be critical. Do not recommend features just because they sound cool. Favor features that reduce teacher workload, improve privacy, clarify microphone status, support classroom routines, or make the visual feedback more usable from across the room.

Phase 7: Create or update `AGENTS.md`

Create an `AGENTS.md` at the repository root.

If one already exists, improve it rather than replacing useful content blindly.

The file should be concise but genuinely useful. It should not duplicate the README unless the information is specifically useful for coding agents.

Required structure for `AGENTS.md`:

```md
# AGENTS.md

## Project Overview

Briefly describe what this app does, who it is for, and the production URL.

## Tech Stack

List the framework, language, package manager, major libraries, styling approach, storage/persistence approach, audio-processing approach, and deployment assumptions if known.

## Repository Map

Summarize the important directories and files. Keep this practical for future agents.

## Common Commands

List verified commands for installing, running locally, linting, typechecking, testing, and building. Mark commands as verified or unverified based on this audit.

## Environment Variables

Document required and optional environment variables by name only. Do not include secret values. If no environment variables are found, state that none were identified during the audit.

## Development Conventions

Document observed conventions for components, naming, state management, styling, data handling, testing, and formatting.

## Microphone and Audio Rules

Document how the app handles microphone access and audio processing. Include guidance for future agents about permission flow, local processing, audio cleanup, AudioContext lifecycle, media stream lifecycle, and avoiding raw audio persistence/transmission.

## Testing and Validation

Explain what future agents should run before submitting changes. Include known limitations in the current test setup.

## Security and Privacy Notes

Document project-specific safety rules:

- request microphone access only after explicit user action
- do not transmit raw audio unless explicitly approved and documented
- do not store recordings
- do not log raw audio or sensitive audio-derived data
- stop media tracks when no longer needed
- clean up AudioContext, analyser nodes, intervals, event listeners, and animation loops
- handle permission denial gracefully
- avoid analytics/tracking unless explicitly approved
- preserve clear teacher-facing microphone status

## Accessibility and Classroom UX Notes

Document accessibility and classroom-specific expectations, including reduced motion, projected display readability, teacher controls, student visibility, and browser/device compatibility.

## Functionality Planning Notes

Document the highest-value future functionality areas discovered during this audit. Keep this brief and link to the dated audit file for details.

## Known Risks and Follow-Up Items

Briefly list important known issues or areas needing future improvement. Link to the audit file when appropriate.

## Instructions for Future Agents

Give clear rules for future coding agents:

- inspect existing patterns before changing code
- make small focused changes
- update tests/docs when behavior changes
- do not introduce new dependencies without justification
- do not expose secrets or audio data
- run validation commands before final response
- document future changes in `UPDATES.md`
```

AGENTS.md quality requirements:

- Keep it specific to this repository.
- Avoid generic filler.
- Prefer short, actionable guidance.
- Use bullets and tables where helpful.
- Make it useful for future coding agents who have never seen the repo.
- Do not over-document every file.
- Do not claim commands are verified unless you actually ran them successfully.
- If a command was attempted and failed, mark it as failed or blocked and reference the audit.
- If something is unknown, say unknown.

Phase 8: Create the dated audit file

First determine the current date in `YYYY-MM-DD` format.

Use that date to create a new audit file at the repository root named:

`AUDIT-[CURRENT-DATE].md`

For example, if the current date is 2026-06-09, the file must be named:

`AUDIT-2026-06-09.md`

Do not create a file literally named `AUDIT-YYYY-MM-DD.md`.
Do not create a file literally named `AUDIT-[CURRENT-DATE].md`.

If an audit file for the current date already exists, do not overwrite it without preserving useful existing content. Instead, update it carefully or append a new clearly dated section.

Use the discovered current date throughout the audit file, including the title and project metadata.

Required structure:

```md
# Audit Report - [CURRENT-DATE]

## Project

- Name: Classroom Voice Meter / Yap-O-Meter
- Production URL: https://yap.ahall.dev
- Repository:
- Audit date: [CURRENT-DATE]
- Auditor: Codex
- Scope:

## Executive Summary

Briefly summarize the overall health of the project, the biggest risks, the highest-value improvements, and the strongest functionality opportunities.

## What I Reviewed

List the files, directories, commands, and workflows reviewed.

## Verification Results

| Command        | Result                              | Notes       |
| -------------- | ----------------------------------- | ----------- |
| `command here` | Passed/Failed/Blocked/Not available | Brief notes |

## Architecture Overview

Describe the app architecture as discovered from the repository.

Include:

- framework
- routing approach
- state management
- audio processing model
- data persistence
- API/backend behavior if any
- build/deployment model
- major user flows

## Strengths

List what the project does well. Be specific.

## Findings

Group findings by severity.

Use this severity model:

### Critical

Security, privacy, data loss, or production-breaking issues that should be fixed immediately.

### High

Important issues that can cause serious bugs, privacy exposure, broken core flows, or hard-to-maintain code.

### Medium

Meaningful improvements to reliability, maintainability, accessibility, performance, or developer experience.

### Low

Nice-to-have improvements, polish, minor cleanup, or documentation gaps.

For each finding, use this format:

#### [SEVERITY-ID] Short finding title

- Severity:
- Category:
- Location:
- Evidence:
- Impact:
- Recommendation:
- Suggested priority:

Severity IDs should look like:

- `CRIT-001`
- `HIGH-001`
- `MED-001`
- `LOW-001`

Categories may include:

- Security
- Privacy
- Accessibility
- Performance
- Reliability
- Maintainability
- Testing
- Developer Experience
- Classroom UX
- Browser Compatibility
- Audio Processing
- Microphone Permissions
- Documentation

Use confirmed evidence from the repository. If a finding is speculative, label it clearly as a hypothesis and explain how to verify it.

## Voice Meter-Specific Audit Notes

Include these subsections:

### Microphone Permission Flow

Explain when and how microphone permission is requested, how denial is handled, and whether permission status is clear to the user.

### Audio Processing and Data Handling

Explain whether audio is processed locally or remotely. State whether raw audio is recorded, transmitted, stored, cached, logged, or persisted.

### Media Stream Cleanup

Explain how media tracks, AudioContext, analyser nodes, requestAnimationFrame loops, timers, and event listeners are cleaned up.

### Browser and Device Compatibility

Explain known or likely compatibility concerns for iOS Safari, Android browsers, Chrome, Edge, Chromebooks, school-managed devices, tablets, projectors, and smartboards.

### Animation and Rendering Performance

Explain how visual feedback is rendered and whether there are performance risks, memory leaks, unnecessary re-renders, or animation-loop issues.

### Classroom Display Usability

Explain whether the app is understandable from across the room, whether controls are safe to project, whether reduced motion is considered, and whether threshold/calibration behavior is clear.

## Functionality Opportunities

Suggest improved functionality the project may be missing.

Group suggestions by priority:

### Immediate Functionality Opportunities

Small or important improvements that reduce risk, clarify microphone behavior, or improve core teacher workflow.

### Next Functionality Opportunities

Useful features that should be planned after the immediate issues.

### Later Functionality Opportunities

Larger, more complex, or more optional enhancements.

For each suggestion, use this format:

#### [FUNC-ID] Suggestion title

- Priority:
- Complexity:
- Problem it solves:
- User value:
- Evidence or rationale:
- Privacy/security considerations:
- Implementation notes:
- Product/design decisions needed:

Functionality IDs should look like:

- `FUNC-001`
- `FUNC-002`
- `FUNC-003`

Do not recommend features that conflict with microphone privacy, classroom practicality, or long-running display performance.

## Dependency and Tooling Notes

Summarize package manager, dependencies, scripts, linting, formatting, tests, and build configuration.

If dependency vulnerability scanning was not run, say so. Do not invent vulnerability results.

## Accessibility Review

Summarize accessibility strengths, risks, and recommended improvements.

Pay special attention to:

- reduced motion
- readable display from a distance
- keyboard-accessible controls
- clear focus states
- color contrast
- screen reader labels
- non-visual indication of microphone state

## Performance Review

Summarize performance strengths, risks, and recommended improvements.

Pay special attention to:

- requestAnimationFrame usage
- animation cleanup
- audio analysis frequency
- unnecessary React re-renders
- battery use on tablets/laptops
- long-running classroom display sessions
- memory leaks

## Security and Privacy Review

Summarize security/privacy posture and recommended improvements.

Pay special attention to:

- microphone permission timing
- local vs remote audio processing
- raw audio transmission
- logging
- analytics
- audio persistence
- settings persistence
- teacher/student privacy

## Recommended Roadmap

Create a practical prioritized plan:

### Immediate

Fixes to do first.

### Next

Important improvements after immediate risks.

### Later

Nice-to-have or larger refactors.

## Suggested Future Tests

List tests that should be added or improved.

Include:

- unit tests for audio threshold calculations
- unit tests for settings/calibration logic
- permission-denied behavior tests
- media cleanup tests
- accessibility tests
- reduced-motion tests
- long-running session/manual performance tests
- cross-browser manual testing checklist
- projector/classroom display checklist

## Open Questions

List questions that could not be answered from the code alone.

## Final Notes

Briefly summarize what future agents should be careful about.
```

Audit quality requirements:

- Be direct and specific.
- Do not pad with generic advice.
- Do not exaggerate severity.
- Do not mark everything Critical or High.
- If the project is in good shape, say so.
- If the project has serious issues, say so clearly.
- Include practical recommendations that a solo developer can act on.
- Prefer “what to do next” over theoretical best practices.
- Use markdown tables where they improve readability.
- The audit should be detailed enough to guide future development, but not so long that nobody will read it.
- Functionality suggestions should be grounded in the actual project, classroom use, and codebase reality.

Phase 9: Create or update `UPDATES.md`

Create or update `UPDATES.md` at the repository root.

Purpose:

`UPDATES.md` is a chronological work log for coding-agent activity. It should document what changed, why it changed, and what was intentionally left unchanged.

If `UPDATES.md` already exists, append a new entry. Do not erase previous entries.

Use this structure:

```md
# Updates

## [CURRENT-DATE] - Repository audit and agent documentation

### Summary

Briefly describe the work completed.

### Files Created

List files created during this task.

### Files Updated

List files updated during this task.

### Commands Run

| Command        | Result                              | Notes       |
| -------------- | ----------------------------------- | ----------- |
| `command here` | Passed/Failed/Blocked/Not available | Brief notes |

### Changes Made

Document actual changes made. For this task, this should usually be documentation-only changes.

### Findings Documented But Not Fixed

Briefly list important issues found but intentionally not fixed.

### Functionality Ideas Documented

Briefly list major feature/functionality suggestions added to the audit.

### Follow-Up Needed

Briefly list recommended next actions.
```

UPDATES.md requirements:

- Be factual.
- Do not include secrets.
- Do not include huge command logs.
- Do not claim code was changed if only documentation changed.
- If you made any code changes, clearly explain why they were necessary.
- If this was documentation-only, state that clearly.

Phase 10: Final response

After creating the files, provide a concise final summary with:

1. Files created or updated.
2. Commands run and whether they passed.
3. Number of findings by severity.
4. Number of functionality suggestions documented.
5. Top 3 recommended next actions.
6. Any limitations of the audit.

Do not include the full contents of the generated files in the final response unless they are short. The files themselves are the deliverable.

Remember: your main deliverables are `AGENTS.md`, a dated audit file named `AUDIT-[CURRENT-DATE].md`, and `UPDATES.md`, where `[CURRENT-DATE]` is the actual current date discovered at runtime in `YYYY-MM-DD` format. The audit should be evidence-based, `AGENTS.md` should help future coding agents work safely and effectively in this repository, and `UPDATES.md` should document what changed during the task.
