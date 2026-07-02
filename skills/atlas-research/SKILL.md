---
name: atlas-research
description: Use when researching or documenting one or more codebases into source-of-truth docs, especially cross-repo architecture views, repo/service maps, UI-BFF-API-shared-lib flows, public surfaces, global docs workspaces, or Atlas docs.
---

# Atlas Research

## Core rule

Build an evidence-backed **Atlas** before deep prose. The Atlas owns technical repo/service/flow maps. Domain docs own business language, invariants, and contracts. Use `docs-source-of-truth` for glossary, context-map, domain docs, and ADR rules.

## Start contract

Infer from prompt, repo rules, and existing docs. Ask only if a stop condition applies.

| Field | Default |
|---|---|
| Scope | Named repos/paths only |
| Mode | `global`, `per-repo`, or `both` |
| Docs root | Explicit docs path, existing docs workspace, or ask |
| Write mode | Direct docs when target is explicit; inline research report or explicit temporary path when ambiguous |
| Deep traces | Named flows/domains only |
| Single-repo internal docs | Existing repo docs root, usually `<repo>/docs`; create lazily only when writing resolved facts |
| Later global reuse | Record as a global-doc candidate, not current global authority |

Stop and ask when:
1. No docs destination exists for global/multi-repo scope.
2. Docs, code, and user statements conflict on a claim to write.
3. A domain term or bounded-context boundary is ambiguous.
4. Permanent docs would assert intent not evidenced by code/docs.
5. Destructive doc deletion/replacement is needed.

If the prompt names a docs path but inspection does not show it owns global docs, ask before writing global Atlas docs there. If no global destination exists, write no files unless the user gives an explicit temporary output path; deliver a read-only inline research report when the user asked only for analysis.

## Authority model

| Fact type | Owner |
|---|---|
| Cross-repo relationships, repo roles, runtime flows, public surfaces | Global Atlas |
| Repo-local domain language, standards, invariants, ADRs | Per-repo docs |
| Bounded-context relationships | `docs/context-map.md` or `.mdx` |
| Business terms | `docs/glossary.md` or existing `CONTEXT.md` |
| Exploratory findings and uncertain traces | `docs/research/<date>-<topic>.md` only inside an explicit docs root; otherwise inline report or user-provided temp path |

Never make one service repo the source of truth for the whole system. If global scope is clear but no destination is provided, ask where the global docs workspace lives.

## Research waves

1. Classify repos and existing docs: README, docs, package manifests, routes/modules, public APIs, tests.
2. Build per-repo Atlas inventory in parallel.
3. Trace only selected cross-repo flows: UI -> BFF/API -> shared lib -> data/external systems.
4. Write verified docs; put uncertain claims in Open questions or research notes.

For “whole architecture” requests with no priority flow, finish Wave 1 inventory first, then ask which flow/domain to trace next.

Use subagents for multi-repo work. Give each worker one repo/path and require read-only evidence anchors. See `references/worker-prompt.md`.

## Evidence rules

- Every non-obvious Atlas claim needs a source anchor: repo/path/symbol/line or observed command output.
- Domain docs stay implementation-free. Keep source anchors in Atlas docs, research notes, or PR summary.
- Unsupported claims go under `Open questions`, not permanent prose.
- Conflicts stop affected docs until resolved. Continue unrelated docs.
- Unknown ownership stays `Unknown`; never infer owner/team/status.

## Atlas docs

Default to Markdown. Use MDX only when the target workspace already renders MDX or the user asks. MDX must remain Markdown-readable. Do not use custom React components unless an MDX helper skill or workspace docs define them.

Default structure:

```text
docs/
  atlas/
    repos/<repo>.md
    flows/<flow>.md
  glossary.md
  context-map.md
  domain/<context>.md
  adr/NNNN-*.md
  research/<date>-<topic>.md
```

Use `.mdx` in place of `.md` only when selected by the target workspace.

Repeatable inventory sections may use section markers:

```md
<!-- atlas:generated:start public-surfaces -->
...
<!-- atlas:generated:end public-surfaces -->
```

Patch generated sections in place. Preserve human-written prose unless contradicted. Do not regenerate a docs tree blindly.

Full repo/flow templates: `references/atlas-format.md`.

## Public surface definition

Include:
- HTTP routes/controllers/API handlers
- exported packages/modules/types
- CLI commands
- jobs/workers/queues
- events/topics/webhooks
- owned DB schemas
- env/config keys that define integration boundaries

Exclude private helpers, internal unrouted components, and test-only utilities.

## Diagrams

Add diagrams only when requested or clearly useful. Prefer Markdown-readable diagrams: tables, indented flows, or compact lists. Mermaid is not default.

## ADR policy

Do not create ADRs for discovered facts. Offer an ADR only for hard-to-reverse, non-obvious tradeoffs: docs authority, context boundary shifts, source-of-truth moves, or unusual tooling conventions.

## Final report shape

Report exactly:
- Mode and docs destination used
- Repos analyzed
- Docs changed, research report path, or inline research report with no file path
- Evidence exceptions
- Conflicts
- Open questions
- Recommended next flow/domain to trace

## Common mistakes

| Mistake | Correction |
|---|---|
| Create `docs/` in one service repo for global architecture | Ask for global docs workspace or write a research report |
| Treat UI/API/shared lib as domain contexts | Model them as Atlas layers; domain contexts are business capabilities |
| Use Mermaid/MDX components by default | Use Markdown-readable docs unless requested/useful |
| Put source anchors in domain docs | Keep domain docs clean; anchor Atlas/research notes |
| Create ADRs for observations | ADRs record decisions, not facts |
| Define terms from implementation names alone | Propose candidate terms; ask before canonicalizing ambiguous terms |
