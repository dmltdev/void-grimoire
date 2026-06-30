# Memory Plugin and Pipeline State

## Problem

`mission-control` needs durable state for task queues, decisions, risk registers, worker status, verification evidence, and handoff. A future memory plugin may also store long-lived project knowledge, corrections, conventions, and learned workflow patterns.

Keeping both concerns in one store is tempting, but risks mixing transient run state with durable memory.

## Direction to grill

Decide whether the memory plugin owns pipeline state or whether they remain separate systems.

## Option A: unified memory and pipeline store

- One plugin stores both durable memory and active pipeline state.
- Easier discovery and fewer moving parts.
- Risk: transient worker/run noise pollutes long-lived memory.
- Risk: privacy, retention, and pruning rules become harder.

## Option B: separate memory and pipeline state

- Memory plugin stores durable knowledge: conventions, corrections, decisions, learned patterns.
- `.mission-control/run.md` or a pipeline-state adapter stores active run state: task queue, phase, lanes, workers, evidence, next action.
- Cleaner lifecycle boundaries.
- Risk: control plane must sync useful decisions from run state into memory explicitly.

## Current decision

Keep active pipeline state separate from durable memory.

Use `.mission-control/run.md` as the mission-control run-state convention.

Use markdown only for the initial run-state file so it stays human-reviewable and safe for agents to patch.

Treat memory persistence as a separate future plugin until grilling proves a unified store is worth the coupling.

Promote only human-approved decisions and corrections into durable memory.

Use explicit memory scopes: repo-local for project decisions/conventions; user-global for stable personal preferences and general workflow corrections.

Overwrite `.mission-control/run.md` per active mission. Do not archive routine run logs by default.

## Open questions

1. Should repeated risk/slop patterns be promoted later, and behind what review gate?
