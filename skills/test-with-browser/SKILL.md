---
name: test-with-browser
domain: qa
description: Use when a code change touches a web UI and needs visual evidence it works against acceptance criteria — bugfix, feature, refactor, copy change. Use when the user asks to "verify in the browser", "screenshot the change", "prove it works", or attaches a UI ticket/PR. Use before claiming a UI task is done. Do not use for backend-only changes, CLI/TUI verification (use /verify), or writing durable e2e regression tests in a project that already owns its e2e suite.
depends-on: []
chains-to: null
suggests: [using-agent-browser, using-chrome-devtools-mcp, lookup-docs]
---

# test-with-browser

Drive a real browser to produce **visual evidence** that a change satisfies its acceptance criteria. The skill owns browser-based verification across the plugin; CLI/TUI/backend verification belongs to `/verify`.

## Core workflow

1. **Establish acceptance criteria.** Required before anything else. Precedence:
   1. User-stated AC in the prompt.
   2. AC from the linked ticket (the project's ticketing system — GitHub Issues, Linear, Jira, Notion, whatever the user uses). Ask the user to paste the ticket body or run their own ticket CLI.
   3. AC derived from the diff. Propose them in plain language and **confirm with the user before testing**. Never invent silently.
   4. No AC, no test. Exit with "what should pass?".
2. **Pick a tool via the cascade** (see below).
3. **Authenticate if needed.** The skill takes no position on auth — the user is responsible for providing access (cookies, local backdoor, test creds, dev-only auth bypass, whatever they use). If the target needs auth and the user has not provided a path, stop and ask.
4. **Drive the browser against the AC.** Prefer durable selectors: visible labels, ARIA roles, accessible names, stable test ids, route changes. Coordinate clicks last resort.
5. **Verify post-action state that matters to the AC** — the row appears, the button toggles, the status changes, the route opens, the error reproduces. Visible UI state is the primary signal; console errors, network requests, and URL changes are supporting evidence.
6. **Capture evidence.** Save under `.claude/test-results/<task-slug>/`. For ≥2 meaningful steps or when the user asks for a report, write `index.html` with embedded screenshots. For a one-step check, a single `screenshot.png` plus a final summary is enough. Add `.claude/test-results/` to `.gitignore` on first use if missing.
7. **Report.** Tested URL, environment, role used (no secrets), steps performed, observed outcome per AC bullet, evidence paths, remaining risks.

## Tool cascade (deterministic)

Probe in order. Announce the picked tool; never silently degrade.

1. **agent-browser** — if `command -v agent-browser` succeeds. Default. Fast, accessibility-tree based, parallel-safe, low token cost. See `using-agent-browser`.
2. **chrome-devtools-mcp** — if the `mcp__plugin_chrome-devtools-mcp_chrome-devtools__*` tool family is loaded in this session. Reach for it when you need DevTools-grade diagnostics: performance traces, heap snapshots, deeper network/console inspection. See `using-chrome-devtools-mcp`.
3. **Project Playwright** — *only if* the project already owns Playwright: `package.json` lists `@playwright/test`, OR `playwright.config.{ts,js,mjs}` exists, OR an `e2e/` / `tests/e2e/` dir exists. In that case, **add or extend a spec matching the project's existing convention and run it**. Never scaffold Playwright into a project that doesn't have it. Playwright MCP is unfavored — do not reach for it.
4. **None available** — stop. Report what's missing. Suggest the user install agent-browser (https://github.com/vercel-labs/agent-browser). Do not fall back to ad-hoc curl/headless tricks.

## Hard rules

- **AC first, browser second.** No AC → no test. No silent invention of AC.
- **Production is read-only** unless the user explicitly authorizes a state-changing action per action.
- **Never echo secrets** — no passwords, full tokens, cookies, auth headers in responses or reports.
- **Redact obvious PII** in screenshots of logged-in views. Crop, blur, or summarize.
- **One tool per session.** Picked from the cascade, announced to the user. Do not mix.
- **Don't fake evidence.** If a step fails, capture the failure screenshot and report fail. Do not retry blindly until it looks green.

## Diagnosing a failed verification

When the UI doesn't match AC:

- Capture the page screenshot at the failure point.
- Pull browser console errors.
- Inspect failed/suspicious network requests.
- Correlate with application logs if the failure points backend-ward.
- Report fail with evidence; do not attempt a fix from inside this skill.

## Evidence report contract

`.claude/test-results/<task-slug>/index.html` contains:

- Target URL and environment label (local / staging / prod).
- Role used (label only, never credentials).
- Step-by-step actions and observations, mapped 1:1 to AC bullets.
- Screenshots embedded by relative filename.
- Pass/fail per AC bullet plus overall verdict.
- Remaining risks or out-of-scope observations.
