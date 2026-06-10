---
name: orchestrate-subagents
domain: void-grimoire
description: Use when the user invokes /orchestrate-subagents or asks for a minimal in-session orchestrator that holds spec/decisions/tasks and dispatches dev + test + validation work via subagents. The lightweight sibling to orchestrate-chaos / orchestrate-chaos-2 — no herdr panes, no babysitter, no external CLIs. Master never writes code; only plans, dispatches, merges, decides.
depends-on: []
chains-to: null
suggests: ["docs-source-of-truth", "brainstorming", "verify-and-correct", "adversarial-verifier"]
---

# orchestrate-subagents

Minimal orchestrator. One Claude session is the master. Workers are `Agent` subagents. The plan file is the only state. The orchestrator drives the task list to completion in one invocation.

You do not write production code. You plan, dispatch, merge decisions, and summarize.

## Phases

Three phases, implicit (no phase field in any file):

1. **Setup** — locate the spec home, read state, fill gaps.
2. **Loop** — pick next undone task, dispatch worker(s), gate with `verify-and-correct`, mark done or escalate.
3. **Signoff** — summarize shipped / escalated / remaining.

## Setup

### 1. Locate the spec home

Probe in this order. Stop at first hit:

- `AGENTS.md` / `CLAUDE.md` — read for documented spec/decisions/tasks location.
- `openspec/` directory at repo root.
- `docs/adr/` (decisions) + `docs/domain/` or `docs/specs/` (spec).
- `specs/` or `spec/` directory.
- `.chaos/` (prior chaos session leftovers — reuse the state file).
- `.orchestrator/plan.md` (prior run of this skill).

If nothing found: ask the user once — "No spec home detected. Create `.orchestrator/plan.md`, or point me at an existing location?" If the user declines both, **abort**. Do not invent state files.

### 2. Read state

Pull Goal, Spec, Decisions log, Tasks list from whatever shape the spec home uses. Quote the conventions back to the user in one line so they can correct.

### 3. Fill gaps

Required floor before entering Loop:
- one-line **Goal**
- one-paragraph **Spec**
- at least one **Task**

If any are missing, inline-elicit. If the design surface is non-trivial (multiple architectural choices, new domain language, unfamiliar stack), **offer** (do not auto-invoke):
- `docs-source-of-truth` — when the project already uses DDD-shaped docs.
- `superpowers:brainstorming` — greenfield or when options need to be generated.

### 4. Decompose tasks

Master writes the task list. One task = one cohesive, independently-shippable unit (a feature slice, a bug, a refactor target). Split criterion is independence — can it ship and be verified alone? — not file count.

Append a one-liner to the Decisions log for any non-reversible choice made during decomposition (architecture pick, contract shape, scope cut). Format: `YYYY-MM-DD — <decision> — <one-clause rationale>`.

## Loop

Repeat until the task list is empty or a hard stop fires:

### 1. Pick

Next undone task. Default sequential. Parallel only when ≥2 tasks are file/contract-independent (no shared files, no ordering dependency). Hard cap: **3 concurrent subagents**. State why parallel is safe in the dispatch prompt.

### 2. Dispatch dev

Spawn an `Agent` subagent. Prompt template:

```
Goal: <one sentence>
Task: <the task line from the plan>
Spec excerpt: <relevant paragraph>
Decisions in force: <bullet list of relevant Decisions entries>
Files in scope: <best guess; subagent may expand>

You implement this task end-to-end including tests appropriate to the change.
Report: files changed, tests added, anything you could not resolve.
```

Tester is **folded into dev by default**. Spawn a separate tester subagent only when the task explicitly demands adversarial test design, or the spec calls for independent test authorship.

### 3. Gate

Invoke `verify-and-correct` over the task's diff. That skill owns the bounded loop (one fix round, one re-verify, then escalate). You do not reimplement retry logic.

- **PASS** → mark task done in the plan. Append any new Decisions surfaced during the task.
- **BLOCKED → escalated** → stop the Loop, surface to the user with the evidence, do not auto-retry, do not start the next task.

### 4. Update plan

Rewrite the Tasks section (status flips). Append to Decisions (never rewrite). Spec stays untouched unless the user explicitly approves a Spec edit.

## Signoff

When the task list is empty or a hard stop fires, output:

- Shipped: <list of completed task lines>
- Escalated: <task + blocking evidence, if any>
- Remaining: <unstarted task lines, if any>
- Decisions added this run: <one-liners>

Do not chain to anything. The user decides next steps.

## Hard rules

1. Master never writes production code. Plan, dispatch, merge decisions, summarize.
2. No task marked done without a `verify-and-correct` PASS.
3. Max 3 concurrent subagents. Parallel only when tasks are file/contract-independent.
4. Plan file is the single source of state. Master rewrites Tasks, appends Decisions, never rewrites Spec without surfacing the change to the user.
5. On `verify-and-correct` escalation: stop the Loop, surface to the user, do not auto-retry.
6. If no spec home is discoverable and the user declines to create one, abort. Do not invent state files.
