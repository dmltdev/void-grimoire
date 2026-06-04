---
name: using-codex
domain: tools
description: Use when about to invoke the OpenAI Codex CLI (`codex`) directly, when wrapping codex inside omp/pi or another harness, or when verifying that a ChatGPT-subscription-backed Codex model is reachable before dispatching CHAOS workers. Codex is the recommended CHAOS model provider but the actual model is always user-picked, never assumed. Covers preflight, model selection, fallbacks.
depends-on: []
chains-to: null
suggests: []
---

# using-codex

Codex CLI is OpenAI's official terminal coding agent, billed via a ChatGPT subscription (or API key). In CHAOS it is the **recommended** model layer underneath `omp` (or `pi`), but never the assumed one — the user picks the model. It can also be invoked standalone.

## Preflight

```bash
command -v codex >/dev/null && codex --help 2>&1 | head -20
codex --version 2>/dev/null
```

If `codex` is missing, ask the user to confirm one of:

1. Install via the official path (`npm i -g @openai/codex` or the platform installer) and re-run.
2. Fall back to whatever provider omp/pi has configured as default (Anthropic, Gemini, xAI, local Ollama). Surface that default; let the user confirm. See `using-omp`.
3. Fall back to a plain `claude` worker.

Do not silently substitute. The user picks.

## Model availability

Never hardcode a model. Ask the user which Codex model to use, or use whatever Codex has configured as default. If the model the user picks is gated, rate-limited, or returns an auth error, surface the exact error and ask the user how to proceed. Do not retry blindly. Do not silently substitute a different model.

## When to use codex directly (vs through omp/pi)

- **Direct codex**: one-shot prompts, scripted runs, CI hooks, or when you want OpenAI's native tool surface without an omp/pi wrapper.
- **codex via omp or pi**: interactive multi-step coding work, when you want the harness's tool surface (lsp, debug, browser, web_search, task) layered on top.
- **Neither**: pure brainstorming. Use `adhd`. Codex is overkill for divergent thinking.

## Fallback chain (ask user before applying)

1. Codex missing → omp/pi with whatever provider it has configured as default; surface that default to the user and let them confirm.
2. omp/pi also missing → raw provider CLI (e.g. `claude`, `gemini`).
3. All providers missing → stop and report.

## Notes

- Codex CLI surface changes often. Always re-read `codex --help` at session start rather than relying on memory.
- Authentication is per-machine. If a worker pane fails to auth, the user must log in interactively — orchestrator cannot solve this for them.
