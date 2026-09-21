---
name: git-push
description: Use when a user explicitly asks to push, publish a branch, update a remote branch, or otherwise send local commits to a remote.
---

# Git Push

Push only when the user explicitly requested a remote update, required checks pass, and branch policy allows it.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | User explicitly asks to push, publish, or update a remote branch. |
| Boundary | Does not create commits, create/switch branches, or open PRs/MRs unless separately authorized. |
| Behavior | Gates remote mutation behind validation, active-remote resolution, branch policy, and destructive-command safety. |
| Procedure | Confirm intent, inspect active remote, classify branch policy, run repo-local checks, push without force. |
| Proof | Report validation commands, active remote, branch policy, and pushed ref. |

## Required gates before push

1. Explicit push intent is present.
2. `enforce-git-safety` is loaded; no force/discard/no-verify behavior is used.
3. `git-active-remote` resolves the target remote and hostname using Git push precedence.
4. Host adapter is loaded only for the active remote platform:
   - `github` => `gh-workflow`
   - `gitlab` => `glab-workflow`
   - `unknown` => generic git only; stop before host-specific operations.
   - `multiple` => stop before host-specific operations and ask the user to select one push URL or explicitly authorize pushing every configured URL.
5. `git-branch-policy` returns `allow push` for the exact push destination and `<target> HEAD:<target-branch>` ref.
6. Repo-local validation commands pass, or the user explicitly overrides after seeing failures.

## Dirty worktree rule

If uncommitted changes exist and the user only requested push:

- Do not commit them.
- Do not stash them unless explicitly authorized.
- Report that push only sends existing commits and local changes remain uncommitted.
- Continue only if pushing existing commits is still safe and branch policy/checks pass.

## Validation command discovery

Use local evidence in this order:

1. Project instructions already loaded.
2. README/CONTRIBUTING workflow commands.
3. Package scripts: `lint`, `typecheck`, `build`, relevant `test`.
4. Makefile/justfile/taskfile equivalents.
5. Existing CI names only as hints when local commands are absent.

Run the smallest required gate that proves remote-safe state. Typical gate for app code is lint + typecheck + build; add targeted tests when behavior changed or tests exist for the touched area. If no commands exist, state that no local validation command was found; do not invent fake checks.

A failed gate blocks push. The user may explicitly override after seeing the failure; record that override in the final report.

## Push execution

- Push the current HEAD to the resolved target branch with an explicit refspec: `git push <remote-or-selected-url> HEAD:<target-branch>`.
- If the active remote has exactly one push URL, `<remote-or-selected-url>` may be the resolved remote name or that URL.
- If the active remote has multiple push URLs and the user selected one, `<remote-or-selected-url>` must be that exact selected raw push URL. Do not use the remote name; Git would push to every configured push URL. Do not use `-u` with a raw URL; report that no upstream was set.
- If the user explicitly authorizes pushing every configured push URL, classify branch policy for each destination first, then `git push <remote> HEAD:<target-branch>` may be used.
- If setting upstream is required and policy validated a named remote with exactly one destination, use `git push -u <remote> HEAD:<target-branch>`.
- Do not use bare `git push`. User or repo config such as `push.default=matching` can push multiple branches and exceed the user's current-branch authorization.
- Never use `--force`, `--force-with-lease`, or `-f` unless explicitly requested and separately confirmed under `enforce-git-safety`.
- If rejected, do not force. Fetch/rebase/merge only when the user authorizes conflict-resolution work or repo instructions require a known safe path.

## Output contract

```markdown
**Pushed:** `<remote>/<branch>` or `not pushed`
**Active remote:** <remote>, <hostname>, <platform>, source <source>
**Branch policy:** <allow/block/ask/requires feature branch> with evidence
**Checks:** <commands run and observed result>
**Not performed:** commit, PR/MR <unless explicitly requested elsewhere>
```

## Red flags

| Mistake | Correct move |
|---|---|
| Pushing because a commit succeeded. | Push only with explicit push intent. |
| Creating a feature branch because policy requires it. | Stop and ask unless branch creation was explicitly requested. |
| Running `gh`/`glab` against default host. | Bind adapter to active remote hostname. |
| Skipping checks for speed. | Run checks unless user explicitly overrides after failure or asks for a no-check push. |
| Force pushing to solve rejection. | Stop; do not force without explicit request and confirmation. |
