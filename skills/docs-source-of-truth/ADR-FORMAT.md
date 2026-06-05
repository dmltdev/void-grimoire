# ADR Format

Append-only log of non-obvious technical decisions at `docs/adr/NNNN-kebab-title.md`. Michael Nygard format.

## Template

```markdown
# NNNN. <Short title in title case>

- **Status:** Proposed | Accepted | Superseded by NNNN | Deprecated
- **Date:** YYYY-MM-DD
- **Deciders:** <names or roles>

## Context

What is the issue motivating this decision? Constraints, forces, observations. Facts, no editorial.

## Decision

What we are doing. One sentence is ideal. Active voice. No hedging.

## Consequences

What becomes easier, what becomes harder, what we lock ourselves into. Positive, negative, neutral — honest.

## Alternatives considered

- **Option A** — why rejected.
- **Option B** — why rejected.

## References

- Links to PRs, issues, prior ADRs, external docs.
```

## Rules

- One decision per ADR. Numbered sequentially.
- **Never edit a shipped ADR's Decision or Consequences.** If the decision changes, write a new ADR with `Status: Supersedes NNNN` and update the old ADR's status to `Superseded by MMMM`.
- Status values: `Proposed` | `Accepted` | `Superseded by NNNN` | `Deprecated`.
- Keep each ADR under ~1 page. Link out instead of restating context.
- Update `docs/adr/README.md` index when adding an ADR.

## When to write one

All three must hold:

1. **Hard to reverse** — meaningful cost to change later.
2. **Surprising without context** — a future reader will ask why.
3. **Real tradeoff** — genuine alternatives existed.

If any is missing, skip the ADR.
