---
name: git-branch-policy
description: Use when pushing from default, protected, shared, production, staging, development, feature, fix, or unclear git branches, or choosing a PR/MR target branch.
---

# Git Branch Policy

Classify whether the current branch may be pushed. This skill is classification-only: it never creates, switches, renames, or pushes branches.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | Before push, PR/MR base selection, branch creation for publication, or default/protected branch mutation. |
| Boundary | Does not mutate branches or remotes. `git-push` or the caller acts on the classification. |
| Behavior | Applies repo-specific branch conventions instead of assuming every repo forbids or allows direct main pushes. |
| Procedure | Resolve active remote, inspect branch and local docs/config, classify as allow/block/ask/requires feature branch. |
| Proof | Return a branch-policy packet with evidence and no side effects. |

## Classification values

Return exactly one:

```text
allow push
block push
ask user
requires feature branch
```

Meanings:

- `allow push` — Current branch and repo policy allow a normal non-force push after checks pass.
- `block push` — Push would violate a known rule or target a protected branch in a way the agent must not perform.
- `ask user` — Policy cannot be resolved from repo evidence and the next action would affect a shared/default/protected branch.
- `requires feature branch` — Repo policy or safety requires branch work before pushing; caller must stop unless branch creation/switching was explicitly authorized.

## Evidence to inspect

- Current branch.
- Default branch.
- Active remote packet from `git-active-remote`, including hostname, repository path, and whether push URLs are single or multiple.
- Exact push destination that `git-push` will use: named remote, selected raw push URL, or every configured push URL when explicitly authorized.
- Upstream/push remote branch.
- Repo-local instructions: README, CONTRIBUTING, loaded project instructions, deployment docs.
- Host branch protection for the exact destination when available through the active host adapter.
- Deployment/production hints: production app, release branch, deploy docs, protected branch rules.
- Existing branch naming conventions only when a new branch name is already authorized.

## Decision rules

| Condition | Classification |
|---|---|
| Current branch is a feature/fix/topic branch and has no known protection conflict. | `allow push` |
| Current branch is default branch and repo docs explicitly say direct pushes to it are expected. | `allow push` |
| Current branch is `dev`, `stg`, `stage`, `develop`, or similar and repo docs explicitly say direct pushes there are expected. | `allow push` |
| Current branch is default branch, production is indicated, branch is protected, or no clear direct-push convention exists. | `requires feature branch` or `ask user` |
| Host protection or repo instructions prohibit direct push. | `block push` |
| Policy is unclear and push targets a shared/default/protected branch. | `ask user` |
| Active remote has multiple push URLs and the user selected one raw URL. | Classify only that selected URL and require `git-push` to use the raw URL, not the remote name. |
| Active remote has multiple push URLs and the user authorized pushing all destinations. | Classify every configured destination; any blocked destination blocks the push. |

Do not assume `main` is always forbidden. Do not assume `main` is always allowed. Local convention wins when explicit.

## Output packet

```text
branch policy: allow push | block push | ask user | requires feature branch
current branch: <name>
push destination: <remote name | sanitized selected push URL + host | every configured destination sanitized>
target remote: <active remote name | selected raw URL host>
target branch: <remote branch or inferred branch>
evidence: <1-3 concrete facts>
required next step: <none | ask for branch authorization/name | stop | ask policy question>
```

Raw push URLs are execution-only. Reports and final command summaries must redact credentials and show sanitized URL plus host.

## Red flags

| Mistake | Correct move |
|---|---|
| Running `git checkout -b` inside policy. | Return `requires feature branch`; caller asks/acts only if authorized. |
| Treating production hint as automatic hard block despite explicit repo docs. | Local direct-push convention can allow push after checks. |
| Ignoring active remote and checking origin protection. | Use `git-active-remote` result. |
| Classifying a remote name with multiple push URLs as one destination. | Classify the selected raw URL or every configured push URL explicitly. |
| Asking when docs clearly state the branch workflow. | Follow the docs. |
