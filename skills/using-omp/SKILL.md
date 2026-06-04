---
name: using-omp
domain: tools
description: Use when launching or dispatching to the oh-my-pi (`omp`) coding agent — typically as a CHAOS worker inside a herdr pane, or standalone for interactive terminal coding. Covers install check, model/provider selection (40+ providers including Codex, Anthropic, Gemini, local Ollama), and fallbacks when omp or the chosen provider is unavailable. omp and `pi` (the upstream project omp forked from) are mutually exclusive harnesses — pick one per workspace.
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

Codex is the **recommended** provider, but never assumed. Always confirm the model with the user before dispatch — or let omp use whatever it has configured as default.

Common flags (verify against current `omp --help`):

- `--model <id>` — explicit model. Do not hardcode a model id; let the user pick or use omp's configured default.
- `--smol` / `--slow` / `--plan` — preset profiles (small/fast, deeper, planning).
- In-session: `Ctrl+P` or `/model` to cycle providers mid-run.

Before dispatch in CHAOS, surface omp's current default to the user and let them confirm or override.

## When to use omp (vs raw provider CLI)

- **omp**: multi-step interactive coding, when you want the integrated tool surface (lsp, debug, browser) without writing glue.
- **Raw `codex` / `claude`**: one-shot prompts, simple scripted runs, when you do not need omp's tool layer.
- **adhd**: brainstorming. Don't use omp for divergent thinking — wrong tool.

## Fallback chain (auto-pick by prefer-list, announce, do not prompt unless nothing works)

Within CHAOS the orchestrator probes the harness prefer-list: `omp` → `pi` → `claude` → `codex`. Outside CHAOS, when invoking omp directly:

1. `omp` missing → fall back to `pi` (the upstream project; same shape, mutually exclusive — never run both). Announce the switch.
2. Both `omp` and `pi` missing → fall back to a raw provider CLI (`claude`, `codex`, `gemini`). Announce.
3. Provider unreachable inside omp → switch provider via `--model` or `/model`. Surface the harness's current default; let the user override.
4. Nothing works → stop and ask the user.

## Dispatch inside a herdr pane

The orchestrator typically runs:

```bash
herdr pane run "$NEW_PANE" "omp"                       # or: omp --model <user-confirmed model>
herdr wait output "$NEW_PANE" --match "$|>" --timeout 15000
herdr pane run "$NEW_PANE" "<self-contained task prompt>"
```

Tell the omp worker to end with a recognizable marker (`DONE:` or `BLOCKED:`) so `wait output` is reliable.

## Notes

- omp's CLI surface evolves quickly. Re-read `omp --help` at session start; do not rely on memorized flags.
- Auth is per-provider, per-machine. A worker that fails to auth must be resolved interactively by the user.
