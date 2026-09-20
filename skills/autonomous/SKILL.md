---
name: autonomous
description: Use when the user explicitly says do autonomously, work autonomously, take this end to end, make routine decisions without asking, or otherwise delegates completion of one task with minimal interruption.
---

# Autonomous

Complete one explicitly delegated task end to end without interrupting the user for routine decisions.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | The user explicitly delegates autonomous execution for the current task. |
| Boundary | This changes interruption and decision behavior, not scope, permissions, safety rules, or the authority of specialized skills. |
| Behavior | Resolve routine uncertainty from evidence, choose conservative reversible defaults, and continue until the requested deliverable is complete or genuinely blocked. |
| Procedure | Fix scope and authority, exhaust available evidence, execute every reachable phase, verify the real result, then deliver evidence. |
| Proof | The full requested outcome is complete; any mutation was authorized; verification matches the changed surface; no actionable work remains hidden. |

## Lifetime

Autonomous execution is task-scoped. It starts for the request that explicitly invokes it and ends when that task completes, is explicitly abandoned, or is replaced by a new task. It does not persist into a later unrelated request.

When the task is blocked on user input, autonomous execution pauses. A user reply that supplies the blocker continues the same autonomous task.

The task must have a finite deliverable or terminal condition. This skill does not create recurring schedules, background monitoring, self-restarting loops, cross-task queues, or a persistent session mode. Route persistent automation to the relevant service or workflow instead.

## Invariant

Autonomy removes routine questions, not judgment or safety. Never use it to widen scope, invent requirements, choose between materially different product outcomes, bypass another skill's approval gate, or perform an unrequested side effect.

## Authority ledger

Before mutation, classify the originating request:

| User words in the autonomous request | Authority granted |
|---|---|
| Implement, fix, refactor, update, create | Repository edits and verification for the named task. |
| Commit | Local commit only. |
| Push, publish the branch, update the remote | Push only; use the existing commit if no commit was requested. |
| Commit and push | Local commit, then normal push. |
| Ship this change, publish this change | Ambiguous git intent; route through `git-workflow` and ask its one focused commit, push, and PR/MR question before mutation. |
| Open or update a PR/MR | PR/MR action only unless commit or push was also named. |
| Release, publish a package, deploy, change production, rotate credentials | Only the exact protected action named in the current request; all specialized safety gates still apply. |
| Generic autonomous wording | No additional git, release, production, credential, or destructive authority. |

Protected actions require explicit current-request authorization. Autonomous wording by itself never authorizes destructive git, hook bypass, package release, production mutation, credential access, secret rotation, data deletion, or irreversible migration.

## Workflow

1. Restate internally the requested outcome, acceptance criteria, non-goals, and authority ledger. Do not expand them.
2. Load every relevant process, safety, and domain skill. Autonomous never replaces planning, debugging, testing, git, release, security, or repository-specific workflows.
3. Inspect repository and tool-provided evidence before asking. Read docs, code, tests, config, history, and runtime evidence needed for the decision.
4. Resolve routine ambiguity with the most conservative existing convention. Prefer reversible, boring choices and the smallest complete change.
5. Track multi-step work. Continue through implementation, caller and docs updates, focused verification, cleanup, and authorized delivery without stopping at phase boundaries.
6. When a command or tool fails, use its evidence, correct the invocation, or try another available route. One failed attempt is not a blocker.
7. Verify the actual changed surface. Reproduce and confirm bug fixes; run permanent behavior and API changes; exercise UI, CLI, or TUI changes in their real runtime when available.
8. Perform only delivery actions present in the authority ledger. Route them through their specialized skills and stop before any later unrequested action.
9. Report completed outcome, observed verification, performed delivery actions, and the exact remaining blocker or `None`.

## Decision rules

| Situation | Autonomous move |
|---|---|
| Several choices are equivalent and reversible | Pick the repository convention or boring default; continue. |
| Information exists in files, tools, docs, history, or runtime | Retrieve it; never ask the user. |
| A requirement is vague but one conservative interpretation preserves all stated behavior | State the interpretation in the final evidence; continue. |
| Choices create materially different user, legal, compliance, security, or data outcomes | Finish all independent work, then ask one focused decision question. |
| Required secret, account, device, approval, or external fact is inaccessible | Finish reachable work, then ask for that exact prerequisite. |
| Protected action is not explicitly authorized in the current request | Stop before it and request exact authorization. |
| An unrelated failure appears | Prove it is unrelated, preserve its evidence, and continue when the requested deliverable can still be verified. |
| Requested proof cannot be produced | Do not claim completion; name the failed proof and the smallest missing prerequisite. |

## Stop-question contract

Ask only for one of three reasons: an unreachable decision with materially different outcomes, an inaccessible prerequisite required to continue, or missing or ambiguous authority for a protected action or other mutation.

Before asking, verify all three:

1. Available tools, repository sources, and relevant skills cannot answer it.
2. A conservative reversible default would risk violating the request or safety boundary.
3. All work independent of the answer is complete.

Ask one concise question. Name the decision or prerequisite, the concrete options when applicable, and the consequence of each. Do not ask for confirmation of a routine choice.

## No fake completion

Never replace unavailable execution with a plausible-looking script, placeholder, mock, runbook, or configuration switch unless the user requested that artifact. Never claim commands, tests, commits, pushes, releases, or deployments that were not observed.

If the environment cannot perform a requested action, complete every reachable prerequisite and stop with the exact missing capability.

## Common mistakes

| Mistake | Correct move |
|---|---|
| Asking which file, command, or convention to use. | Inspect the repository and use its existing pattern. |
| Pausing after planning, implementation, or a todo update. | Continue through verification and authorized delivery. |
| Treating one tool failure as a blocker. | Diagnose it and try the next evidence-backed route. |
| Adding configuration to avoid a product decision. | Ask when outcomes are materially different and evidence cannot choose. |
| Assuming autonomous means commit, push, release, or deploy. | Use only the authority ledger from the originating request. |
| Generating a credential or deployment script instead of acting. | Use real authorized tooling or report the exact inaccessible prerequisite. |
| Performing extra cleanup or resilience work. | Keep the requested scope; do not add retries, telemetry, or abstractions without evidence. |
| Carrying autonomous mode into the next task. | End it with the current task. |

## Verification gate

- The originating request explicitly invoked autonomous execution.
- The delivered scope and acceptance criteria match the request.
- Routine questions were resolved from evidence rather than sent to the user.
- Any user question satisfied every stop-question condition.
- Relevant specialized skills and safety gates remained authoritative.
- Every mutation, git action, release, deployment, credential action, and destructive action was explicitly authorized.
- Verification exercised the actual changed surface and its output was observed.
- No fake fallback, placeholder, or unverified success claim appears.
- No actionable in-scope work remains.
- The final response uses no em dash characters.
- The task had a finite deliverable or terminal condition; no persistent loop or session mode was created.
