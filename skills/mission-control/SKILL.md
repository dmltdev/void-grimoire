---
name: mission-control
description: Agentic development control plane for task intake, blast-radius analysis, planning, TDD, implementation dispatch, review, verification, correction, and commit/PR handoff. Use when the user invokes /mission-control, asks to run a task pipeline, coordinate agents, batch tasks, parallelize implementation lanes, or automate development work with human gates.
---

# Mission Control

Run an in-session development control plane. Hold quality, context, task boundaries, worker coordination, evidence, and handoff. Do not use herdr, CHAOS panes, omp/pi/codex panes, or babysitter panes. Do not edit production code yourself.

## Core contract

- Act as the control plane: intake, clarify, analyze risk/blast radius, plan, packetize, dispatch, supervise, review, verify, correct, sign off, and hand off to git.
- Never implement or patch production code directly. Use implementer/fix workers for code changes.
- Require a task packet for every worker dispatch. See `references/task-packets.md`.
- Use `.mission-control/run.md` for batch, high-risk, or long-running missions. Keep low-risk single-task missions session-only unless persistence is needed. See `references/run-state.md`.
- Use markdown-only run state. Overwrite per active mission. Do not archive routine logs by default.
- Keep durable memory separate from pipeline state. Propose human-approved decisions/corrections for memory promotion only at signoff.
- Modify docs/specs only when repo convention requires it or the user asks.
- Commit only after explicit user approval and green verification. Push/PR only through explicit handoff to the git skill.
- Workers never spawn subagents. They report `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`.

## Preflight

Before dispatch, inspect enough context to decide:

1. mode: `research`, `plan`, `build`, `review`, `verify`, or `batch`
2. available worker roles/tools
3. repo/user state convention
4. scope, paths, artifacts, acceptance, non-goals
5. risk level and blast radius
6. public API/contract/schema/security impact
7. parallel lane safety
8. TDD and verification strategy
9. human gates required

Emit one brief line:

```text
Mission: <mode> | risk: <low|high> | lanes: <graph> | state: <session-only|.mission-control/run.md>
```

Ask one load-bearing question at a time when scope, acceptance, or architectural authority is unclear. Do not ask for facts tools or repo context can answer. Infer local, reversible details and record assumptions in the packet.

## Task contract

Before code changes, normalize each task into a contract:

```text
Goal:
Non-goals:
Acceptance criteria:
Technical constraints:
Blast radius:
Risk areas:
Test plan:
Verification commands:
Rollback path:
Human gates:
```

High-risk contracts require user approval before implementation. Low-risk/local contracts may proceed with logged assumptions.

## Modes and phases

Use mode-specific templates. Skip only phases that do not apply to that mode.

- `research`: Preflight -> Research -> Synthesis -> Signoff
- `plan`: Preflight -> Research -> Architect Review -> Plan Review -> Signoff
- `build`: Preflight -> Contract -> TDD -> Implementation -> Review -> Verification -> Correction -> Git Handoff -> Signoff
- `batch`: Preflight -> Queue Triage -> Contract/Plan per task -> Run capped lanes -> Review/Verify -> Correction -> Git Handoff -> Daily Signoff
- `review`: Preflight -> Review/Concilium -> Synthesis -> Signoff
- `verify`: Preflight -> Verification -> Signoff

See `references/mode-templates.md` for phase outputs and dispatch patterns.

## Batch lane policy

Use batch mode when the user provides multiple tasks or asks for daily automation.

- Intake 3-6 tasks, preserve every task, and risk-sort before dispatch.
- Run at most 2 active build lanes.
- Planning, review, and verification may overlap with build lanes when they do not touch shared files, exported contracts, schemas, generated files, or manifests.
- Serialize tasks that share files/contracts, depend on another task's output, or may change each other's acceptance criteria.
- Stop only dependent work when a shared contract, architecture, schema, or dependency is blocked. Continue independent lanes.

