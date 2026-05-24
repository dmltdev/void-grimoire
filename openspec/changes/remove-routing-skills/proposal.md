## Why

void-grimoire v2.0.0 partially dismantled the three-gate flow but kept two orchestration skills as residue: `route-request` (registry-driven skill routing) and `use-void-grimoire` (entry/gating skill that calls `route-request` in Gate 3). Claude Code's native skill-description loading plus user invocation already covers the discovery surface, so these meta-skills are redundant indirection that burn tokens at session start and never produce content the user couldn't get more directly. Removing them simplifies the plugin to a pure additive library and unblocks cleaner v2.1.0 work (the in-flight `import-ecc-content` change).

## What Changes

- **BREAKING (plugin-internal):** Delete `void-grimoire/skills/route-request/` entirely.
- **BREAKING (plugin-internal):** Delete `void-grimoire/skills/use-void-grimoire/` entirely.
- Remove `route-request` and `use-void-grimoire` from `void-grimoire/skills/registry.json` `domains.void-grimoire.skills` array.
- Strip `triggers` arrays from every domain entry in `registry.json` (they were only consumed by `route-request`; without it they are dead data).
- Audit remaining skills (`expand-prompt`, `learn-correction`, `verify-requirements`, `session-summary`, `lookup-docs`, `map-services`, `index-docs`, `write-skill`, `init-project`) for any references to `route-request`, `use-void-grimoire`, "three-gate flow", or "Gate 3"; rewrite or remove.
- Remove any mentions of the three-gate flow, `route-request`, or `use-void-grimoire` from `void-grimoire/README.md` and `AGENTS.MD`.
- Bump plugin version to `2.0.1` (patch — pruning residue, no new capabilities, no behavior change from the consumer's perspective since these skills were already optional).

**Not changing:** The `registry.json` file itself is kept (still useful as a catalog of domain → skills mapping for documentation). All non-routing skills stay. No content from `import-ecc-content` is touched — that change still applies cleanly afterward.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
(none — these skills were never speced under `openspec/specs/`; removal is a pure code/doc cleanup, not a spec-level capability change)

## Impact

- **Files deleted:** `void-grimoire/skills/route-request/` (whole dir), `void-grimoire/skills/use-void-grimoire/` (whole dir).
- **Files modified:** `void-grimoire/skills/registry.json` (drop two skill entries + strip all `triggers` arrays), `void-grimoire/README.md`, `AGENTS.MD`, `void-grimoire/.claude-plugin/plugin.json` (version), `void-grimoire/.claude-plugin/marketplace.json` (version), plus any sibling skills that still reference the deleted pair.
- **Consumer impact:** Anyone who explicitly invoked `route-request` or `use-void-grimoire` by name loses those skills. Practical impact is near-zero — Claude Code auto-loads relevant skills via descriptions, and manual `/skill-name` invocation continues to work for all surviving skills.
- **Risk:** Low. Pure deletion. Reversible via `git revert`. No data migration, no user state.
- **Unblocks:** `import-ecc-content` change can now skip routing-trigger decisions (Open Question 1 becomes moot) and emit a cleaner `registry.json`.
