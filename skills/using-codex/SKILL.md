---
name: using-codex
domain: tools
description: Use when about to invoke the OpenAI Codex CLI (`codex`) directly, when wrapping codex inside omp or another harness, or when verifying that a ChatGPT-subscription-backed Codex model is reachable before dispatching CHAOS workers. Covers preflight checks, model selection, and fallbacks when Codex is unavailable.
depends-on: []
chains-to: null
suggests: []
---

# using-codex

Codex CLI is OpenAI's official terminal coding agent, billed via a ChatGPT subscription (or API key). In CHAOS it is usually the model layer underneath `omp`, but it can also be invoked standalone.

## Preflight

```bash
command -v codex >/dev/null && codex --help 2>&1 | head -20
codex --version 2>/dev/null
```

If `codex` is missing, ask the user to confirm one of:

1. Install via the official path (`npm i -g @openai/codex` or the platform installer) and re-run.
2. Fall back to a different model provider inside `omp` (Anthropic, Gemini, xAI, local Ollama). See `using-omp`.
3. Fall back to a plain `claude` worker.

Do not silently substitute. The user picks.

## Model availability

Confirm the target model (e.g. GPT-5.5) is reachable before dispatch:

```bash
codex --model gpt-5.5 --dry-run "ping" 2>&1 | head -5   # or equivalent per current CLI
```

If the model is gated, rate-limited, or returns an auth error, surface the exact error and ask the user how to proceed. Do not retry blindly.

## When to use codex directly (vs through omp)

- **Direct codex**: one-shot prompts, scripted runs, CI hooks, or when you want OpenAI's native tool surface without omp's wrapper.
- **codex via omp**: interactive multi-step coding work, when you want omp's 32-tool surface (lsp, debug, browser, web_search, task) layered on top.
- **Neither**: pure brainstorming. Use `adhd`. Codex is overkill for divergent thinking.

## Fallback chain (ask user before applying)

1. Codex missing → omp with a different provider.
2. omp also missing → raw provider CLI (e.g. `claude`, `gemini`).
3. All providers missing → stop and report.

## Notes

- Codex CLI surface changes often. Always re-read `codex --help` at session start rather than relying on memory.
- Authentication is per-machine. If a worker pane fails to auth, the user must log in interactively — orchestrator cannot solve this for them.
