# Run state

Use `.mission-control/run.md` for batch, high-risk, or long-running missions. Keep low-risk single-task missions session-only unless persistence is needed.

## Rules

- Markdown only.
- Overwrite per active mission.
- Do not archive routine run logs by default.
- Keep pipeline state separate from durable memory.
- Promote only human-approved decisions and corrections into memory at signoff.
- Use explicit memory scopes when promotion exists: repo-local for project decisions/conventions; user-global for stable personal preferences and general workflow corrections.

## Template

```md
# Mission Control Run

Goal:
Mode:
Current phase:
Phase exit criteria:
Risk level:
State owner:

## Task queue

- [ ] <task> - risk: <low|high> - lane: <A|B|none> - status: <queued|active|blocked|done>

## Contracts

### <task>

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

## Lanes

### Lane A

Worker:
Scope:
Status:
Latest evidence:
Next action:

### Lane B

Worker:
Scope:
Status:
Latest evidence:
Next action:

## Decisions

- <decision> - <rationale> - memory scope: <none|repo-local|user-global> - approval: <pending|approved|rejected>

## Assumptions

- <assumption> - validation path:

## Verification evidence

- <command/probe> - <result> - artifact:

## Review findings

- <finding> - severity: <critical|warn|info> - status:

## Risks / blockers

- <risk/blocker> - owner: - next action:

## Memory candidates

- <candidate> - memory scope: <repo-local|user-global> - approval: <pending|approved|rejected>

## Git handoff

Commit approved: <yes|no|pending>
Push/PR approved: <yes|no|pending>
Package:

## Next action

<single concrete next action>
```
