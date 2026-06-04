---
name: using-agent-browser
domain: tools
description: Use when test-with-browser routes to agent-browser, or when the user explicitly asks to drive a browser via the agent-browser CLI. Surfaces install check, command surface, session model, and parallel-safety notes. agent-browser is preferred over Playwright MCP for one-shot verification — lower token cost and a cleaner API for accessibility-tree snapshots.
depends-on: []
chains-to: null
suggests: []
---

# using-agent-browser

[`agent-browser`](https://github.com/vercel-labs/agent-browser) is a CLI from Vercel Labs for agent-driven browser automation. It exposes the page through a lightweight accessibility tree with ref-based interaction. Compared to Playwright MCP it spends fewer tokens per action and has a cleaner surface for one-shot verification work, which is why it is the default in `test-with-browser`.

## Preflight

```bash
command -v agent-browser >/dev/null && agent-browser --help 2>&1 | head -40
```

If missing, tell the user to install it (see the repo) and stop. Do not silently fall back to a different tool — `test-with-browser` owns the cascade and will pick the next option.

The CLI surface evolves. **Always re-read `agent-browser --help` at session start** rather than relying on memory. Subcommands and flags below are a guide, not a guarantee.

## Command surface (verify with --help)

Typical subcommands:

- `agent-browser open <url>` — open a page in a managed browser session.
- `agent-browser snapshot [-i] [-c]` — return the accessibility tree (`-i` for interactive elements, `-c` for compact form). Each element carries a `ref` you reuse for actions.
- `agent-browser click <ref>` — click by ref.
- `agent-browser type <ref> <text>` — type into a ref.
- `agent-browser screenshot --out <path>` — capture a PNG.
- `agent-browser console` — dump browser console messages.
- `agent-browser network` — list network requests.
- `agent-browser close` — close the session.

If a subcommand differs in your installed version, trust `--help`, not this list.

## Session model

agent-browser supports **isolated sessions** — each invocation or session id gets its own browser context. That makes it safe to run in parallel from multiple subagents or herdr panes without state bleed. When running multiple checks side-by-side, pass an explicit session id per worker.

## Usage pattern in test-with-browser

```
agent-browser open https://staging.example.com/dashboard
agent-browser snapshot -i -c          # find the element by visible label
agent-browser click <ref-of-button>
agent-browser screenshot --out .claude/test-results/<task-slug>/step-2.png
agent-browser console                 # capture errors if anything looks off
agent-browser close
```

Prefer durable selectors via the snapshot's visible labels/roles. Avoid coordinate-only clicks.

## When NOT to use agent-browser

- You need a performance trace or heap snapshot → use `chrome-devtools-mcp`.
- The project already owns Playwright and the work is a durable e2e regression → write a Playwright spec following the project's convention.
- You are not verifying a UI — agent-browser is overkill for backend or CLI checks.

## Hard rules

- Never paste passwords, cookies, or full auth headers into commands echoed in the response.
- Redact PII in captured screenshots before embedding in evidence reports.
- One session per task unless the user explicitly asks for parallel sessions.
