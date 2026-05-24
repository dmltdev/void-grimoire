## ADDED Requirements

### Requirement: Plugin-local rules tree

The plugin SHALL ship a `void-grimoire/rules/` directory containing three subdirectories — `typescript/`, `web/`, `common/` — populated with rule files imported verbatim from ECC.

The set MUST include at minimum:
- `common/{code-review,git-workflow,development-workflow,patterns,coding-style,security,testing,performance,agents,hooks}.md`
- `typescript/{coding-style,patterns,security,testing,hooks}.md`
- `web/{performance,design-quality,security,testing,hooks,patterns,coding-style}.md`

#### Scenario: Rule files exist
- **WHEN** a developer runs `find void-grimoire/rules -name '*.md' | wc -l`
- **THEN** the count is at least 22

#### Scenario: Each rule file is non-empty and well-formed markdown
- **WHEN** a developer runs `wc -c` on any imported rule file
- **THEN** the byte count is greater than zero
- **AND** the file's first non-blank line is an H1 heading

### Requirement: Extends chain flattened

For each language-specific rule file (under `typescript/` or `web/`) that ECC ships with a `> This file extends ../common/<topic>.md` reference, the plugin's imported version SHALL inline the referenced common content at the top of the file and remove the `> extends` line.

The matching `common/<topic>.md` file SHALL still exist as a standalone file for callers that only need common rules.

#### Scenario: No `> extends` lines remain
- **WHEN** a developer runs `grep -rE '^> This file extends' void-grimoire/rules/`
- **THEN** no matches are returned

#### Scenario: Common content appears in extended files
- **WHEN** a developer compares `void-grimoire/rules/typescript/coding-style.md` against `void-grimoire/rules/common/coding-style.md`
- **THEN** the TypeScript file contains all content from the common file (verbatim or with extension)

### Requirement: Rules are read-on-demand, not auto-injected

The plugin SHALL NOT add any hook, skill, or config that automatically reads the `rules/` tree into every session. Rules MUST be read explicitly by individual skills or by user request.

#### Scenario: No auto-injection mechanism
- **WHEN** a developer searches `void-grimoire/.claude-plugin/`, `void-grimoire/hooks/` (if it exists), and the SessionStart hook configuration
- **THEN** no reference loads `rules/*.md` automatically at session start

### Requirement: Imports free of ECC-specific content

Each imported rule file SHALL be scanned for ECC-specific references (`ecc-tools`, `/ECC/`, `affaan-m`, internal ECC agent names) and any matches MUST be rewritten or removed.

#### Scenario: No ECC references leak
- **WHEN** a developer runs `grep -rE 'ecc-tools|affaan-m|/ECC/' void-grimoire/rules/`
- **THEN** no matches are returned
