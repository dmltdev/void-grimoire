# Domain Doc Format

One file per bounded context at `docs/domain/<context>.md`. Describes *what the domain means and how it behaves*, not how it's implemented.

## Shape

```markdown
# <Context Name>

One-sentence purpose.

## Concepts
- **Term** — definition. Link to `../glossary.md` if cross-context.

## Invariants
- Bullet list of things that must always hold. No prose.

## Behavior
- Inputs => outputs. Key state transitions. Failure modes that matter.

## Contracts
- Public surface (HTTP routes, queue topics, exported functions). Link to Zod schemas in `@<pkg>/types`.

## Open questions
- Things not yet decided. Delete when resolved.
```

## Rules

- Skip any section with nothing to say. Empty sections are noise.
- If a section can be replaced by "read the Zod schema" or "read the test names", delete it.
- Cross-context interactions belong in `../context-map.md`, not duplicated here.
- Decisions and tradeoffs go in `../adr/`, not here.
- No `SHALL` / `MUST` / acceptance-criteria bullets. Those are tests.
