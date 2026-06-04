---
name: using-omp
domain: tools
description: Use when launching or dispatching to the oh-my-pi (`omp`) coding agent — typically as a CHAOS worker inside a herdr pane, or standalone for interactive terminal coding. Covers install check, model/provider selection (40+ providers including Codex/GPT, Anthropic, Gemini, local Ollama), and fallbacks when omp or the chosen provider is unavailable.
depends-on: []
chains-to: null
suggests: ["using-codex"]
---

# using-omp

`omp` (oh-my-pi) is a terminal-first AI coding agent — fork of Pi by Mario Zechner. It ships ~32 built-in tools (`read`, `write`, `edit`, `bash`, `lsp`, `debug`, `web_search`, `browser`, `task`) and supports 40+ LLM providers behind one CLI.

## Preflight

```bash
command -v omp >/dev/null && omp --help 2>&1 | head -30
omp --version 2>/dev/null
```

If `omp` is missing, ask the user to confirm install or fallback. Install options:

```bash
# macOS / Linux
curl -fsSL https://omp.sh/install | sh
# or via Bun (recommended)
bun install -g @oh-my-pi/pi-coding-agent
# Windows
irm https://omp.sh/install.ps1 | iex
```

## Model selection

Common flags (verify against current `omp --help`):

- `--model <id>` — explicit model (e.g. `gpt-5.5`, `claude-opus-4-7`).
- `--smol` / `--slow` / `--plan` — preset profiles (small/fast, deeper, planning).
- In-session: `Ctrl+P` or `/model` to cycle providers mid-run.

Before dispatch in CHAOS, confirm the target provider responds:

```bash
omp --model gpt-5.5 --dry-run "ping" 2>&1 | head -5   # adapt to current CLI
```

## When to use omp (vs raw provider CLI)

- **omp**: multi-step interactive coding, when you want the integrated tool surface (lsp, debug, browser) without writing glue.
- **Raw `codex` / `claude`**: one-shot prompts, simple scripted runs, when you do not need omp's tool layer.
- **adhd**: brainstorming. Don't use omp for divergent thinking — wrong tool.

## Fallback chain (ask user before applying)

1. `omp` missing → install, or fall back to the raw provider CLI (`codex`, `claude`, `gemini`).
2. Provider unreachable inside omp → switch provider via `--model` or `/model`. Ask the user which.
3. All providers down → stop and report.

## Dispatch inside a herdr pane

The orchestrator typically runs:

```bash
herdr pane run "$NEW_PANE" "omp --model gpt-5.5"
herdr wait output "$NEW_PANE" --match "$|>" --timeout 15000
herdr pane run "$NEW_PANE" "<self-contained task prompt>"
```

Tell the omp worker to end with a recognizable marker (`DONE:` or `BLOCKED:`) so `wait output` is reliable.

## Notes

- omp's CLI surface evolves quickly. Re-read `omp --help` at session start; do not rely on memorized flags.
- Auth is per-provider, per-machine. A worker that fails to auth must be resolved interactively by the user.
