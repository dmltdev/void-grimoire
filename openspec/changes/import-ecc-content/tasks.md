## 1. Prep

- [ ] 1.1 Create branch `feat/import-ecc-content` off `main`
- [ ] 1.2 Skim `ECC/skills/{nestjs-patterns,nextjs-turbopack,postgres-patterns,redis-patterns,mcp-server-patterns,motion-foundations,motion-patterns,motion-ui,motion-advanced}/` and confirm each has usable content (drop the import if a skill is empty or stub-only)
- [ ] 1.3 Skim `ECC/rules/{typescript,web,common}/*.md` and confirm content quality before bulk import
- [ ] 1.4 Decide final answer on Open Question 1 (patterns-domain triggers — recommend default-on with the listed keyword set)

## 2. Rules tree import

- [ ] 2.1 Create `void-grimoire/rules/{typescript,web,common}/` directories
- [ ] 2.2 Copy all 10 `ECC/rules/common/*.md` files verbatim into `void-grimoire/rules/common/`
- [ ] 2.3 For each `ECC/rules/typescript/*.md`: copy file, inline the referenced `../common/<topic>.md` content at the top, remove the `> This file extends` line
- [ ] 2.4 For each `ECC/rules/web/*.md`: copy file, inline the referenced `../common/<topic>.md` content at the top, remove the `> This file extends` line
- [ ] 2.5 Sweep all imported rule files: `grep -rE 'ecc-tools|/ECC/|affaan-m' void-grimoire/rules/` MUST return zero matches; rewrite or drop any lines that hit
- [ ] 2.6 Verify count: `find void-grimoire/rules -name '*.md' | wc -l` >= 22

## 3. Stack-reference skills import

- [ ] 3.1 Create skill directories under `void-grimoire/skills/` for `nestjs-patterns`, `nextjs-turbopack`, `postgres-patterns`, `redis-patterns`, `mcp-server-patterns`, `motion-foundations`, `motion-patterns`, `motion-ui`, `motion-advanced`
- [ ] 3.2 For each, copy the ECC SKILL.md body, rewrite the frontmatter to void-grimoire's contract (`name`, `domain: patterns`, `description`, `depends-on: []`, `chains-to: null`, `suggests: []`)
- [ ] 3.3 Prepend each skill's body with the canonical upstream docs URL (NestJS docs, Next.js docs, Postgres docs, Redis docs, MCP spec, Framer Motion docs)
- [ ] 3.4 Set motion-* skill descriptions to explicitly mention Framer Motion code patterns to disambiguate from impeccable's `animate`
- [ ] 3.5 Sweep all imported skills: `grep -rE 'ecc-tools|/ECC/|affaan-m' void-grimoire/skills/{nestjs-patterns,nextjs-turbopack,postgres-patterns,redis-patterns,mcp-server-patterns,motion-foundations,motion-patterns,motion-ui,motion-advanced}/` MUST return zero matches

## 4. Registry + routing

- [ ] 4.1 Add `domains.patterns` to `void-grimoire/skills/registry.json` with `description`, `triggers` (`nestjs`, `nest.js`, `nextjs`, `next.js`, `turbopack`, `postgres`, `postgresql`, `redis`, `mcp`, `framer-motion`, `motion`, `animation`), `skills` (all nine names), and empty `docs` array
- [ ] 4.2 Verify `route-request` matches `patterns` domain for a query containing `nestjs` (manual smoke test)

## 5. Context-discipline skills import

- [ ] 5.1 Import `token-budget-advisor` into `void-grimoire/skills/token-budget-advisor/SKILL.md` with rewritten frontmatter (domain: `void-grimoire`)
- [ ] 5.2 Import `strategic-compact` into `void-grimoire/skills/strategic-compact/SKILL.md` with rewritten frontmatter (domain: `void-grimoire`)
- [ ] 5.3 Add both skill names to the `void-grimoire` domain's `skills` array in `registry.json`

## 6. Agents import

- [ ] 6.1 Create `void-grimoire/agents/` directory
- [ ] 6.2 Copy `ECC/agents/silent-failure-hunter.md` into `void-grimoire/agents/silent-failure-hunter.md`, rewrite any ECC-specific frontmatter/tool refs
- [ ] 6.3 Copy `ECC/agents/type-design-analyzer.md` into `void-grimoire/agents/type-design-analyzer.md`, rewrite any ECC-specific frontmatter/tool refs
- [ ] 6.4 Update `void-grimoire/.claude-plugin/plugin.json` to declare `"agents": ["./agents/"]` if not already present

## 7. lookup-docs openspec awareness

- [ ] 7.1 Update `void-grimoire/skills/lookup-docs/SKILL.md` body to document `./openspec/specs/` as a scanned source
- [ ] 7.2 Add explicit instruction that `./openspec/changes/` is excluded by default and only included when a change-name is passed
- [ ] 7.3 Add a step that prefers qmd routing when an `openspec`/`specs` collection is configured
- [ ] 7.4 Add provenance labelling for spec results (`openspec:specs/<capability>`)
- [ ] 7.5 Sanity check: simulate a project without `./openspec/` to confirm skill body handles the absent-directory case gracefully

## 8. Documentation

- [ ] 8.1 Update `AGENTS.MD`: add `*-patterns` naming-exception paragraph under "Skill Conventions"
- [ ] 8.2 Update `AGENTS.MD` domain table: add `patterns` domain row
- [ ] 8.3 Update `void-grimoire/README.md` skill count to reflect new totals (13 + 9 patterns + 2 context = 24 skills)
- [ ] 8.4 Update `void-grimoire/README.md` to add a `patterns` domain row in the domain table
- [ ] 8.5 Update `void-grimoire/README.md` to add a new "Agents" section listing `silent-failure-hunter` and `type-design-analyzer`
- [ ] 8.6 Update `void-grimoire/README.md` to mention the plugin-local `rules/` reference tree

## 9. Version bump

- [ ] 9.1 Bump `void-grimoire/.claude-plugin/plugin.json` version from `2.0.0` to `2.1.0`
- [ ] 9.2 Bump `void-grimoire/.claude-plugin/marketplace.json` plugin entry version to `2.1.0`

## 10. Verify

- [ ] 10.1 Run `openspec validate import-ecc-content` and resolve any errors
- [ ] 10.2 Confirm `registry.json` parses as valid JSON
- [ ] 10.3 Confirm every new SKILL.md has parseable YAML frontmatter
- [ ] 10.4 Smoke test routing: queries `nestjs`, `redis`, `framer motion`, `mcp server`, `next.js turbopack` each surface the matching `patterns` skill via `route-request`
- [ ] 10.5 Smoke test `lookup-docs` in a project with `./openspec/specs/` content present
- [ ] 10.6 Smoke test `lookup-docs` in a project WITHOUT `./openspec/` to confirm non-fatal absence handling

## 11. Ship

- [ ] 11.1 Commit with conventional-commit message (`feat(skills): import ECC reference content`)
- [ ] 11.2 Open PR; reference `openspec/changes/import-ecc-content/` artifacts in PR body
- [ ] 11.3 After merge: archive the change via `openspec archive import-ecc-content` so accepted specs move under `openspec/specs/`