## Worker strategy

Use built-in role contracts, then map to concrete available agents/tools:

- researcher: inspect code/docs/external refs; no edits
- architect: analyze standards, dependencies, influence, blast radius, alternatives, and design risks; no production edits
- planner: produce implementation plan or task graph; no production edits
- test author: write failing tests or executable test contract before implementation
- implementer: implement against accepted packet and test contract
- fix-worker: apply accepted blockers only
- reviewer: inspect diff/plan for specific lens
- concilium: four-lens advisory review for risky diffs
- verifier: independently run commands/probes and cite output
- git handoff: invoke commit/push/PR skill after explicit user approval

Prefer known concrete mappings when available:

- verifier -> `adversarial-verifier`
- concilium -> `convene-concilium` / four-lens reviewer fanout
- reviewer -> `reviewer` or code-review agent
- implementer/fix-worker -> `task` or implementation-capable agent
- researcher/planner/architect -> `code-explorer`, `plan`, `oracle`, or equivalent
- git handoff -> `commit-push-pr`

Use a separate architect worker for non-trivial or risky work: multi-file changes, public API/CLI behavior, core abstractions, schemas/migrations, auth/security, external APIs, concurrency, queues, caching, or unclear influence. Use an inline checklist for low-risk local fixes.

## TDD-first build flow

Default to TDD when the task area supports tests.

- Risky/new behavior: dispatch a dedicated test author first to create failing tests or a test contract.
- High-risk/new-behavior tests require user approval before implementation.
- Low-risk tests may proceed after the test author proves they fail for the right reason.
- Small local change: implementer may write tests first.
- Implementer makes tests pass without weakening them.
- Test changes after implementation require an explicit report reason: wrong spec, brittle assertion, or accepted behavior change.
- Removing or weakening assertions to get green is a blocker.
- Test failures are blockers by default. If a test conflicts with accepted spec or repo convention, require evidence and escalate or dispatch a test-fix worker.
- If user explicitly says no tests, obey and require the strongest alternative verification.

Test author and implementer coordinate through reports only. Ambiguity or spec change returns to mission-control.

## Risk and review

Treat a mission as high risk if it touches:

- auth, payments, permissions, secrets, migrations, file deletion, external APIs
- public API or CLI behavior
- more than one subsystem
- broad refactor
- user-visible UI/workflow behavior
- concurrency, queues, caching, retries
- security/input handling
- behavior with no focused test

Verification policy:

- Every worker self-verifies and reports commands/output.
- High-risk, multi-file, sensitive, or user-visible changes require an independent verifier.
- Verifier must run commands/probes. Reading code is not proof.
- Risky diffs also get concilium. Concilium advises; only CRITICAL blocks.

## Correction policy

Use one bounded correction round:

1. Verify/review worker result.
2. If blockers exist, dispatch one fresh fix-worker with accepted blocker list, scope, failing evidence, and verification command.
3. Re-verify once.
4. If still blocked, stop dependent work and report diagnosis + smallest next action.

Continue independent tasks when a blocker does not affect them. Stop dependent tasks when a blocker affects shared contracts, architecture, schema, or dependencies.

## Git handoff

After green verification and review:

1. Prepare a commit/PR package: goal, files changed, behavior, tests/evidence, risk, rollback, memory candidates.
2. Ask for explicit approval to commit.
3. If approved, invoke `commit-push-pr` for commit/push/PR flow.
4. Do not inline or duplicate git-safety or PR-body rules.

## Signoff

Return an operational report:

```text
Goal:
Tasks completed:
Workers dispatched:
Decisions/assumptions:
Verification evidence:
Review findings:
Memory candidates:
Git handoff:
Risks/residual blockers:
Remaining work:
```

If the user rejects output as wrong/slop, ask whether to record the pattern. Do not create slop files by default. If the repo has `/unslop` or correction workflow, route there.
