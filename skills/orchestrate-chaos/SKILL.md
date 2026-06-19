---
name: orchestrate-chaos
domain: void-grimoire
description: Use when the user invokes /orchestrate-chaos, asks for babysat CHAOS, or asks to run a multi-pane parallel session that combines omp (or pi) workers with herdr orchestration and adhd brainstorming. CHAOS = Codex + Herdr + Adhd + Omp + Skills. Routes brainstorm/research/analysis tasks to adhd and build/fix/refactor tasks to omp/pi/claude/codex panes driven by the herdr-orchestrator agent. Optional babysat mode spawns a babysitter-orchestrator pane with a .chaos/ state-file protocol. Codex is the recommended model provider but the user picks the actual model.
depends-on: ["using-herdr", "babysitter-orchestrator"]
chains-to: null
suggests: ["using-codex", "using-omp", "using-adhd"]
---

# orchestrate-chaos

You are dispatching a CHAOS session: parallel harness workers in herdr panes, with adhd as a routed sub-tool for divergent thinking. You do not execute the work yourself. If the user asks for "babysat CHAOS", "orchestrate-chaos-2", or a babysitter pane, run babysat mode from this skill instead of loading a separate skill.

## Preflight (must pass before dispatch)

Run these in parallel and record what is available:

```bash
test "$HERDR_ENV" = "1" && echo herdr:ok || echo herdr:MISSING
command -v herdr >/dev/null && herdr --help >/dev/null 2>&1 && echo herdr-cli:ok || echo herdr-cli:MISSING
command -v omp >/dev/null && echo omp:ok || echo omp:MISSING
command -v pi >/dev/null && echo pi:ok || echo pi:MISSING
command -v claude >/dev/null && echo claude:ok || echo claude:MISSING
command -v codex >/dev/null && echo codex:ok || echo codex:MISSING
command -v adhd >/dev/null && echo adhd:ok || echo adhd:MISSING
```

### Harness selection (deterministic, no prompt unless forced)

Pick the convergent-worker harness using this rule, in order:

1. **User-specified.** If the user's prompt names a harness (`omp`, `pi`, `claude`, `codex`), use it. No prompt.
2. **Session-memory.** If this conversation has already established a harness for CHAOS, reuse it. No prompt.
3. **Prefer-list probe**: try `omp` → `pi` → `claude` → `codex`. Take the first one installed.
4. **Tiebreaker** (only when step 3 returns multiple candidates and none is uniquely preferred): if the *current orchestrator harness* is detectable and appears in the candidates, pick it — the user is already authenticated and configured there.
5. **Announce, don't prompt.** Once chosen, state the choice in one line ("Harness: omp"). The user can override mid-flight.
6. **Nothing installed.** Ask the user which to install or whether to abort. This is the only branch that prompts.

`omp` and `pi` are mutually exclusive — never run both. If both are installed, prefer `omp` (newer fork, more tools).

### Other preflight rules

- `HERDR_ENV` unset or no `herdr` CLI: stop. CHAOS requires herdr. Ask the user to launch from inside a herdr workspace.
- Model provider: Codex is the **recommended** provider, but never assumed and never hardcoded. If `codex` is reachable, surface it as the default suggestion; otherwise use whatever the chosen harness has configured as default. Always announce the model in the dispatch summary so the user can override.
- `adhd` missing: tell the user to install with `npx skills add UditAkhourii/adhd` OR `npm install -g adhd-agent` (then re-check), OR suggest using the locally available `brainstorming` / `adhd` / research-style skill in plain Claude workers. Do not silently substitute.

Invoke `using-codex`, `using-omp`, `using-adhd` as needed to confirm CLI surface before dispatch.

## Optional babysat mode

Use babysat mode when the user asks for babysat CHAOS, invokes the retired `/orchestrate-chaos-2` concept, asks for a babysitter pane, or the run is long-lived/high-risk enough that context drift is likely.

### Phase model

Five phases. The master emits state at every transition and reads interventions before exiting every transition. No worker-level granularity in the state file.

1. **Preflight** — harness + tool detection, classification.
2. **Dispatch** — handoff to `herdr-orchestrator` with worker prompts.
3. **Workers running** — panes executing; `herdr-orchestrator` monitors.
4. **Aggregation** — `herdr-orchestrator` returns; master merges.
5. **Sign-off** — user reviews; panes close.

### Babysitter spawn

After preflight passes and before dispatch, create `.chaos/` at repo root:

```bash
mkdir -p .chaos
: > .chaos/state.md
: > .chaos/interventions.md
```

Spawn prompt for the babysitter pane:

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

### Babysat dispatch addition

Add this block to the `herdr-orchestrator` handoff:

```
Babysitter contract: .chaos/state.md (overwrite), .chaos/interventions.md (append).
On entering each of your phases (your dispatch, your worker-monitoring, your aggregation), emit your state into .chaos/state.md and read .chaos/interventions.md before exiting.
```

### State-file contract

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

## Routing rules (you classify, then dispatch)

Classify the user's goal into one of three buckets:

1. **Divergent** — brainstorm, ideate, "N ways to", architecture options, naming, hypothesis classes for a fuzzy bug. Route to a single `adhd` pane (or two, if comparing frames). Worker prompt is the raw question; let adhd's frame logic run.
2. **Convergent execution** — implement, fix, refactor, write tests, run migrations. Route to the harness picked by preflight (`omp` / `pi` / `claude` / `codex`), one pane per independent task. Model is whatever was confirmed or harness-default — never hardcoded.
3. **Hybrid** — research-then-build. Run one adhd pane first; wait for its top-survivor output; pass the chosen direction as constraints into worker prompts. Serialize this; do not parallelize the build until adhd reports.

If the classification is genuinely ambiguous, ask one load-bearing question. Do not guess.

## Dispatch

Hand off to the `herdr-orchestrator` agent with a CHAOS-tagged prompt:

```
CHAOS dispatch.
Goal: <one sentence>
Routing: <Divergent | Convergent | Hybrid>
Harness: <omp | pi | claude | codex> (source: <user-named | session-memory | prefer-list | tiebreaker>)
Workers:
  - pane 1: <adhd|harness> — task: <prompt> — model: <user-confirmed, or "harness default">
  - pane 2: ...
Preflight results: herdr=<ok|missing>, omp=<ok|missing>, pi=<ok|missing>, claude=<ok|missing>, codex=<ok|missing>, adhd=<ok|missing>
Report back: single summary when all workers done.
```

The orchestrator handles pane lifecycle, monitoring, and aggregation per its own agent spec. You do not micromanage it.

## Hard rules

- Announce harness and model choice. Never *silently* substitute a fallback the user did not request, but you may auto-pick from the prefer-list without prompting — the announcement is the audit trail.
- Never spawn more than 4 concurrent workers unless the user asked for more; a babysitter pane does not count as a worker.
- One pane = one tool = one task. Do not run adhd and omp/pi in the same pane.
- Never run omp and pi in the same workspace concurrently — they are mutually exclusive harnesses (omp is a pi fork).
- In babysat mode, the babysitter pane must be spawned before dispatch. If herdr cannot spawn it, abort CHAOS and tell the user.
- In babysat mode, write `.chaos/state.md` and read `.chaos/interventions.md` at every phase transition. Skipping is a hard error.
- After the orchestrator returns, present the user with the merged result and the per-pane deliverables. Close panes only after sign-off.
