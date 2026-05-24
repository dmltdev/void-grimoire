## ADDED Requirements

### Requirement: Stack-reference skill set

The plugin SHALL ship nine `*-patterns` style reference skills covering the user's primary stack: `nestjs-patterns`, `nextjs-turbopack`, `postgres-patterns`, `redis-patterns`, `mcp-server-patterns`, `motion-foundations`, `motion-patterns`, `motion-ui`, `motion-advanced`.

Each skill MUST live at `void-grimoire/skills/<skill-name>/SKILL.md` and follow the existing void-grimoire frontmatter contract (`name`, `domain`, `description`, `depends-on`, `chains-to`, `suggests`).

Each skill MUST be self-contained: any patterns or examples imported from ECC MUST have ECC-specific references (paths, tool names, `ecc-tools` mentions) rewritten or removed.

Each skill MUST link to the canonical upstream documentation URL at the top of the body, marking the skill as opinionated starter notes rather than a docs replica.

#### Scenario: Skill files exist and parse
- **WHEN** a developer runs `ls void-grimoire/skills/{nestjs-patterns,nextjs-turbopack,postgres-patterns,redis-patterns,mcp-server-patterns,motion-foundations,motion-patterns,motion-ui,motion-advanced}/SKILL.md`
- **THEN** all nine files exist
- **AND** each file has valid YAML frontmatter with `name`, `domain`, `description` fields

#### Scenario: No ECC-specific references leak in
- **WHEN** a developer runs `grep -rE 'ecc-tools|/ECC/|affaan' void-grimoire/skills/<skill-name>/SKILL.md` for each imported skill
- **THEN** no matches are returned

#### Scenario: Upstream docs link present
- **WHEN** a developer reads the body of any imported `*-patterns` skill
- **THEN** the first non-frontmatter section contains an HTTPS URL to the canonical upstream documentation

### Requirement: New `patterns` domain in registry

The plugin SHALL add a `patterns` domain entry to `void-grimoire/skills/registry.json` whose `skills` array contains all nine new skill names and whose `triggers` array contains keywords matching each skill's subject (`nestjs`, `nest.js`, `nextjs`, `next.js`, `turbopack`, `postgres`, `postgresql`, `redis`, `mcp`, `framer-motion`, `motion`, `animation`).

#### Scenario: registry.json declares patterns domain
- **WHEN** a developer parses `void-grimoire/skills/registry.json`
- **THEN** `domains.patterns` exists with non-empty `description`, `triggers`, and `skills` arrays
- **AND** `domains.patterns.skills` includes all nine new skill names

#### Scenario: route-request returns patterns skills for stack queries
- **WHEN** a user request contains the substring `nestjs` or `postgres` or `framer motion`
- **THEN** `route-request` returns at least one `patterns`-domain skill in its recommendations

### Requirement: Naming-exception documentation

The plugin SHALL document the `*-patterns` naming exception in `AGENTS.MD` under the "Skill Conventions" section, stating that reference skills (read-on-demand stack content) MAY use a `{topic}-patterns` form rather than the default `{verb}-{subject}` form.

#### Scenario: AGENTS.MD names the exception
- **WHEN** a developer searches `AGENTS.MD` for `*-patterns`
- **THEN** a paragraph explaining the exception is present
- **AND** the exception explicitly scopes itself to reference skills

### Requirement: Motion skills coexist with impeccable's animate

The plugin SHALL ensure the four motion-* skills' `description` frontmatter states they cover Framer Motion patterns/code (not motion principles), so they coexist with the impeccable plugin's `animate` skill without ambiguity.

#### Scenario: Motion skill descriptions disambiguate
- **WHEN** a developer reads the `description` of any of `motion-foundations`, `motion-patterns`, `motion-ui`, `motion-advanced`
- **THEN** the description mentions Framer Motion or "code patterns" or "implementation"
- **AND** the description does NOT claim to cover motion principles in general
