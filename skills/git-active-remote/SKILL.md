---
name: git-active-remote
description: Use when resolving push targets, remote hostnames, PR/MR source repositories, branch-protection hosts, CI/status hosts, GitHub remotes, GitLab remotes, or multi-remote git repositories.
---

# Git Active Remote

Resolve the remote actually targeted by the current operation. Never classify a repo by any arbitrary remote.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | Before push, PR/MR creation/update, branch protection lookup, CI/status lookup, or `gh`/`glab` use. |
| Boundary | Does not push, create PRs/MRs, or change config. It only resolves target remote, hostname, and platform. |
| Behavior | Prevents multi-remote/fork/mirror repos from using the wrong host adapter. |
| Procedure | Follow Git push target precedence, parse the selected remote URL, classify only with evidence. |
| Proof | Return the active remote packet with source and hostname. |

## Resolution precedence

Use this exact order:

1. Explicit remote named by the user or command intent.
2. `branch.<current>.pushRemote`.
3. `remote.pushDefault`.
4. `branch.<current>.remote` / upstream remote.
5. `origin` fallback.
6. Unresolved => block and ask.

`remote.pushDefault` comes before upstream. It intentionally overrides fetch/upstream remote in split fetch/push setups.

## Suggested reads/commands

Use the host tools available in the harness, but the facts are:

```bash
git branch --show-current
git config --get branch.<branch>.pushRemote
git config --get remote.pushDefault
git config --get branch.<branch>.remote
git remote get-url --push --all <remote>
```

Only fall through when a precedence key is unset. If `branch.<branch>.pushRemote`, `remote.pushDefault`, or `branch.<branch>.remote` is set but `git remote get-url --push --all <remote>` fails, return `unresolved` and block as invalid git configuration. Do not silently continue to `origin`; Git would not push there, and doing so can target the wrong server.

Use the selected remote's push URL, not its fetch URL. `remote.<name>.pushurl` can target a different host than `remote.<name>.url`. If multiple push URLs are configured, report them as `multiple` and stop before host-specific commands unless the user explicitly selects one target; a single PR/MR host cannot be inferred from a multi-push remote.

## URL parsing

Support at least:

```text
git@github.com:owner/repo.git
git@gitlab.com:group/repo.git
ssh://git@git.example.com/group/repo.git
https://github.com/owner/repo.git
https://gitlab.company.com/group/repo.git
```

Extract the hostname and repository path from the selected remote's push URL. Sanitize credentials from HTTPS URLs before reporting.

## Platform classification

Return `github`, `gitlab`, `unknown`, or `multiple`.

Canonical public hosts:

- `github.com` => `github`
- `gitlab.com` => `gitlab`

Noncanonical hosts such as `git.example.com`, `github.company.com`, or `gitlab.company.com` are `unknown` unless repo config/instructions or host-bound CLI auth/API evidence identifies the provider. Do not infer provider from substrings or whichever CLI is installed.

Acceptable evidence:

- Repo instructions name the host as GitHub Enterprise or GitLab.
- Host-bound `gh auth status --hostname <host>` succeeds and the host is configured as GitHub.
- Host-bound `glab auth status --hostname <host>` succeeds and the host is configured as GitLab.
- A host-bound API probe through the selected CLI identifies the service.

If still unknown, stop before host-specific commands and use generic git only when the requested action does not require host APIs.

## Return packet

```text
active remote: <name | multiple | unresolved>
hostname: <host | multiple | unresolved>
platform: github | gitlab | unknown | multiple
repository path: <owner-or-group/repo | multiple | unresolved>
remote url: <sanitized-push-url | multiple | unresolved>
source: explicit | branch-pushRemote | remote-pushDefault | branch-upstream | origin | unresolved
```

## Adapter binding

- If one push URL resolves to GitHub, load `gh-workflow` and bind all `gh` calls to the resolved hostname and repository path.
- If one push URL resolves to GitLab, load `glab-workflow` and bind all `glab` calls to the resolved hostname and repository path.
- If push URLs are `multiple`, stop before host-specific commands until the user selects one target push URL or explicitly authorizes every configured destination.
- Never let default CLI auth select a different host/account silently.

When the user selects one push URL from a multi-push remote, downstream push commands must use that exact URL as the push target. Passing the remote name would still push to every configured `remote.<name>.pushurl`.

## Red flags

| Mistake | Correct move |
|---|---|
| Checking whether any remote contains `github.com`. | Resolve the active remote first, then classify only that URL. |
| Using upstream before `remote.pushDefault`. | Respect Git push precedence: pushRemote, pushDefault, upstream. |
| Treating `origin` as special before config. | `origin` is only a fallback. |
| Using `git remote get-url <remote>` for routing. | Use `git remote get-url --push --all <remote>`; push URLs can differ from fetch URLs. |
| Inferring self-hosted provider from hostname text. | Require repo docs or host-bound CLI/API evidence. |
