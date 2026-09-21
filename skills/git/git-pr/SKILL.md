---
name: git-pr
description: Use when a user explicitly asks to open, create, update, or draft a pull request or merge request description.
---

# Git PR / MR

Create or update reviewer-facing PR/MR text only when explicitly requested. Respect the reviewer: concise, decision-focused, no boilerplate.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | User explicitly asks for PR/MR creation, update, or description drafting. |
| Boundary | Does not commit or push. Branch must already be pushed unless push was separately authorized. |
| Behavior | Produces a concise, standardized PR/MR title/body sized to risk, not diff length. |
| Procedure | Resolve active remote, choose host adapter, inspect diff/range, draft or apply PR/MR text. |
| Proof | Report PR/MR URL or rendered title/body preview; no unrequested push/commit occurred. |

## Preconditions

- PR/MR intent is explicit.
- Source branch is pushed to the active remote for create/update operations.
- Active remote is resolved by `git-active-remote`; this gives the source/push repository.
- Target/base repository and target/base branch are separately resolved from explicit user input, repo convention, or host metadata.

If the source branch is not pushed and the user did not authorize push, stop and say push is required before PR/MR creation.

## Source vs target repository

Do not assume the push/source repository is the review target. Fork workflows often push to a user fork and open PRs/MRs against an upstream repository.

Return both:

```text
source repo: <host>/<owner-or-group>/<repo> from git-active-remote
target repo: <host>/<owner-or-group>/<repo> from explicit user target | repo convention | host metadata
target branch: <branch>
```

Resolution order for target repo:

1. Explicit user target.
2. Repo-local instructions.
3. Host metadata for parent/upstream/default repository.
4. If unresolved and source repo may be a fork, ask before creating/updating PR/MR.

Bind host CLI commands to the target repo for PR/MR operations, while keeping source repo/branch explicit.

## Host routing

- Active remote platform `github` => use `gh-workflow`.
- Active remote platform `gitlab` => use `glab-workflow`.
- Platform `unknown` => draft text locally if requested; stop before host-specific PR/MR creation.
- Platform `multiple` => stop before host-specific PR/MR creation until the user selects one source push URL.

Bind all host CLI calls to the resolved source and target hostnames. If source and target hosts differ, stop unless the host tool explicitly supports cross-host review requests.

## Title

Use:

```text
<TICKET-ID>: <imperative summary>
```

when a ticket exists, else:

```text
<imperative summary>
```

Rules:

- Imperative, concise, no trailing period.
- Do not include Conventional Commit type (`feat:` belongs in commits, not PR titles).
- Mirror branch/change intent without marketing language.

## Body sized to risk

Classify from the diff, issue, and repo context.

### Trivial

Rename, typo, copy tweak, lockfile-only, formatting, dependency bump with no API/behavior change.

Use title only, or one sentence if the why is not obvious.

### Standard

Contained feature, bugfix, refactor with no behavior change, normal internal code change.

Use 1-3 bullets:

```markdown
- Cache story lookups in the resolver; previous flow hit the DB twice per request.
- Closes ABC-123.
```

### Critical / hot path / breaking / migration

Touches auth, billing, data integrity, a hot path, public API, schema, deployment, migration, or rollback-sensitive code.

Use short prose with only load-bearing facts:

- What changed.
- Why now / what it unblocks.
- Observable behavior change.
- Risk + rollback or migration note.
- Links to ticket/ADR/related PRs when real.

Skip empty sections. Never write `Migration: N/A`.

## Hard exclusions

Never include:

- "Affected files" or file lists.
- "How to test" / test-plan boilerplate unless repo template requires it.
- Generic checklists unless repo template requires them.
- AI attribution.
- Marketing words: "comprehensive", "robust", "seamless".
- Restating the diff in English.

Decision rule: if a body line can be deleted without the reviewer losing needed context, delete it.

## Output contract

```markdown
**PR/MR:** <URL or "draft only">
**Title:** <title>
**Body:** <empty | concise markdown>
**Risk size:** trivial | standard | critical
**Not performed:** commit, push <unless explicitly requested elsewhere>
```

## Red flags

| Mistake | Correct move |
|---|---|
| Creating PR after push without request. | Stop after push; wait for explicit PR/MR request. |
| Pushing branch from PR skill. | Stop and ask for push authorization or route through `git-push`. |
| Using GitHub terminology on GitLab. | Use MR/source/target branch through `glab-workflow`. |
| Filling body with file lists/checklists. | Delete boilerplate; keep reviewer-needed facts only. |
