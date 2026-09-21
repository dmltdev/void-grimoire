---
name: enforce-git-safety
description: Use when git force push, reset hard, clean, mass discard, checkout discard, restore discard, branch deletion, history rewrite, no-verify, or hook bypass is requested.
---

# Git Safety

Global prohibitions for destructive git operations. This skill does not own normal commit, push, branch policy, or PR/MR workflow.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | Force push, reset, clean, mass discard, hook bypass, history rewrite, or any destructive git operation. |
| Boundary | Does not decide normal push policy or validation commands; `git-push` owns that. |
| Behavior | Blocks irreversible or review-bypassing commands unless the user explicitly requested and confirmed the risk. |
| Procedure | Detect destructive intent, prefer non-destructive alternatives, require explicit permission for risky commands. |
| Proof | Report the blocked command or the explicit user authorization that allowed it. |

## Forbidden without explicit permission

- `git push --force`
- `git push -f`
- `git push --force-with-lease`
- `git reset --hard`
- `git clean -fd`
- `git clean -fdx`
- `git checkout -- .`
- `git restore .`
- `git restore --staged .` when it would mass-unstage user work
- `git commit --no-verify`
- any `--no-verify` hook bypass
- branch deletion of shared/default/protected branches

Explicit permission must name the risky action. A generic "continue" is not enough for destructive commands.

## Safer alternatives

| Risky action | Prefer |
|---|---|
| discard worktree | inspect status, revert specific files/hunks, or ask |
| reset hard | stash or make a backup branch first |
| force push | fetch/rebase/merge or ask for conflict strategy |
| bypass hooks | fix the hook failure or ask after showing exact output |
| delete branch | verify merged/upstream status and ask |

## Normal git workflow ownership

- `git-commit` owns commit message shape and local commit procedure.
- `git-push` owns validation gates, active remote, and branch policy before normal pushes.
- `git-branch-policy` classifies default/protected/shared branch safety.
- `git-pr` owns PR/MR creation and description shape.

Do not add generic "always pull before push" rules here. Pull/rebase/fetch decisions depend on repo workflow and belong to `git-push`.

## Red flags

| Mistake | Correct move |
|---|---|
| Retrying a failed commit with `--no-verify`. | Show hook output and fix or ask. |
| Force pushing to solve rejection. | Stop; require explicit force-push request and confirmation. |
| Discarding unrelated user changes. | Preserve user work; ask before discard. |
| Using this skill as the normal push checklist. | Load `git-push` for ordinary push workflow. |
