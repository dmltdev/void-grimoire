---
name: docs-source-of-truth
domain: workflow
description: DDD-shaped docs-as-source-of-truth workflow for `.md`/`.mdx` docs that replaces spec-driven flows (OpenSpec, propose/apply/archive). Treats the repo as bounded contexts with a ubiquitous language; Atlas docs may sit beside it for technical repo/service/flow maps. Behavior lives in tests + Zod/typed schemas, *what the domain means* lives in `docs/domain/<context>.md(x)` + `docs/glossary.md(x)` + `docs/context-map.md(x)`, *why we chose this* lives in `docs/adr/NNNN-*.md(x)`. Use when proposing/implementing a non-trivial change, naming a concept, writing source-of-truth docs, or deciding where Atlas/domain/ADR docs belong.
depends-on: []
chains-to: null
suggests: ["lookup-docs", "grill-with-docs"]
---

<what-to-do>

The repo is organised as a set of **bounded contexts** with a **ubiquitous language**. Every change touches a context; every term means one thing inside that context. Reject spec-driven workflows (OpenSpec-style propose => apply => archive) — they double-write behavior. Default loop for any non-trivial change:

1. **Locate the bounded context.** Identify which `docs/domain/<context>.md` owns this change. If two contexts seem to own it, the boundary is wrong — surface it before coding. Cross-context interaction => `docs/context-map.md`.
2. **Read first.** Open the owning `docs/domain/<context>.md`, `docs/glossary.md`, `docs/context-map.md`, and the touched typed schemas (`@<pkg>/types`, Zod). If silent or contradicted by the request, surface the conflict before writing code.
3. **Speak the ubiquitous language.** Use the glossary's term for every domain noun in code, tests, commits, and PR text. If the request uses a synonym, normalise it to the canonical term — or add the term to `glossary.md` if it's genuinely new. Never invent parallel vocabulary.
4. **Write code + tests.** Tests use scenario-style names (`when X, then Y`) phrased in the ubiquitous language. Schemas at boundaries enforce contracts. Behavior is asserted in tests, not in prose.
5. **Update `docs/domain/<context>.md`** only if the domain shape *actually changed* — new invariant, new contract, new concept, new aggregate boundary. Delete sections that became obvious from code.
6. **Write an ADR** when a non-obvious tradeoff was made, a non-default tool/pattern was picked, a context boundary moved, or a prior decision was reversed. One decision per ADR, append-only.

Trivial fixes (typo, single-line bug, comment, formatting, dep bump) need no doc touch. Throwaway exploration goes in `docs/brainstorms/`, not `docs/domain/`.

**Resolve deviations before documenting.** If implementation and a doc disagree, raise it — do not silently rewrite the doc to match the code or vice versa.

</what-to-do>

<supporting-info>

## DDD framing

This is light **Domain-Driven Design** applied to documentation:

- **Ubiquitous language** (`glossary.md`) — one term, one definition. Code, tests, docs, commits all speak it. No synonyms, no parallel vocabulary.
- **Bounded contexts** (`domain/<context>.md`) — each context owns its concepts, invariants, and contracts. A term can mean different things in different contexts, but only if both contexts list it explicitly.
- **Context map** (`context-map.md`) — how contexts talk: upstream/downstream, anti-corruption layers, shared kernels, published languages. Cross-context interaction is documented here, never duplicated inside a single context doc.
- **Atlas** (`atlas/`) — technical repo/service/flow map. Atlas owns cross-repo runtime relationships and public surfaces; context maps own bounded-context relationships.
- **Aggregates and invariants** — captured as invariant bullets in the context doc; enforced by tests and Zod schemas. Not as prose narratives.

The docs are the *strategic* DDD layer (language, boundaries, contracts). The code is the *tactical* layer (entities, value objects, aggregates). Tactical patterns belong in code; if a tactical choice is non-obvious, it's an ADR.

## Why this replaces OpenSpec / spec-driven flows

Spec-driven workflows (write spec => propose change => apply => archive) double-write behavior: once in prose, once in code. The prose rots. Tests are the executable spec; Zod schemas are the executable contract. Docs only carry what code can't: the *meaning* of domain nouns, the *shape* of bounded contexts, and the *why* behind non-obvious decisions.

If asked to "propose a change", "add to openspec", or open a `specs/` / `openspec/` workflow, redirect to this loop. Existing `openspec/` trees are deprecated, read-only references — never add to them.

## Layout

