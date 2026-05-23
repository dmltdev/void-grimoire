## ADDED Requirements

### Requirement: Native skill loading only

The plugin SHALL rely exclusively on Claude Code's native skill-description loading mechanism for skill discovery. The plugin MUST NOT ship any skill whose purpose is to parse user requests and route them to other skills.

#### Scenario: No routing skill present
- **WHEN** a developer lists `void-grimoire/skills/` after this change ships
- **THEN** no skill named `route-request`, `route-skill`, `dispatch-skill`, or similar routing-purpose name exists
- **AND** no surviving skill's body invokes another skill via a routing-table lookup

#### Scenario: User invokes skills directly
- **WHEN** a user wants to use a void-grimoire skill
- **THEN** they invoke it by name via `/skill-name` or rely on Claude Code's native description-based auto-loading
- **AND** no plugin-local intermediary is consulted

### Requirement: No three-gate flow entry skill

The plugin SHALL NOT ship a skill that declares a multi-gate procedure (rules gate, docs gate, routing gate, or any equivalent) the model must run before code changes. Workflow procedure remains the responsibility of openspec (for spec-driven work) or the user's own AGENTS.MD / CLAUDE.MD instructions.

#### Scenario: No use-void-grimoire skill present
- **WHEN** a developer lists `void-grimoire/skills/` after this change ships
- **THEN** no skill named `use-void-grimoire` or `void-grimoire-gate` exists
- **AND** no surviving skill declares a "three-gate flow" or equivalent multi-gate procedure in its body

### Requirement: Registry as catalog, not router

The plugin's `void-grimoire/skills/registry.json` SHALL remain in the repo as a domain → skills catalog used only by documentation tooling and humans. It MUST NOT contain `triggers` arrays, since no consumer reads them after this change.

#### Scenario: triggers stripped from registry
- **WHEN** a developer parses `void-grimoire/skills/registry.json` after this change ships
- **THEN** no domain entry contains a `triggers` field
- **AND** every domain entry retains `description` and `skills` fields

### Requirement: No dangling references in live surfaces

After deletion, no file in the plugin's live surface SHALL reference `route-request`, `use-void-grimoire`, "three-gate flow", or "Gate 3". Live surface is defined as: `void-grimoire/skills/`, `void-grimoire/.claude-plugin/`, `void-grimoire/README.md`, and any non-archival doc that describes current behaviour (e.g., `docs/LORE.md`, `docs/feature-requests.md`).

Archival material is exempt: `void-grimoire/openspec/` (workflow archives), `void-grimoire/docs/plans/` (historical implementation plans), `void-grimoire/docs/specs/` (historical design specs), and `void-grimoire/docs/SESSION-SUMMARY.md` (session retrospectives) MAY retain references as immutable history.

#### Scenario: Grep returns clean on live surfaces
- **WHEN** a developer runs `grep -rnE 'route-request|use-void-grimoire|three-gate flow|Gate 3' void-grimoire/skills void-grimoire/.claude-plugin void-grimoire/README.md void-grimoire/docs/LORE.md void-grimoire/docs/feature-requests.md`
- **THEN** zero matches are returned

#### Scenario: Archives may retain history
- **WHEN** a developer greps `void-grimoire/docs/plans/` or `void-grimoire/docs/specs/`
- **THEN** historical matches are permitted and SHALL NOT be rewritten
