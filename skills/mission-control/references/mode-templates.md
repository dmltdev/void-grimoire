# Mode templates

Use the smallest template that satisfies the mission. Keep phases explicit in the control plane; do not force irrelevant phases.

## research

1. Preflight: define question, sources, scope, output format.
2. Research: dispatch researcher workers by independent angle.
3. Synthesis: merge evidence, confidence, gaps, and recommendation.
4. Signoff: cite sources/files and unresolved unknowns.

## plan

1. Preflight: define goal, constraints, source of truth, and risk.
2. Research: inspect relevant code/docs; use external docs only when needed.
3. Architect Review: for non-trivial/risky work, analyze standards, influence, blast radius, alternatives, and design risks.
4. Plan Review: dispatch reviewer/planner critique for feasibility, hidden scope, TDD plan, and verification.
5. Signoff: deliver task graph, packets-ready scope, assumptions, risk register, and open questions.

## build

1. Preflight: define behavior, scope, state convention, risk, worker graph, verification, and human gates.
2. Contract: write the task contract: goal, non-goals, acceptance, constraints, blast radius, risk areas, test plan, verification, rollback.
3. TDD: write failing tests first when feasible; otherwise write explicit verification contract.
4. Implementation: dispatch implementers with packets and test contract.
5. Review: risky/broad diffs get concilium; low-risk or narrow diffs may get focused reviewers.
6. Verification: independent verifier runs commands/probes for risky/user-visible/multi-file changes.
7. Correction: one fresh fix-worker round for blockers, then one re-verify.
8. Git Handoff: prepare commit/PR package and ask for explicit commit approval.
9. Signoff: operational report.

## batch

1. Preflight: intake all tasks, preserve intent, identify source-of-truth docs, and use `.mission-control/run.md` for state.
2. Queue Triage: risk-sort tasks, detect dependencies, define at most 2 active build lanes.
3. Contract/Plan: create a task contract per queued task; high-risk contracts require user approval before implementation.
4. Run Lanes: dispatch TDD and implementation by lane; serialize shared contracts/files/schemas/manifests.
5. Review/Verify: independently verify high-risk, multi-file, sensitive, or user-visible changes.
6. Correction: one fresh fix-worker round per blocked lane, then one re-verify.
7. Git Handoff: after green verification, ask for commit approval and delegate to `commit-push-pr`.
8. Daily Signoff: shipped, blocked, active decisions, memory candidates, next queue.

## review

1. Preflight: resolve scope: staged diff, worktree, path, plan, PR, or artifact.
2. Review/Concilium: choose focused reviewer or concilium based on risk/breadth.
3. Synthesis: dedupe findings by location + issue class; only CRITICAL blocks.
4. Signoff: verdict, blockers, advisory findings, next action.

## verify

1. Preflight: define claims to falsify and evidence required.
2. Verification: dispatch independent verifier to run commands/probes.
3. Signoff: PASS/BLOCKED, command output, probes, smallest failing case.

## Risk routing

Low-risk/local:
- inline task contract
- one implementer or reviewer
- focused self-verification
- independent verifier optional
- session-only state unless user asks otherwise

Non-trivial/risky:
- architect/blast-radius worker first
- high-risk plan approval before implementation
- test author first when build mode
- user approval for high-risk/new-behavior tests
- implementer
- independent verifier required
- concilium for broad/risky diffs
- one fresh fix-worker if blocked
- `.mission-control/run.md` state for long-running or batch missions

## Parallel routing

Parallel-safe only when every build lane owns disjoint scope:

```text
Lane A: files/contracts X
Lane B: files/contracts Y
Shared dependency: none
Verification: after both complete
```

Serialize when:

```text
Lane B depends on Lane A output
Both touch same file/contract/schema/manifest/generated file
A failing result changes B acceptance
A public contract/API/architecture decision is unresolved
```
