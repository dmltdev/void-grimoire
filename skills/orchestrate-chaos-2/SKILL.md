---
name: orchestrate-chaos-2
domain: void-grimoire
description: Use when the user invokes /orchestrate-chaos-2 or asks to run a babysat CHAOS session — a multi-pane herdr session where the master dispatches workers via herdr-orchestrator AND spawns a babysitter pane that watches the control plane for phase drift, context decay, and slop. Variant of orchestrate-chaos with an enforced babysitter contract over a shared .chaos/ state-file protocol. Routes brainstorm/research/analysis to adhd and build/fix/refactor to omp/pi/claude/codex panes. Codex is the recommended provider; user picks the actual model.
depends-on: ["using-herdr", "babysitter-orchestrator"]
chains-to: null
suggests: ["using-codex", "using-omp", "using-adhd"]
---

# orchestrate-chaos-2

Babysat CHAOS. You dispatch workers via `herdr-orchestrator` AND spawn a `babysitter-orchestrator` pane that watches the control plane. The babysitter does not own the plan — it forces evidence at phase boundaries and writes interventions you are contracted to read. You do not execute worker tasks yourself.

## Preflight (must pass before dispatch)

Run the same checks as `orchestrate-chaos`:

```bash
test "$HERDR_ENV" = "1" && echo herdr:ok || echo herdr:MISSING
command -v herdr >/dev/null && echo herdr-cli:ok || echo herdr-cli:MISSING
command -v omp >/dev/null && echo omp:ok || echo omp:MISSING
command -v pi >/dev/null && echo pi:ok || echo pi:MISSING
command -v claude >/dev/null && echo claude:ok || echo claude:MISSING
command -v codex >/dev/null && echo codex:ok || echo codex:MISSING
command -v adhd >/dev/null && echo adhd:ok || echo adhd:MISSING
```

Harness selection, model-provider rules, and the `omp`/`pi` mutual-exclusion rule are identical to `orchestrate-chaos`. See that skill for the full prefer-list and tiebreaker logic. `HERDR_ENV` unset or no `herdr` CLI: stop.

## Phase model

Five phases. The master emits state at every transition, reads interventions before exiting every transition. No worker-level granularity in the state file.

1. **Preflight** — harness + tool detection, classification.
2. **Dispatch** — handoff to `herdr-orchestrator` with worker prompts.
3. **Workers running** — panes executing; herdr-orchestrator monitors.
4. **Aggregation** — herdr-orchestrator returns; master merges.
5. **Sign-off** — user reviews; panes close.

## Babysitter spawn (preflight + 1)

After preflight passes, before dispatch, create `.chaos/` at repo root and spawn the babysitter pane via herdr:

```bash
mkdir -p .chaos
: > .chaos/state.md
: > .chaos/interventions.md
```

Spawn prompt for the babysitter pane (claude or codex; same harness family as master is fine):

```
You are the babysitter-orchestrator for this herdr workspace.
Invoke the babysitter-orchestrator skill before operating.

Goal: <one sentence>
Classification: <Divergent | Convergent | Hybrid>
Harness: <omp | pi | claude | codex>
Master pane: <herdr pane id of the master>

Contract:
- Read .chaos/state.md (overwrite-latest snapshot) every 270s via ScheduleWakeup, plus on file mtime change.
- Watch master + herdr-orchestrator subagent transcripts through state.md only. Do not poll raw pane logs.
- Tiered intervention:
  * Routine observations -> your own pane (passive dashboard).
  * VERIFY dispatches -> append to .chaos/interventions.md. Master is contracted to read before exiting any phase.
  * RELAUNCH -> append to .chaos/interventions.md tagged [REQUIRES HUMAN APPROVAL]. Master surfaces to user.
- If state.md is stale (>2 phases behind) or fields missing, SendMessage-probe the master pane once. Do not spam.
- Never edit code. Never make product decisions. Never invent evidence.
```

Announce: `Babysitter: spawned in pane <id>. State: .chaos/state.md. Interventions: .chaos/interventions.md.`

## Routing rules

Identical to `orchestrate-chaos`: classify as **Divergent** (adhd), **Convergent** (harness workers), or **Hybrid** (adhd first, then workers). Ambiguous => one load-bearing question.

## Dispatch

Hand off to `herdr-orchestrator` with a CHAOS-tagged prompt (same shape as `orchestrate-chaos`) PLUS:

```
Babysitter contract: .chaos/state.md (overwrite), .chaos/interventions.md (append).
On entering each of your phases (your dispatch, your worker-monitoring, your aggregation), emit your state into .chaos/state.md and read .chaos/interventions.md before exiting.
```

The orchestrator handles pane lifecycle and aggregation per its own spec.

## State-file contract

`.chaos/state.md` — **overwrite-latest snapshot**. Master replaces the whole file at every phase transition:

```markdown
Phase: <1-Preflight | 2-Dispatch | 3-Workers | 4-Aggregation | 5-Signoff>
Goal: <one sentence>
Exit criteria: <one line>
Decisions: <bullet list>
Open contracts: <APIs, paths, schemas workers depend on>
Evidence: <commands, artifacts observed since last state>
Risks: <slop vectors>
Last update: <ISO timestamp>
```

`.chaos/interventions.md` — **append-only audit trail**. Babysitter appends; master never edits. Read before exiting any phase.

Entry shape:

```markdown
---
ts: <ISO timestamp>
level: <VERIFY | RELAUNCH | NOTE>
phase: <phase name>
slop-vector: <name or none>
body: |
  <verifier prompt, relaunch prompt, or note per babysitter-orchestrator output templates>
```

RELAUNCH entries carry `[REQUIRES HUMAN APPROVAL]` in the body's first line. Master surfaces them to the user before acting.

## Hard rules

- Babysitter pane must be spawned before dispatch. If herdr cannot spawn it, abort CHAOS and tell the user.
- Master writes `.chaos/state.md` (overwrite) and reads `.chaos/interventions.md` (tail) at every phase transition. Skipping is a hard error.
- Never spawn more than 4 concurrent workers (babysitter pane does not count) unless the user asked for more.
- One pane = one tool = one task. Do not run adhd and omp/pi in the same pane.
- Never run `omp` and `pi` concurrently in the same workspace.
- On sign-off: close worker + babysitter panes; leave `.chaos/` on disk for audit. `rm -rf .chaos/` is the user's call.
- Babysitter never edits code, never makes product decisions, never invents evidence.
