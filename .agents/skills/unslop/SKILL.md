---
name: unslop
description: Use when removing AI-generated code slop from a branch diff, cleaning over-defensive or over-abstracted changes before review, or recording recurring slop patterns as repo agent instructions.
---

# unslop

Remove AI code slop while preserving intended behavior.

## Core contract

Check the diff against the target branch, remove AI-generated slop introduced by the current branch, and save only repeatable lessons as repo agent instructions. This is a cleanup pass, not a feature pass.

## When to use

Use this skill when:

- the user invokes `/unslop`, `deslop`, `stop slop`, `anti-slop`, or `remove AI slop`
- a branch is nearly ready for commit, PR, or review and feels noisy, defensive, over-explained, repetitive, or over-abstracted
- generated implementation work left unnecessary comments, wrappers, casts, fallback paths, broad error handling, or weak tests
- the user rejects output as "slop" and wants the pattern prevented next time

Do not use this skill for:

- new feature delivery
- broad architecture rewrites
- prose-only voice edits
- UI redesign; use `unslop-design` for product screens
- long-running orchestration control-plane work

## Workflow

1. Determine the review surface.
   - If the user names files, inspect only those files and their local context.
   - Otherwise compare the current branch against the default base branch, usually `main`.
   - Include unstaged and staged changes when present.
2. Read local style before editing.
   - Inspect nearby code in each changed file.
   - Prefer the file's existing conventions over generic cleanup advice.
   - Treat unusual surrounding style as the local rule unless it is clearly broken.
3. Mark slop candidates.
   - Slop is code that looks generated, speculative, over-defensive, over-abstracted, or inconsistent with surrounding code.
   - A candidate is actionable only when it was introduced by this branch or is directly touched by the branch.
4. Edit narrowly.
   - Remove or simplify the slop.
   - Keep behavior unchanged unless fixing a clear bug discovered during cleanup.
   - Prefer deleting unnecessary machinery over renaming or restyling it.
5. Verify the affected behavior.
   - Run the narrowest test, typecheck, lint, or command that covers the edited files.
   - If no runnable check exists, do a final diff review and state that no executable check was available.
6. Persist only recurring patterns.
   - If the cleanup reveals a pattern likely to recur, save one rule in the repo's agent instruction file.

## Focus areas

Remove or simplify:

- extra comments that restate code, narrate obvious intent, or differ from local comment style
- defensive checks, null guards, retries, fallbacks, or `try`/`catch` blocks on trusted paths
- casts to `any`, `unknown`, double-casts, or non-null assertions used only to silence type errors
- deep nesting that should be early returns, guard clauses, or existing helper calls
- generic helper functions, service wrappers, adapters, factories, or config layers with one caller
- speculative options, extension points, feature flags, telemetry, logging, or validation not requested by the task
- duplicated logic created instead of using an existing local helper
- broad catch-all error messages that hide the real failure
- placeholder tests, over-mocked tests, snapshots without behavioral value, or assertions on implementation details
- generated prose in docs, comments, PR text, commits, or test names that does not match the repo voice
- formatting churn unrelated to the slop cleanup

## Guardrails

- Keep behavior unchanged unless fixing a clear bug.
- Prefer minimal, focused edits over broad rewrites.
- Do not convert code to a personal style preference.
- Do not delete unusual code until local context proves it is unnecessary.
- Do not add abstractions while removing abstractions.
- Do not replace real implementation with mocks, stubs, or TODOs.
- Do not suppress tests, type errors, lint errors, or runtime errors to make cleanup pass.
- Do not create compatibility aliases or shims for removed slop.
- Keep the final summary concise: changed files plus verification.

## Agent-instruction memory

Save recurring slop patterns as agent instructions.

Destination precedence:

1. If the user names a destination, write exactly there.
2. If the repo has an existing `AGENTS.md` or `agents.md`, use that file.
3. If the repo has no agent file but has `CLAUDE.md` or `claude.md`, use that file.
4. If none exist, create root `AGENTS.md` by default.

Write one imperative bullet under the most relevant existing heading. If no heading fits, create `## Code quality` and add the bullet there.

Rule shape:

```markdown
- Remove generated defensive wrappers on trusted internal paths instead of adding fallback behavior.
```

Do not add dates, source labels, run IDs, snippets, or catalogs. The rule must be small enough that future agents will obey it.

Ask one question before saving only when the rule would encode a subjective preference not proven by the repo or the user correction.

## Output contract

Return:

- files changed
- slop removed, grouped by pattern
- agent-instruction rule added, or `none`
- verification command or explicit reason no executable check was available

## Verification gate

Before completion, prove:

1. The final diff contains no unrelated formatting churn.
2. Behavior-affecting edits have a relevant executable check, or the missing check is stated.
3. Any added agent instruction is in `AGENTS.md`/`agents.md` first, then `CLAUDE.md`/`claude.md` only when no agent file exists.
