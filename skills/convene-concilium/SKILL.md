---
name: convene-concilium
domain: concilium
description: Use when you want a multi-lens quality review of a change — convenes four specialized reviewer agents in parallel and returns one merged, severity-ranked, non-blocking report
depends-on: []
chains-to: null
suggests: []
user-invokable: true
args:
  - name: scope
    description: What to review — a path/glob, "staged", or "worktree". Defaults to the staged diff.
    required: false
---

# Convene the Concilium

Run a pragmatic, multi-lens quality review by convening four specialized reviewer agents over one change scope, then merge their findings into a single report. The concilium **advises and ranks by severity; it does not gate on taste.** Only CRITICAL blocks.

**Announce at start:** "Convening the concilium over <scope>."

## Step 1 — Resolve scope

- No argument => the **staged diff** (`git diff --staged --stat` to confirm there is content).
- `worktree` => `git diff` (unstaged + staged).
- A path/glob => those files.
- **Empty-scope short-circuit:** if there is no reviewable code change, report "No findings — nothing to review" and stop. Do not dispatch agents needlessly.

## Step 2 — Dispatch four lenses in parallel

In a single message, dispatch all four as subagents (Task tool), passing each the scope and the absolute path to `skills/convene-concilium/quality-dimensions.md`:

- `dev-in-test` — correctness, edge cases, silent failures, tests
- `dev-in-security` — secrets, injection, authz, unsafe sinks, deps
- `dev-in-maintainability` — readability, types, docs, code-standards
- `dev-in-scalability` — hot paths, data access, resource/cost, concurrency

They run concurrently and return findings only — none of them edit files.

## Step 3 — Merge

- **Dedupe** by `location + issue-class`. If two lenses flag the same line for the same reason, keep one entry and record both source lenses.
- **Tag** each surviving finding with its source lens.
- Apply the shared **severity tiers** (CRITICAL / WARN / FYI) and the **>80% confidence gate** from `quality-dimensions.md`. Drop anything below the gate. Consolidate repeated issue-classes.

## Step 4 — Report

```
## Concilium report — <scope>

Verdict: <NOT READY | SHIPPABLE with advisory notes | APPROVE>

### CRITICAL (blocking)
- file:line · [lens] · failure mode · fix direction        (omit section if none)

### WARN (advisory)
- file:line · [lens] · issue · fix direction               (omit if none)

### FYI
- file:line · [lens] · note                                (omit if none)
```

Verdict rule: any CRITICAL => **NOT READY**, name the blockers. Only WARN/FYI => **SHIPPABLE with advisory notes** (never tell the user to halt). Nothing above the gate => **APPROVE**, zero rows.

## Honesty note

The concilium makes the quality *bar* explicit and enforces it in one pass instead of 5-10 manual prompts. It does **not** fix LLM sycophancy — four reviewers reading LLM-written code can still share a blind spot and miss a real bug. The evidence-anchored check that catches "incorrect work that passes review" is the `verify-and-correct` cycle (sibling capability), which runs the tests and cites the output rather than judging by reading. Use the concilium for breadth; use `verify-and-correct` for proof.
