# Mission Control Continuity Loop

## Problem

Long-running `omp` or `/mission-control` sessions lose quality when they compact repeatedly. The orchestrator needs a controlled handoff path before context pressure corrupts decisions, phase state, or worker coordination.

## Direction

Make continuity explicit: the current mission-control writes durable state, starts a fresh mission-control pane through herdr, verifies the successor is ready, then closes the old pane.

## Proposed flow

1. Detect context pressure or phase boundary.
2. Write a machine-readable handoff artifact, not only a prose session summary.
3. Spawn a fresh `omp` mission-control pane via herdr.
4. Pass a self-contained continuation prompt that points at the handoff artifact.
5. Wait for the successor to print a readiness marker, e.g. `MISSION_CONTROL_READY`.
6. Close the old pane only after the successor acknowledges state.

## Durable state shape

```md
Goal:
Current phase:
Phase exit criteria:
Decisions:
Open contracts:
Active worker panes:
Worker statuses:
Files changed:
Verification evidence:
Risks:
Next action:
Relaunch prompt:
```

## Constraints

- Live in-process subagents cannot survive the old `omp` process. Persist their useful output before handoff.
- Herdr pane workers are better for long-lived orchestration because the successor can rediscover panes and read their output.
- Pane IDs are not durable. Refresh them with `herdr pane list` before use.
- `/session-summary` is useful for human handoff, but mission-control should also write structured run state.
- Self-kill must happen after successor readiness, not before.

## Candidate fixes

- Add a continuity threshold to mission-control, e.g. context percent, tool-call count, transcript size, or repeated rereads.
- Add a `handoff-and-relaunch` recipe to the herdr or mission-control skill.
- Define a standard readiness marker and blocked marker for successor sessions.
- Store run state under a repo-local convention such as `.mission/state.md` only if the repo opts into it.
- Prefer a small stable handoff artifact over broad logs or full transcript copies.
