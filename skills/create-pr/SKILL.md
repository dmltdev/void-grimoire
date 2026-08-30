---
name: create-pr
description: Use when older prompts invoke create-pr, create PR, open PR, create pull request, open merge request, or draft PR description through the legacy skill name.
---

# Create PR Compatibility Router

This is a legacy entrypoint. `git-pr` owns PR/MR creation, update, and description drafting.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | User or an older prompt invokes `create-pr`, or asks to create/update/draft a PR/MR through the old skill name. |
| Boundary | Does not push, commit, run checks, or write PR/MR text directly. |
| Behavior | Routes to `git-pr`, preserving the explicit PR/MR-only permission boundary. |
| Procedure | Load `git-pr`; let it resolve active remote, host adapter, title/body shape, and preconditions. |
| Proof | Final output names `git-pr` routing and the PR/MR URL or draft text it produced. |

## Required behavior

1. Load `git-pr`.
2. Preserve the user's PR/MR intent exactly:
   - create/open PR or MR
   - update existing PR or MR
   - draft title/body only
3. Do not push if the branch is not published. `git-pr` must stop and ask for explicit push authorization or route through `git-push` only when the user requested push too.
4. Do not commit local changes.

## What this skill must not do

- Do not create commits.
- Do not push.
- Do not run pre-push validation.
- Do not pick GitHub/GitLab by scanning arbitrary remotes.
- Do not suggest or invoke `commit-push-pr`.
- Do not include PR body boilerplate here; `git-pr` owns that contract.

## Output contract

```markdown
**Compatibility route:** `create-pr` -> `git-pr`
**Requested:** <create/update/draft PR/MR>
**Next skill:** `git-pr`
**Stopped before:** <commit/push if not explicitly requested, or "none">
```

## Red flags

| Mistake | Correct move |
|---|---|
| Pushing because PR creation needs a remote branch. | Stop unless push was explicitly requested. |
| Recreating the old PR body template here. | Delegate to `git-pr`. |
| Suggesting `commit-push-pr`. | Never create a cycle; route one-way to `git-pr`. |
| Using `gh` by default. | `git-pr` must resolve active remote first. |
