---
name: git-commit
description: Use when a user explicitly asks to create, amend, split, or draft a local git commit or commit message.
---

# Git Commit

Create local commits with commitlint-compatible messages. Never push or open a PR/MR from this skill.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | User explicitly asks to commit, amend, split commits, or write a commit message. |
| Boundary | Does not push, publish, create branches for push policy, or open PRs/MRs. |
| Behavior | Produces a local commit only, with a Conventional Commit header and no AI attribution. |
| Procedure | Inspect intended diff, protect unrelated changes, derive repo-local message convention, commit with hooks enabled. |
| Proof | Commit hash and exact commit subject are reported; unrequested next actions are named as not performed. |

## Message format

Default to commitlint-compatible Conventional Commits:

```text
type(scope): short descriptor

Optional body explaining details, decisions, risks, or non-obvious context.
```

Rules:

- Header uses `type(scope): descriptor`; omit scope only when forced or unnatural.
- Descriptor is imperative, concise, lowercase unless proper noun, and has no trailing period.
- Body is optional. Use it for why, decision, migration, risk, or reviewer context. Do not narrate the diff.
- No `Co-authored-by` for AI, no "generated with", no AI attribution.
- Never use `--no-verify`.

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Repo-local commitlint config or recent history wins over this generic list.

## Repo-local convention lookup

Before committing, check the narrowest available evidence:

1. Project instructions already loaded.
2. `commitlint.config.*`, `.commitlintrc*`, or `package.json` commitlint config.
3. Recent commit subjects for local scope/type style.
4. README/CONTRIBUTING commit guidance if present.

Do not ask the user for repo facts that tools can read.

## Procedure

1. Confirm user explicitly authorized a commit.
2. Inspect status and diff enough to separate intended changes from unrelated user work.
3. Stage only intended files/hunks. Use `git add -A` only when the user's wording and status make all changes clearly in scope.
4. Generate one commit message from the staged diff.
5. Ask only when multiple materially different commit boundaries, types, or scopes are plausible.
6. Commit with hooks enabled.
7. Report the commit hash and subject.
8. Stop. Do not push or open PR/MR unless that was explicitly requested as a separate action.

## Split commits

When the diff contains unrelated logical changes, prefer separate commits only if the user requested splitting or the boundary is necessary for review. Otherwise ask before splitting; surprise multiple commits are still mutation beyond intent.

## Output contract

```markdown
**Committed:** `<hash>` `<type(scope): descriptor>`
**Scope:** <files/hunks included>
**Not performed:** push, PR/MR <unless explicitly requested elsewhere>
**Verification:** <commit hook/check output observed, or "git commit completed with hooks enabled">
```

## Red flags

| Mistake | Correct move |
|---|---|
| Commit message lacks `type(scope):`. | Fix to commitlint-compatible shape unless repo config says otherwise. |
| Pushing after commit because branch is ready. | Stop after local commit. |
| Using `git add -A` with unrelated user changes present. | Stage intended hunks/files only. |
| Adding AI attribution. | Omit it. |
| Retrying failed hooks with `--no-verify`. | Report hook failure and fix or ask. |