```
docs/
├── README.md              ← the rules below, restated for the repo
├── product-brief.md       ← vision, narrative, non-goals; topics not yet carved into a domain doc
├── atlas/                 ← OPTIONAL: technical repo/service/flow maps
│   ├── repos/<repo>.md    ← repo inventory, public surfaces, dependencies
│   └── flows/<flow>.md    ← cross-repo runtime flows with evidence anchors
├── glossary.md            ← ubiquitous language; one term, one definition
├── context-map.md         ← bounded contexts and how they communicate
├── domain/<context>.md    ← per-context behavior, invariants, contracts
├── patterns/<name>.md     ← OPTIONAL: cross-context structural patterns (≥ 2 contexts)
├── adr/NNNN-*.md          ← append-only decision log (Nygard format)
├── research/              ← Atlas research notes: exploratory findings, uncertain traces, evidence ledgers
├── brainstorms/           ← throwaway ideation, not source of truth
├── references/            ← imported external docs, not authored here
└── sessions/              ← session journals, not source of truth
```

## Where things go (decision table)

| Capturing... | Goes in... |
|---|---|
| Technical repo/service inventory | `atlas/repos/<repo>.md` |
| Cross-repo runtime flow | `atlas/flows/<flow>.md` |
| Exploratory Atlas findings, uncertain traces, evidence ledgers | `research/<date>-<topic>.md` |
| A domain noun's meaning | `glossary.md` |
| How two contexts talk | `context-map.md` |
| A context's behavior, invariants, contracts | `domain/<context>.md` |
| A reusable structural choice used by ≥ 2 contexts | `patterns/<name>.md` + establishing ADR (optional slot) |
| A tradeoff, reversal, or non-obvious choice | `adr/NNNN-title.md` |
| Long-form vision / narrative | `product-brief.md` |
| Throwaway ideation | `brainstorms/` |
| Executable assertion / "SHALL" / scenario | a test (Vitest/Playwright) — never a doc |
| Contract shape | a Zod schema in `@<pkg>/types` — never a doc |

## Rules (load-bearing)

1. **Concise.** Cut anything a reader can infer from code, tests, or schemas. Empty sections are noise — delete them.
2. **No SHALL/MUST scenarios in docs.** Executable assertions belong in tests with scenario-style names and in Zod schemas.
3. **Descriptive, not prescriptive.** Update docs on behavior change, not before. Docs follow code; they don't precede it.
4. **Resolve deviations before documenting.** If impl and doc disagree, raise it. Do not silently rewrite either.
5. **Decisions => ADR.** New tradeoff or reversal => new ADR. Don't rewrite history in domain docs.
6. **Delete on supersede.** When a topic moves from `product-brief.md` into `docs/domain/<context>.md`, delete the brief section in the same change. No "moved to X" pointers. Two docs are never both authoritative for the same topic.
7. **`AGENTS.MD` / `CLAUDE.MD` are tracked.** Committed in the same change that motivates the edit. Never gitignored. Drift between local and committed is a defect.
8. **Markdown or MDX.** Use `.md` by default. Use `.mdx` only when the target docs workspace already renders MDX or the user asks. MDX must remain readable as Markdown.

## Domain doc shape

See [DOMAIN-FORMAT.md](./DOMAIN-FORMAT.md). Skip any section with nothing to say.

## Pattern shape and rules (optional)

See [PATTERN-FORMAT.md](./PATTERN-FORMAT.md). Only adopt when ≥ 2 contexts have independently grown the same structural choice. Requires an establishing ADR.

## ADR shape and rules

See [ADR-FORMAT.md](./ADR-FORMAT.md). Append-only. Never edit a shipped ADR's Decision or Consequences — write a new ADR that supersedes it.

Record an ADR when **all three** hold:

1. **Hard to reverse** — the cost of changing your mind later is meaningful.
2. **Surprising without context** — a future reader will ask "why did they do it this way?"
3. **Real tradeoff** — there were genuine alternatives and one was picked for specific reasons.

If any of the three is missing, skip the ADR.

## Anti-patterns to refuse

- Writing a "spec" before code. The tests are the spec.
- Adding `SHALL` / `MUST` bullets to domain docs.
- Restating a Zod schema in prose. Link to the schema.
- "Moved to X" pointers across two docs. Delete the old section.
- Editing a shipped ADR's Decision. Supersede with a new ADR.
- Documenting trivial fixes.
- Adding to a deprecated `openspec/` or `specs/` tree.
- Inventing a synonym for a glossary term instead of reusing it.
- One concept owned by two context docs. Pick an owner or split the boundary.
- Cross-context details duplicated inside a single context doc instead of being captured in `context-map.md`.
- Duplicating Atlas facts inside domain docs instead of linking to the Atlas.
- Using MDX-only components for source-of-truth docs when Markdown would work.

</supporting-info>
