---
name: gh-workflow
description: Use when the active git remote is GitHub or GitHub Enterprise, or when a user asks for GitHub operations through the `gh` CLI.
---

# GitHub CLI Workflow

Use `gh` only for the GitHub host resolved from the active remote. This skill is a platform adapter, not a permission grant.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | Active remote platform is GitHub/GitHub Enterprise, or user explicitly asks for `gh`/GitHub work. |
| Boundary | Does not decide whether to commit, push, or open a PR. Core git skills authorize actions first. |
| Behavior | Runs GitHub CLI calls against the resolved hostname, not the default account by accident. |
| Procedure | Verify `gh`, bind hostname, check auth, perform the host-specific query/mutation requested by caller. |
| Proof | Report the exact GitHub host and the `gh` operation/result. |

## Host binding

Input must include the `git-active-remote` packet. Use its `hostname` and parsed repository path for all repo-scoped calls.

- Public GitHub: `github.com`.
- GitHub Enterprise: resolved hostname from active remote, only when evidence identifies it as GitHub.

Derive `<owner>/<repo>` from the selected active remote URL. Use explicit host/repository binding for every repo-scoped command. Do not use host-specific `gh` commands when platform is `unknown`.

## Preflight

```bash
gh --version
GH_HOST=<host> gh auth status --hostname <host>
```

If auth fails, stop and ask the user to authenticate. Do not switch to another configured host.

## Command binding

Bind each command using that command's documented surface:

- `gh repo view` takes the repository as a positional argument: `<host>/<owner>/<repo>`.
- PR and run commands expose repository binding as `-R` / `--repo`: use `<host>/<owner>/<repo>`.
- `gh api` takes `--hostname <host>` and an API path using `<owner>/<repo>`.

If a showcased flag is unavailable in the installed `gh` version, check that specific subcommand's help and use its documented repository/host binding. Never rely on CLI repository context or default auth host in a multi-remote repo.

For PR operations, distinguish source and target:

- `-R <target-host>/<target-owner>/<target-repo>` binds the PR to the review target repository.
- `--head <source-owner>:<source-branch>` keeps the source fork/branch explicit.
- If source and target owners are the same, `--head <source-branch>` is acceptable only when it still targets the resolved source branch.

## Common operations

Repository metadata:

```bash
GH_HOST=<host> gh repo view <host>/<owner>/<repo> --json nameWithOwner,defaultBranchRef,url
```

Existing PR for current branch:

```bash
GH_HOST=<target-host> gh pr list -R <target-host>/<target-owner>/<target-repo> --head <source-branch> --json number,url,title,state,baseRefName,headRefName,headRepositoryOwner,isCrossRepository --jq '.[] | select(.headRepositoryOwner.login == "<source-owner>")'
```

Create PR:

```bash
GH_HOST=<target-host> gh pr create -R <target-host>/<target-owner>/<target-repo> --base <target-branch> --head <source-owner>:<source-branch> --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

Update PR body/title:

```bash
GH_HOST=<target-host> gh pr edit <number-or-url> -R <target-host>/<target-owner>/<target-repo> --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

Checks/status:

```bash
GH_HOST=<target-host> gh pr checks <number-or-url> -R <target-host>/<target-owner>/<target-repo>
GH_HOST=<source-host> gh run list -R <source-host>/<source-owner>/<source-repo> --branch <source-branch> --limit 10
```

Branch protection, when needed and authorized by host access:

```bash
GH_HOST=<target-host> gh api --hostname <target-host> repos/<target-owner>/<target-repo>/branches/<target-branch>/protection
```

Use JSON flags where available. Prefer machine-readable output over parsing formatted tables.

## PR text ownership

`git-pr` owns title/body content. `gh-workflow` only applies or queries through GitHub.

## Red flags

| Mistake | Correct move |
|---|---|
| Running `gh` without `--hostname`/host binding in enterprise or multi-host setup. | Bind to `git-active-remote.hostname`. |
| Using `gh` because origin is GitHub while active push remote is GitLab. | Use the active remote only. |
| Creating a PR from a push request. | Stop; PR requires explicit request and `git-pr`. |
| Parsing human tables when JSON exists. | Use `--json`. |
