## Context

void-grimoire v2.0.0 (just shipped) is a 13-skill additive library. The user mined ECC (232 skills) for content gaps and identified ~20 items worth folding in: stack-reference skills (Nest.js, Next.js Turbopack, Postgres, Redis, MCP server patterns, Framer Motion family), a TS/web rules tree, two niche review agents, and two context-discipline skills. Most of ECC was rejected (vertical-domain skills, duplicate workflow skills already covered by superpowers/openspec, language-specific patterns outside TS).

Separately, the user adopted openspec for spec-driven development. Accepted specs live at `./openspec/specs/`, in-flight changes at `./openspec/changes/<name>/`. This creates a new canonical knowledge surface that `lookup-docs` should recognise.

Stakeholders: user (sole maintainer), downstream consumers of the void-grimoire plugin marketplace entry.

## Goals / Non-Goals

**Goals:**
- Fold the high-signal ECC slice into void-grimoire without re-introducing the bloat the v2.0.0 refactor removed.
- Establish a `patterns` domain for read-on-demand stack reference content.
- Keep all new content additive: nothing auto-injects, nothing duplicates existing skills.
- Make `lookup-docs` openspec-aware so accepted specs become first-class project knowledge.

**Non-Goals:**
- Authoring Drizzle/MongoDB pattern skills (not in ECC; deferred to a separate change).
- Mining ECC's session/memory ops (`harness-audit`, `cost-report`, `instinct-*`) — overlap with claude-mem unevaluated.
- Mining vertical-domain skills (healthcare, networking, GAN, logistics, finance).
- Importing any ECC commands or hooks. Skills + rules + agents only.
- Re-introducing the three-gate flow, `.void-grimoire/` config, or auto-injection hooks that v2.0.0 removed.

## Decisions

### D1: New `patterns` domain, not extending `codebase`

Stack-reference skills (`nestjs-patterns`, `nextjs-turbopack`, `postgres-patterns`, `redis-patterns`, `mcp-server-patterns`, `motion-*`) describe runtime patterns and idioms, not codebase topology. The `codebase` domain is currently about service maps and dependency graphs. Mixing them muddies routing.

**Alternative considered:** Stuff them into existing `docs` domain. Rejected — `docs` is about lookup mechanics (qmd, indexing), not content.

**Alternative considered:** No domain, just list under existing ones. Rejected — `route-request` keys off domains; ungrouped skills wouldn't get routed.

### D2: Verbatim import of ECC rules, flatten `extends` chain

ECC rules use `> This file extends ../common/<topic>.md` as a documented dependency. void-grimoire skills are read on-demand and should be self-contained; chasing a cross-file chain mid-skill-execution wastes tokens.

**Resolution:** For each language-specific rule file (`typescript/*.md`, `web/*.md`), concatenate the matching `common/*.md` content inline at the top, drop the `> extends` line, and keep `common/*.md` as standalone files too (some skills will reference common-only).

**Alternative considered:** Preserve `extends` chain and let skills follow it. Rejected — adds runtime indirection for zero benefit; rule files are short enough to flatten.

### D3: `*-patterns` naming exception, documented in AGENTS.MD

Current convention is `{verb}-{subject}` (`lookup-docs`, `enforce-git-safety`). The new reference skills are nouns (`nestjs-patterns`). Renaming to `reference-nestjs` etc. loses the recognisable `*-patterns` idiom that maps to how users think about stack docs.

**Resolution:** Accept `*-patterns` as an explicit exception for reference skills. Document the exception in `AGENTS.MD` under "Skill Conventions". The `{verb}-{subject}` rule still applies to workflow/action skills.

**Alternative considered:** Rename all on import. Rejected — breaks recognition for anyone migrating from ECC; loses idiom.

### D4: `lookup-docs` adds `./openspec/specs/` as first-class source, skips `./openspec/changes/`

Accepted specs are canonical post-`/opsx:apply`. In-flight `changes/` directories contain proposal/design/tasks that may contradict accepted specs and are transient.

**Resolution:** Update `lookup-docs/SKILL.md` to scan `./openspec/specs/**/*.md` alongside `./docs/**`. Explicitly exclude `./openspec/changes/**` from default lookup. Surface `changes/` content only when the user is actively working on that change (caller passes change name).

**Alternative considered:** Index everything under `./openspec/`. Rejected — proposals contradict accepted specs and will confuse lookup.

**Alternative considered:** Wait until qmd config supports openspec natively. Rejected — adds external dependency; lookup-docs can scan paths directly.

### D5: Agents domain decision

void-grimoire currently has no `agents` domain (no agents at all). Adding `silent-failure-hunter` and `type-design-analyzer` creates one.

**Resolution:** Add a single `agents` directory with the two agent files. Do NOT add an `agents` domain to `registry.json` — agents are invoked via Task tool with subagent_type, not via skill routing. Document the agents in README under a new "Agents" section.

**Alternative considered:** Skip agents entirely. Rejected — both fill genuine gaps (silent failure mode hunting; TS type-design review) that existing review skills don't cover.

### D6: Version bump to 2.1.0 (minor)

Additive content, no breaking changes, no removals. Minor bump per semver.

## Risks / Trade-offs

- **[Risk]** ECC rules content may have ECC-specific assumptions (paths, tool refs) that break in void-grimoire. → **Mitigation:** Scan each imported file post-flatten for `ECC`, `ecc-tools`, hardcoded paths; rewrite or drop those lines.
- **[Risk]** Stack-reference skills duplicate official docs and rot fast. → **Mitigation:** Each skill should link to the canonical upstream docs at top; treat the imported content as opinionated starter notes, not a doc replica.
- **[Risk]** Motion skills (4 of them) may overlap with impeccable's `animate` skill. → **Mitigation:** Document in each motion skill's description that it covers patterns (Framer Motion code); impeccable's `animate` covers principles. They coexist.
- **[Risk]** `lookup-docs` scanning `./openspec/specs/` adds latency in large projects. → **Mitigation:** Specs trees are small (~kilobytes per spec); negligible cost. If qmd is configured, route through it instead of raw glob.
- **[Trade-off]** Keeping `*-patterns` naming exception undermines the `{verb}-{subject}` convention. → Accepted; documented in AGENTS.MD so future skill authors understand the boundary.
- **[Trade-off]** Flattening `extends` chain duplicates content. → Accepted; files are short and read-on-demand. Maintenance cost is low.

## Migration Plan

Not applicable. Pure additive change. No data migration, no user-facing API changes, no rollback complexity beyond `git revert`.

## Open Questions

1. Should the `patterns` domain include trigger keywords for routing, or is it purely a reference container? Lean toward including triggers (`nestjs`, `next.js`, `postgres`, `redis`, `mcp`, `framer-motion`, `motion`) so `route-request` surfaces patterns when relevant.
2. Do we add `mongodb-patterns` and `drizzle-patterns` stubs in this change (author from scratch) or defer to a follow-up? Lean toward defer — keep this change scoped to ECC mining.
3. Should `lookup-docs` openspec awareness be opt-in (via config) or default-on? Lean toward default-on; user adopted openspec workspace-wide.
