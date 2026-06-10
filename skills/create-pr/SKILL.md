---
name: create-pr
domain: git
description: Use when opening a pull/merge request on GitHub, Bitbucket, or any other remote. Enforces a concise, reviewer-respecting PR shape — body detail scales with change risk, not change size. No "Affected files", no "How to test", no AI boilerplate.
depends-on: []
chains-to: null
suggests: [work-git, commit-push-pr]
---

# Create PR

Open a PR that respects the reviewer's time. The reviewer should grasp **problem, change, and blast radius** in under 30 seconds.

## Preconditions

- Branch is pushed to its remote tracking branch.
- Target branch is known (`develop` if it exists, else `main` / `master`). Never target the release branch when an integration branch exists.

## Host detection

Inspect `git remote -v` (or equivalent) and pick the tool you actually have access to:

- `github.com` => `gh pr create`.
- `bitbucket.org` or self-hosted Bitbucket => `bitbucket` MCP (`create_pull_request`).
- Anything else (GitLab, Codeberg, Gitea, sr.ht, internal forge, ...) => use whatever CLI / MCP the harness already exposes for that host. Do not invent one.

If the host is recognised but **no tool is available to act on it**, stop and tell the user — let them open the PR themselves. Recognising the host is not enough; you also need the means to talk to it.

## Title

`<TICKET-ID>: <imperative summary>` when a ticket exists, else just the summary.

- Imperative, lowercase after the colon, no trailing period.
- Mirror the branch intent. Do not restate the conventional-commit type (`feat:` belongs in commits, not PR titles).
- Good: `ABC-123: add story module`
- Bad: `ABC-123: Comprehensive overhaul of the story management subsystem`

## Body — sized to risk, not to diff length

Classify the change from the diff first. If genuinely unsure between **standard** and **critical**, ask the user one question. Do not default upward "to be safe" — that produces the boilerplate this skill exists to kill.

### Trivial
Rename, typo, copy tweak, dep bump with no API change, lockfile-only, formatting.

=> **Title only.** Empty body, or one sentence if the *why* is non-obvious from the title.

### Standard (default)
Small feature, contained bugfix, refactor with no behavior change, code is self-explanatory.

=> **1-3 bullets.** What changed, and *why* if the title doesn't already say it. Nothing else.

```
- Cache story lookups in the resolver; previous flow hit the DB twice per request.
- Closes ABC-123.
```

### Critical / hot-path / breaking / migration
Touches auth, billing, data integrity, a hot path, a public API, a schema, or anything with a real rollback story.

=> Short prose + the load-bearing facts. Include only what a reviewer cannot infer from the diff:
- What changed (1-2 lines).
- Why now / what it unblocks.
- Behavior change observable to callers or users.
- Risk + rollback or migration note.
- Links: ticket, ADR, related PRs.

Skip any section that adds nothing. A critical PR with no migration is fine — just don't write a "Migration: N/A" line.

## Hard exclusions

Never include in the body:
- "Affected files" / file lists — the diff is the file list.
- "How to test" / test-plan boilerplate — CI runs tests; reviewers read them.
- Generic checklists (`- [ ] Tests added`, `- [ ] Docs updated`) unless the repo template requires them.
- Marketing tone, emojis, words like "comprehensive", "robust", "seamless".
- AI attribution, `Co-authored-by` an AI, "Generated with...".
- Restating the diff in English.

## Decision rule

If a line in the body could be deleted without the reviewer asking a question, delete it.

## Examples

**Trivial — title only**
> `chore: bump react to 19.0.1`

**Standard**
> `ABC-456: fix modal flicker on close`
>
> - Animation was triggering on unmount because `isOpen` defaulted to `true` for one frame.
> - Initial state now derives from the prop.

**Critical**
> `ABC-789: switch session store to Redis`
>
> Moves session storage from in-memory to Redis so the API can scale horizontally.
>
> Behavior: sessions now survive process restarts; TTL unchanged (24h).
> Risk: a Redis outage logs everyone out. Fallback to in-memory is gated behind `SESSION_FALLBACK=1` for the rollout window.
> Rollback: revert + redeploy; no schema changes.
>
> Ticket: ABC-789. ADR: docs/adr/0042-session-store.md.

## Tooling notes

- GitHub: `gh pr create --base <target> --title "..." --body "$(cat <<'EOF' ... EOF)"`. Use HEREDOC so markdown survives.
- Bitbucket: `bitbucket` MCP `create_pull_request` with `title`, `description`, `sourceBranch`, `destinationBranch`.
- Do not push inside this skill — the branch must already be pushed.
- Do not run quality checks here — that belongs to `commit-push-pr`.
