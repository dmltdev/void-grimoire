## Why

void-grimoire was just refactored from 45 skills to 13 (v2.0.0), positioned as an additive library that complements `superpowers` and `impeccable`. ECC (Affaan Mustafa's 232-skill mega-plugin) contains roughly 15-20 items that fill genuine gaps in our stack coverage (Nest.js, Next.js Turbopack, Postgres, Redis, MCP server patterns, Framer Motion patterns) and a battle-tested rules reference set (TypeScript/web/common). Folding only the relevant slice in now -- before adopting openspec-driven workflow at scale -- avoids context bloat from installing all 232 skills while still capturing the high-signal content.

## What Changes

- Add new `patterns` domain to `registry.json` for stack-reference skills.
- Import 9 reference skills verbatim from ECC, flattening their `extends common/*` inheritance into self-contained files:
  - `nestjs-patterns`, `nextjs-turbopack`, `postgres-patterns`, `redis-patterns`, `mcp-server-patterns`
  - `motion-foundations`, `motion-patterns`, `motion-ui`, `motion-advanced`
- Import ECC rules verbatim into a new `void-grimoire/rules/` reference tree (`typescript/`, `web/`, `common/`), flattening the cross-file `extends` chain.
- Import 2 ECC agents: `silent-failure-hunter`, `type-design-analyzer`.
- Import 2 lightweight context-discipline skills: `token-budget-advisor`, `strategic-compact`.
- Extend `lookup-docs` skill to recognise `./openspec/specs/` as a canonical project-knowledge source alongside `./docs/`, and to skip `./openspec/changes/` by default.
- Document the `*-patterns` naming exception in `AGENTS.MD` (existing convention is `{verb}-{subject}`; reference skills are an explicit exception).
- Bump plugin version to 2.1.0 in both `plugin.json` and `marketplace.json`.

**Not imported (explicit decisions):** All ECC `/plan*`, `/prp-*`, `/feature-dev`, `/multi-*` commands (openspec + superpowers already cover); ECC's session/memory ops (claude-mem already covers); all language-specific patterns outside TS/JS; all vertical-domain skills (healthcare, networking, GAN, logistics, finance). Prisma is skipped (user moved to Drizzle). Drizzle/MongoDB skills are not in ECC and will be authored separately if needed.

## Capabilities

### New Capabilities
- `stack-reference-skills`: Stack-specific reference skills (`{topic}-patterns`) covering Nest.js, Next.js Turbopack, Postgres, Redis, MCP server patterns, and Framer Motion families. Read-on-demand, not auto-loaded.
- `rules-reference-tree`: Plugin-local `rules/` tree with verbatim ECC TypeScript/web/common rules, flattened to remove cross-file `extends` references. Read-on-demand by skills, not auto-injected.
- `openspec-aware-docs-lookup`: `lookup-docs` extension that treats `./openspec/specs/` as a first-class docs source (canonical accepted specs), and explicitly excludes `./openspec/changes/` (in-flight, contradictory).

### Modified Capabilities
(none)

## Impact

- **Files added:** ~9 skill dirs under `void-grimoire/skills/`, ~2 agent files under `void-grimoire/agents/` (if agents domain exists; otherwise creates it), ~20 rule files under `void-grimoire/rules/`.
- **Files modified:** `skills/registry.json` (new `patterns` domain + skill entries), `skills/lookup-docs/SKILL.md` (openspec-specs awareness), `AGENTS.MD` (naming-exception note + domain table update), `README.md` (skill count + new domain row), `.claude-plugin/plugin.json` + `marketplace.json` (version 2.1.0).
- **Dependencies:** None added. Skills are pure markdown; no MCP servers or runtime deps.
- **Risk:** Low. All additions are read-on-demand reference content -- no new auto-invoked behavior. Worst case: import quality is uneven and individual skills get pruned later.
- **Out-of-scope, follow-ups:** Authoring Drizzle/MongoDB patterns from scratch; deciding whether to mine ECC's session/memory ops (`harness-audit`, `cost-report`) once we evaluate overlap with claude-mem.
