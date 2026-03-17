# Centralized Config, Debug Log Access & Decision History

**Date:** 2026-03-15
**Status:** Approved

## Overview

Three interconnected changes:

1. **Centralized project config** — `.void-grimoire/` directory in consumer projects for all plugin state
2. **Debug log access** — AI knows how to query project logs during debugging
3. **Decision history** — existing artifacts (brainstorms, plans) stored in a discoverable, queryable location

## `.void-grimoire/` Directory Structure

```
<project-root>/
  .void-grimoire/
    config.json                # project-specific configuration
    config.schema.json         # JSON Schema for config.json
    rules/                     # learned rules (moved from plugin's rules/)
      global.md
      claude.md
      codebase.md
      design.md
      dev.md
      docs.md
      git.md
      npm.md
      workflow.md
    history/                   # decision artifacts, grouped by initiative
      <initiative-name>/
        brainstorm.md
        plan.md
        implementation.md
    service-map.json           # codebase topology cache
```

Plugin repo's `rules/` directory becomes a template. Consumer projects store learned rules in `.void-grimoire/rules/`.

## config.json

```json
{
  "$schema": "./config.schema.json",
  "version": 1,
  "features": {
    "qmd": {
      "enabled": false,
      "command": "qmd search",
      "description": "Local hybrid search for markdown notes and docs"
    },
    "logAccess": {
      "enabled": false,
      "tool": "sentry-mcp",
      "usage": "use mcp__sentry__search_issues to query errors by message or fingerprint",
      "description": "How the AI accesses project logs during debugging"
    },
    "decisionHistory": {
      "enabled": true,
      "description": "Store brainstorms, plans, and implementation records in .void-grimoire/history/"
    },
    "serviceMap": {
      "enabled": true,
      "description": "Auto-discover workspace topology and cache to .void-grimoire/service-map.json"
    }
  }
}
```

Design choices:

- **`enabled` on everything** — external tools (qmd, logAccess) disabled by default, built-in features (decisionHistory, serviceMap) enabled by default
- **`tool` + `usage` for logAccess** — freeform text because every logging backend is different
- **`command` for qmd** — tells the AI what CLI command to run
- **Schema file alongside config** — provides editor autocomplete and validation
- **`version` field** — enables future `init-project` runs to detect stale configs and offer migrations
- **Feature shape convention** — every feature object must have `enabled` (boolean) and `description` (string). Additional fields are feature-specific.

## Gate 1 Changes

Current: loads `rules/global.md` + `rules/{matched-domain}.md` from plugin root.

New behavior:

1. Check if `.void-grimoire/config.json` exists in project root
2. If yes — load and validate against schema, load rules from `.void-grimoire/rules/`
3. If no — no config loaded (all features use defaults), load rules from plugin's own `rules/` directory as fallback. No error, no scaffolding prompt.
4. If config exists but fails schema validation — warn the user, continue with defaults. Do not halt.

Config stays in conversation context through gate flow. Skills reference it directly.

Gate 1 does NOT fail if config is missing or malformed. Plugin works out of the box with zero setup. The plugin's `rules/` directory is always the fallback when `.void-grimoire/rules/` doesn't exist.

**Supersedes:** the architecture spec's Gate 1 description. When `.void-grimoire/` exists, rules are loaded from there instead of the plugin root. The `<!-- void-grimoire:qmd:enabled -->` HTML comment approach in CLAUDE.md is deprecated — `config.json` is the single source of truth for feature toggles.

## `init-project` Skill

New skill at `skills/init-project/SKILL.md`. Explicit initialization — user runs `/skill init-project`.

Behavior:

1. Scaffold `.void-grimoire/` directory
2. Write `config.json` with defaults
3. Write `config.schema.json`
4. Copy empty rule templates to `.void-grimoire/rules/`
5. Create `history/` directory

No auto-init. No surprise file creation. User controls when setup happens.

## Feature: Debug Log Access

`debug-systematically` reads `config.features.logAccess`:

- **Enabled** — uses `tool` and `usage` fields to query logs as part of debugging flow
- **Disabled** — relies on user-provided logs (current behavior)

Supports MCP tools (Sentry, Axiom, etc.) or local CLI tools. The `usage` field is freeform instructions so it works with any backend.

## Feature: Decision History

Makes existing artifacts discoverable across sessions. Not a new system — just a predictable location.

`brainstorm`, `write-plan`, `execute-plan` read `config.features.decisionHistory`:

- **Enabled** — write artifacts to `.void-grimoire/history/<initiative>/` (brainstorm.md, plan.md, implementation.md)
- **Disabled** — write to `docs/specs/` (current behavior)

**Initiative naming:** derived from brainstorm topic, slugified to lowercase kebab-case (e.g., "Auth Refactor" → `auth-refactor`). Max 50 characters, alphanumeric + hyphens only. On collision, append `-2`, `-3`, etc. User can override the derived name during brainstorming.

Value: context recovery after `/compact` or new sessions, prevents re-litigating rejected approaches, gives subagents decision context.

## Per-Skill Config Usage Summary

| Skill | Config Key | Behavior When Enabled | Behavior When Disabled |
|-------|-----------|----------------------|----------------------|
| `debug-systematically` | `logAccess` | Queries logs via configured tool | User provides logs manually |
| `lookup-docs` | `qmd` | Uses configured command | Falls back to local file search |
| `index-docs` | `qmd` | Uses configured command | Falls back to local file search |
| `map-services` | `serviceMap` | Writes to `.void-grimoire/service-map.json` | Entry point skips invocation in Gate 2 |
| `brainstorm` | `decisionHistory` | Writes to `.void-grimoire/history/` | Writes to `docs/specs/` |
| `write-plan` | `decisionHistory` | Writes to `.void-grimoire/history/` | Writes to `docs/specs/` |
| `execute-plan` | `decisionHistory` | Writes to `.void-grimoire/history/` | Writes to `docs/specs/` |
| `prepare-compact` | `decisionHistory` | References `.void-grimoire/history/` in session summary | No change |
| `learn-correction` | — | Writes learned rules to `.void-grimoire/rules/` | Writes to plugin's `rules/` (fallback) |
| `init-project` | — | Scaffolds `.void-grimoire/` | — |
| `use-void-grimoire` | — | Loads config + rules from `.void-grimoire/` | Loads rules from plugin's `rules/` |

## `.gitignore` Guidance

Recommended `.gitignore` entries for consumer projects:

```gitignore
# Cache / generated — do not commit
.void-grimoire/service-map.json

# Everything else in .void-grimoire/ should be committed
# (config.json, rules/, history/)
```

`service-map.json` is a regenerable cache. Config, rules, and decision history are project knowledge that should be version-controlled.

## Migration

- Plugin repo `rules/` directory becomes a template and fallback (ships with placeholder files)
- Existing `.service-map.json` at project root → `.void-grimoire/service-map.json`. `init-project` warns if a stale `.service-map.json` exists at project root
- Existing `docs/specs/` artifacts are NOT migrated automatically — they stay where they are
- `init-project` does not move existing files; it scaffolds fresh
- `<!-- void-grimoire:qmd:enabled -->` HTML comments in CLAUDE.md are deprecated — `config.json` is the source of truth
