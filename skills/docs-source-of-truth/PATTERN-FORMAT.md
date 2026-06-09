# Pattern Format

**Optional slot.** Only adopt when ≥ 2 contexts have independently grown the same structural choice. Empty conventions rot — do not pre-create `docs/patterns/` before the second adopter exists.

Holds reusable structural choices that span multiple bounded contexts — things that aren't a single decision (ADR), aren't a domain concept (glossary/domain doc), and aren't behavior (tests).

Earns a doc:
- "Saga for cross-aggregate writes spanning checkout + billing"
- "Outbox table for at-least-once event publish"
- "Anti-corruption layer between `legacy-crm` and `accounts`"
- "Idempotency-key header on all mutating public endpoints"

Does **not** earn a doc:
- Tactical patterns (repository, factory) — live in code.
- Tool choices (Zustand, pnpm) — one-line ADR + glossary term.
- Single-context patterns — live in that context's domain doc.

## Location

`docs/patterns/<kebab-name>.md`

## Template

```markdown
# <Pattern name>

- **Status:** Active | Deprecated by adr/NNNN
- **Applies in:** <context>, <context>

## Problem

The recurring shape this pattern addresses. One paragraph.

## Solution

The structural choice. Diagrams or pseudo-code only if they earn their place.
Link to one canonical implementation in the repo.

## Invariants

- Bullets the pattern preserves. Link to `domain/<context>#invariant-slug`
  where they actually live — do not restate them here.

## When not to use

Cases where this pattern is the wrong tool. Without this section,
the doc is a recommendation, not a constraint.

## Cross-links

- **Established by:** adr/NNNN
- **Honors:** glossary terms / invariants it depends on
- **Used by:** domain/<context>, domain/<context>
```

## Rules (load-bearing)

1. **Requires an establishing ADR.** No ADR => no pattern doc. ADR captures *why we adopted it*; pattern doc captures *what it is and where it lives*.
2. **One canonical implementation, linked.** No real instance in the repo => aspirational => `brainstorms/`, not `patterns/`.
3. **`When not to use` is mandatory.** A pattern without a named anti-context is a style preference — move it to AGENTS.MD.
4. **≥ 2 contexts to earn the slot.** Single-context patterns belong in that context's domain doc. Promote on the second adopter, in the same PR that adds the second use.
5. **Deprecation via ADR.** Pattern retires when a superseding ADR flips its status. Body stays frozen; only `Status` changes.
6. **Cross-links are append-only**, same discipline as ADRs. Dangling refs are defects.
