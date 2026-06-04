---
name: orchestrate-chaos
domain: void-grimoire
description: Use when the user invokes /orchestrate-chaos or asks to run a multi-pane parallel session that combines Codex-powered omp workers with herdr orchestration and adhd brainstorming. CHAOS = Codex + Herdr + Adhd + Omp + Skills. Routes brainstorm/research/analysis tasks to adhd and build/fix/refactor tasks to omp panes driven by the herdr-orchestrator agent.
depends-on: ["using-herdr"]
chains-to: null
suggests: ["using-codex", "using-omp", "using-adhd"]
---

# orchestrate-chaos

You are dispatching a CHAOS session: parallel omp workers in herdr panes, with adhd as a routed sub-tool for divergent thinking. You do not execute the work yourself.

## Preflight (must pass before dispatch)

Run these in parallel and record what is available:

```bash
test "$HERDR_ENV" = "1" && echo herdr:ok || echo herdr:MISSING
command -v herdr >/dev/null && herdr --help >/dev/null 2>&1 && echo herdr-cli:ok || echo herdr-cli:MISSING
command -v omp >/dev/null && echo omp:ok || echo omp:MISSING
command -v codex >/dev/null && echo codex:ok || echo codex:MISSING
command -v adhd >/dev/null && echo adhd:ok || echo adhd:MISSING
```

Fallback rules (ask the user to confirm before proceeding):

- `HERDR_ENV` unset or no `herdr` CLI: stop. CHAOS requires herdr. Ask the user to launch from inside a herdr workspace.
- `omp` missing: ask — fall back to raw `codex` CLI in each pane, fall back to `claude` instances, or abort?
- `codex` missing OR GPT-5.5 unreachable: ask — switch omp to a different configured provider (Anthropic/Gemini/local Ollama), or fall back to `claude` workers?
- `adhd` missing: tell the user to install with `npx skills add UditAkhourii/adhd` OR `bun install -g @oh-my-pi/pi-coding-agent` (then re-check), OR suggest using the locally available `brainstorming` / `adhd` / research-style skill in plain Claude workers. Do not silently substitute.

Invoke `using-codex`, `using-omp`, `using-adhd` as needed to confirm CLI surface and current model availability before dispatch.

## Routing rules (you classify, then dispatch)

Classify the user's goal into one of three buckets:

1. **Divergent** — brainstorm, ideate, "N ways to", architecture options, naming, hypothesis classes for a fuzzy bug. Route to a single `adhd` pane (or two, if comparing frames). Worker prompt is the raw question; let adhd's frame logic run.
2. **Convergent execution** — implement, fix, refactor, write tests, run migrations. Route to `omp` workers, one pane per independent task. Default model: GPT-5.5 unless preflight downgraded.
3. **Hybrid** — research-then-build. Run one adhd pane first; wait for its top-survivor output; pass the chosen direction as constraints into omp worker prompts. Serialize this; do not parallelize the build until adhd reports.

If the classification is genuinely ambiguous, ask one load-bearing question. Do not guess.

## Dispatch

Hand off to the `herdr-orchestrator` agent with a CHAOS-tagged prompt:

```
CHAOS dispatch.
Goal: <one sentence>
Routing: <Divergent | Convergent | Hybrid>
Workers:
  - pane 1: <adhd|omp|claude> — task: <prompt> — model: <if omp>
  - pane 2: ...
Preflight results: herdr=<ok|missing>, omp=<ok|missing>, codex=<ok|missing>, adhd=<ok|missing>
Fallbacks already approved by user: <list, or "none">
Report back: single summary when all workers done.
```

The orchestrator handles pane lifecycle, monitoring, and aggregation per its own agent spec. You do not micromanage it.

## Hard rules

- Never substitute a fallback without explicit user confirmation.
- Never spawn more than 4 concurrent workers unless the user asked for more.
- One pane = one tool = one task. Do not run adhd and omp in the same pane.
- After the orchestrator returns, present the user with the merged result and the per-pane deliverables. Close panes only after sign-off.
