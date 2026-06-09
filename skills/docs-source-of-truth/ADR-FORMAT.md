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

## Cross-links

How this decision sits in the broader docs graph. Omit any line with nothing to say; delete the whole section if all four are empty.

- **Supersedes:** ADR-NNNN (and update that ADR's status in the same change)
- **Honors:** glossary terms, invariants, or prior ADRs this decision depends on. Format: `glossary:term`, `domain/<context>#invariant-slug`, `adr/NNNN`.
- **Constrains:** future decisions or contexts this one narrows. Format as above.
- **Defines:** new glossary term(s) or invariant(s) this ADR introduces. Add them to `glossary.md` / the owning `domain/<context>.md` in the same change; this line is the back-reference.

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
- **Cross-links are append-only too.** When a later ADR supersedes this one, append a line to its `Supersedes:` and update this ADR's status — never rewrite the body. Dangling refs (`adr/0099` that doesn't exist, `glossary:foo` not in the glossary) are a defect; fix on the same change that introduced them.

## When to write one

All three must hold:

1. **Hard to reverse** — meaningful cost to change later.
2. **Surprising without context** — a future reader will ask why.
3. **Real tradeoff** — genuine alternatives existed.

If any is missing, skip the ADR.
