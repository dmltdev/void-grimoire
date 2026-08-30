---
name: git-workflow
description: Use when a user asks to commit, push, publish a branch, open or update a pull request/merge request, finish a branch, ship changes, or wrap up git work.
---

# Git Workflow

Route git work by explicit user intent. A later git action is never implied by an earlier one.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | Any request involving commits, pushes, branch publishing, PRs, MRs, or vague phrases like "finish this branch". |
| Boundary | Does not perform git actions itself; it selects the narrow skill(s) authorized by the user's words. |
| Behavior | Prevents action drift: commit does not imply push, and push does not imply PR/MR. |
| Procedure | Classify intent, load the smallest skill sequence, stop before any unrequested mutation. |
| Proof | Final report names only the git actions actually authorized and performed. |

## Intent routing

| User intent | Load | Stop before |
|---|---|---|
| "commit this", "make a commit", "write/commit these changes" | `git-commit` | push, PR/MR |
| "push this", "publish branch", "update remote" | `git-push` | commit, PR/MR |
| "open/create/update PR", "open/create/update MR", "draft PR description" | `git-pr` | commit, push |
| "commit and push" | `git-commit` then `git-push` | PR/MR |
| "commit, push, and open PR/MR" | `git-commit`, `git-push`, `git-pr` | nothing beyond named actions |
| "finish this branch", "ship this", "wrap it up" | Ask one concise question naming commit, push, PR/MR choices | all mutation |

## Explicitness rules

- "Commit" means local commit only.
- "Push" means remote update only; it does not authorize new commits.
- "PR" / "MR" means create, update, or draft review text only; it does not authorize push.
- "Remote" authorizes push only when paired with push/publish/update language.
- Do not infer PR creation from a successful push.
- Do not infer push from a successful commit.
- Do not ask when the user already named the action sequence.
- If a mutating next step is ambiguous, choose the narrower safe action and stop.

## Required companion contracts

- Before any destructive git command, load `enforce-git-safety`.
- Before platform-specific GitHub/GitLab commands, load `git-active-remote`.
- Before any push, load `git-push`; it owns checks, active remote, and branch policy orchestration.
- Before any PR/MR action, load `git-pr`; it owns reviewer-facing title/body shape.

## Output contract

End with:

```markdown
**Git workflow:** <commit only | push only | PR/MR only | commit + push | commit + push + PR/MR | blocked>
**Authorized:** <actions explicitly requested>
**Performed:** <actions actually performed with refs/URLs when available>
**Stopped before:** <unrequested or blocked next action, or "none">
**Verification:** <checks/commands observed, or "not applicable">
```

## Red flags

| Mistake | Correct move |
|---|---|
| Treating "commit" as "commit, push, and PR". | Load `git-commit` only. |
| Opening a PR after push because it is convenient. | Stop and report pushed branch; wait for explicit PR request. |
| Creating a branch during push policy without permission. | `git-branch-policy` classifies only; ask before branch mutation. |
| Selecting `gh` because any remote is GitHub. | Resolve the active push remote with `git-active-remote`. |
| Bundling old `commit-push-pr` behavior. | Route old entrypoints through this skill. |
