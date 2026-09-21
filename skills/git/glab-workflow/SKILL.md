---
name: glab-workflow
description: Use when the active git remote is GitLab or self-hosted GitLab, or when a user asks for GitLab operations through the `glab` CLI.
---

# GitLab CLI Workflow

Use `glab` only for the GitLab host resolved from the active remote. This skill is a platform adapter, not a permission grant.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | Active remote platform is GitLab/self-hosted GitLab, or user explicitly asks for `glab`/GitLab work. |
| Boundary | Does not decide whether to commit, push, or open an MR. Core git skills authorize actions first. |
| Behavior | Runs GitLab CLI calls against the resolved hostname and uses GitLab terminology. |
| Procedure | Verify `glab`, bind hostname, check auth, perform the host-specific query/mutation requested by caller. |
| Proof | Report the exact GitLab host and the `glab` operation/result. |

## Host binding

Input must include the `git-active-remote` packet. Use its `hostname` and parsed repository path for all repo-scoped calls.

- Public GitLab: `gitlab.com`.
- Self-hosted GitLab: resolved hostname from active remote, only when evidence identifies it as GitLab.

Derive `<group>/<project>` from the selected active remote URL. Include nested groups exactly as they appear in the path. Use explicit host/repository binding for every repo-scoped command. Do not use host-specific `glab` commands when platform is `unknown`.

## Preflight

```bash
glab --version
GITLAB_HOST=<host> glab auth status --hostname <host>
```

If the installed `glab` version uses a different host flag, verify with `glab <command> --help` and use the host-binding option it documents. If auth fails, stop and ask the user to authenticate. Do not switch to another configured host.

## Command binding

Bind each command using that command's documented surface:

- `glab repo view` takes the repository URL as a positional argument: `https://<host>/<group>/<project>`.
- MR/pipeline/CI commands that expose `-R` / `--repo` should use the documented full URL form for self-hosted hosts: `https://<host>/<group>/<project>`.
- If the installed `glab` version documents a different host-qualified repository form, use that exact form after checking the specific subcommand's help.

Never rely on CLI repository context or default auth host in a multi-remote repo. Never use `glab mr create --fill` or `glab mr create --push`; current `glab --fill` behavior can imply push, and `git-pr` has a no-push boundary.

For MR operations, distinguish source and target:

- `-R https://<target-host>/<target-group>/<target-project>` binds the MR command to the review target project when the command supports `-R`.
- `-H <source-group>/<source-project>` / `--head <source>` selects another source repository for MR creation; `glab mr create --help` documents owner/group/project, project ID, or full URL forms.
- Keep source project and source branch explicit. If `glab` cannot express the fork/source project explicitly for the needed operation, stop before creating the MR instead of opening it against the wrong project.

## Common operations

Repository metadata:

```bash
GITLAB_HOST=<host> glab repo view https://<host>/<group>/<project>
```

Existing MR for current branch:

```bash
GITLAB_HOST=<target-host> glab mr list -R https://<target-host>/<target-group>/<target-project> --source-branch <source-branch> --output json
```

Create MR:

```bash
GITLAB_HOST=<target-host> glab mr create -R https://<target-host>/<target-group>/<target-project> -H <source-group>/<source-project> --target-branch <target-branch> --source-branch <source-branch> --title "<title>" --description "$(cat <<'EOF'
<body>
EOF
)"
```

Update MR:

```bash
GITLAB_HOST=<target-host> glab mr update <iid-or-url> -R https://<target-host>/<target-group>/<target-project> --title "<title>" --description "$(cat <<'EOF'
<body>
EOF
)"
```

Pipeline/status:

```bash
GITLAB_HOST=<source-host> glab pipeline list -R https://<source-host>/<source-group>/<source-project> --branch <source-branch>
GITLAB_HOST=<source-host> glab ci status -R https://<source-host>/<source-group>/<source-project>
```

Branch protection, when needed and authorized by host access:

```bash
GITLAB_HOST=<target-host> glab api projects/<url-encoded-target-group-project-path>/protected_branches/<target-branch>
```

Prefer JSON/API output when available over parsing formatted tables.

## Terminology

Use GitLab terms in user-facing output:

- Merge request, not pull request.
- Source branch, not head branch.
- Target branch, not base branch.
- IID when GitLab returns project-local MR numbers.

## MR text ownership

`git-pr` owns title/body content. `glab-workflow` only applies or queries through GitLab.

## Red flags

| Mistake | Correct move |
|---|---|
| Running `glab` against its default host in multi-host setup. | Bind to `git-active-remote.hostname`. |
| Using GitHub PR terminology for GitLab. | Use MR/source/target branch. |
| Creating an MR from a push request. | Stop; MR requires explicit request and `git-pr`. |
| Inferring self-hosted GitLab from hostname text alone. | Require repo docs or host-bound CLI/API evidence. |
