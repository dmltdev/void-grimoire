---
name: commit-push-pr
description: Use when older prompts invoke commit-push-pr, combined commit push PR, commit and push and open PR, full git handoff, or legacy git automation.
---

# Commit Push PR Compatibility Router

This is a legacy entrypoint. It no longer owns commit, push, or PR execution.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | User or an older prompt explicitly invokes `commit-push-pr` or asks for a combined commit/push/PR workflow. |
| Boundary | Does not inspect, stage, commit, push, branch, or open PRs directly. |
| Behavior | Routes through `git-workflow` so each mutating action still requires explicit user intent. |
| Procedure | Load `git-workflow`, pass the user's exact requested action sequence, and follow the narrow routed skills. |
| Proof | Final output names `git-workflow` routing and the exact actions actually authorized. |

## Required behavior

1. Load `git-workflow`.
2. Preserve the user's exact wording:
   - `commit` only => `git-commit` only.
   - `push` only => `git-push` only.
   - `PR` / `MR` only => `git-pr` only.
   - `commit and push` => no PR/MR.
   - `commit, push, and open PR/MR` => full sequence.
3. Stop before any unrequested action.

## What this skill must not do

- Do not stage files.
- Do not create commits.
- Do not push.
- Do not create or update PRs/MRs.
- Do not create/switch branches.
- Do not run legacy bundled workflow steps.
- Do not infer PR creation from push or push from commit.

## Why this exists

The old combined workflow encouraged accidental scope expansion:

```text
commit -> push -> PR
```

The current workflow is permission-bound:

```text
explicit user words -> git-workflow routing -> narrow skill execution
```

## Output contract

```markdown
**Compatibility route:** `commit-push-pr` -> `git-workflow`
**Authorized:** <actions explicitly requested>
**Next skill(s):** <git-commit | git-push | git-pr sequence>
**Stopped before:** <unrequested action, or "none">
```

## Red flags

| Mistake | Correct move |
|---|---|
| Running the old all-in-one flow. | Route to `git-workflow`. |
| Keeping a `create-pr` chain. | Do not chain to PR unless the user requested PR/MR. |
| Treating `--quick` as permission to skip intent boundaries. | `--quick` cannot authorize push or PR. |
| Using GitHub-specific assumptions. | Active remote/platform belongs to `git-active-remote`. |
