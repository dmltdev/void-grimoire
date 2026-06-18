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
3. Plan Review: dispatch reviewer/planner critique for feasibility, hidden scope, and verification.
4. Signoff: deliver task graph, packets-ready scope, assumptions, and open questions.

## build

1. Preflight: define behavior, scope, state convention, risk, worker graph, verification.
2. Test Contract: write failing tests first when feasible; otherwise write explicit verification contract.
3. Implementation: dispatch implementers with packets and test contract.
4. Review: risky diffs get focused reviewers or concilium.
5. Verification: independent verifier runs commands/probes for risky/user-visible/multi-file changes.
6. Correction: one fresh fix-worker round for blockers, then one re-verify.
7. Signoff: operational report.

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
- one implementer or reviewer
- focused self-verification
- independent verifier optional

High-risk:
- test author first when build mode
- implementer
- independent verifier required
- concilium for broad/risky diffs
- one fresh fix-worker if blocked

## Parallel routing

Parallel-safe only when every worker owns disjoint scope:

```text
Worker A: files/contracts X
Worker B: files/contracts Y
Shared dependency: none
Verification: after both complete
```

Serialize when:

```text
Worker B depends on Worker A output
Both touch same file/contract/schema
A failing result changes B acceptance
```
