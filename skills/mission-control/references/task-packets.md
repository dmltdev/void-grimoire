# Task packets

Every worker receives a self-contained packet. The worker must not rely on parent chat history.

## Packet template

```text
Objective:
Scope/paths:
Allowed edits:
Forbidden edits/non-goals:
Inputs/dependencies:
Relevant context/artifacts:
Assumptions:
Risks:
Acceptance criteria:
Verification commands:
Expected output:
Escalation conditions:
```

## Test contract packet

Use before implementation when TDD fits.

```text
Objective:
Create failing tests or a test contract for <behavior>.

Scope/paths:
<test files and source files to inspect>

Allowed edits:
Test files only, unless explicitly asked to create fixtures/helpers.

Forbidden edits/non-goals:
Do not change production implementation.
Do not weaken existing assertions.

Acceptance criteria:
Tests fail for the missing/buggy behavior and pass only when the requirement is satisfied.
Existing behavior remains covered.

Verification commands:
<focused test command expected to fail for the right reason>

Expected output:
DONE with tests changed, failing command output, and requirement protected by each assertion.
BLOCKED if accepted behavior is ambiguous.
```

## Implementation packet

```text
Objective:
Implement <behavior> against the test contract.

Scope/paths:
<owned files only>

Allowed edits:
Production files in scope and tests only when explicitly justified.

Forbidden edits/non-goals:
Do not remove or weaken assertions to get green.
Do not change public behavior outside acceptance criteria.
Do not spawn subagents.

Inputs/dependencies:
<Test contract/report path or summary>

Acceptance criteria:
Focused tests pass.
Behavior matches packet.
No unrelated diff.

Verification commands:
<focused test/typecheck/lint command>

Expected output:
DONE with files changed, tests run, command output, and residual risks.
DONE_WITH_CONCERNS for completed work with doubts.
NEEDS_CONTEXT for missing info.
BLOCKED for unresolved failure with smallest failing case.
```

## Fix-worker packet

```text
Objective:
Fix accepted blockers from verification/review.

Scope/paths:
<minimal files needed>

Allowed edits:
Only changes needed for listed blockers.

Forbidden edits/non-goals:
Do not address optional WARN/FYI items unless explicitly accepted.
Do not broaden scope.
Do not weaken tests.

Inputs/dependencies:
Original worker report.
Verifier/reviewer evidence.
Accepted blocker list.

Acceptance criteria:
Each blocker is resolved.
Focused verification passes.
No new unrelated changes.

Verification commands:
<commands that failed or prove blocker fixed>

Expected output:
DONE with blocker-by-blocker resolution and command output.
BLOCKED with remaining evidence if unresolved.
```

## Report statuses

- `DONE`: complete, verified, no unresolved concerns.
- `DONE_WITH_CONCERNS`: complete but contains risks or doubts mission-control must decide on.
- `NEEDS_CONTEXT`: missing info; mission-control should answer or re-packet.
- `BLOCKED`: cannot proceed; include smallest failing case and next action.
