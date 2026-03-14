# Codebase Service Map — Design Spec

**Date:** 2026-03-14
**Status:** Approved
**Scope:** JS/TS, Go

## Problem

When Claude Code works in a multi-service codebase (monorepo or multi-repo), it treats the directory it's editing as the whole world. Changes to a service often require corresponding changes in dependents (API contract updates, shared dependency consumers, config/infra), but Claude won't touch those unless explicitly told. The plugin has no mechanism to make Claude aware of service relationships.

## Solution

A new `codebase:service-map` skill that auto-discovers services and their dependencies, caches the topology to `.service-map.json`, and automatically expands task scope to include affected services.

## Architecture

### New Domain

`codebase` — owns skills about understanding code structure and service topology.

### New Skill

`codebase:service-map` — lives at `.claude/skills/codebase_service-map/`.

```
codebase_service-map/
├── SKILL.md              # Decision logic, cache behavior, scope expansion rules
└── references/
    ├── js-ts.md          # Detection heuristics for JS/TS monorepos
    └── go.md             # Detection heuristics for Go workspaces
```

### SKILL.md Frontmatter

```yaml
---
name: codebase:service-map
description: Use when any task may affect multiple services — auto-discovers services and dependencies from workspace configs and cross-package imports (JS/TS, Go), caches topology to .service-map.json, and expands task scope to include affected services
depends-on: []
chains-to: null
suggests: ["docs:lookup"]
---
```

### Gate 2 Change

The entry-point's Gate 2 changes from invoking `docs:lookup` alone to invoking `docs:lookup` and `codebase:service-map` in parallel. Claude merges findings before Gate 3 routing.

```
Gate 1 (Rules) → Gate 2 (docs:lookup ‖ codebase:service-map) → Gate 3 (Route)
```

**Updated Gate 2 instruction in `claude_entry-point/SKILL.md`:**

> **Gate 2 (Docs & Codebase):** Invoke `docs:lookup` and `codebase:service-map` in parallel. Wait for both to complete. Merge their outputs: documentation findings inform the task context; service-map scope expansion adds mandatory checklist items for affected services. Pass the combined context to Gate 3.

## Service Discovery

### When It Runs

On every Gate 2 invocation:
1. Check for `.service-map.json` at project root.
2. **Cache hit:** Read the map, skip to scope expansion.
3. **Cache miss:** Run language-specific discovery, write `.service-map.json`.

### Language Detection

Check project root for `package.json` (JS/TS), `go.mod`/`go.work` (Go), or both. Load corresponding reference file(s). Multiple languages merge results.

### Dependency Detection Heuristics

Details live in reference files loaded on demand. High-level summary below; full implementation logic in reference files.

**`references/js-ts.md` must cover:**
1. **Service enumeration:** Parse `pnpm-workspace.yaml` globs, `package.json` `workspaces` field, or `lerna.json`. Glob-expand to find all `package.json` files. Each is a service (name from `package.json` `name` field, path is the directory).
2. **Dependency detection:** For each service's `package.json`, check `dependencies`, `devDependencies`, and `peerDependencies` for references to other workspace package names. Also check `tsconfig.json` `paths` aliases that point to sibling packages.
3. **Output:** List of `{name, path, language: "typescript", dependsOn: [...]}`. Compute `dependedOnBy` by inverting the `dependsOn` edges.

**`references/go.md` must cover:**
1. **Service enumeration:** Parse `go.work` `use` directives to find module directories. If no `go.work`, scan for `go.mod` files in the first two directory levels.
2. **Dependency detection:** For each module, check `go.mod` `require` directives for imports whose module path is a prefix of another discovered module. Also check `replace` directives pointing to local paths.
3. **Output:** Same shape as JS/TS — `{name, path, language: "go", dependsOn: [...]}` with computed `dependedOnBy`.

## Cache Schema

`.service-map.json` at project root. Git-ignorable (user's choice).

```json
{
  "version": 1,
  "generatedAt": "2026-03-14T10:30:00Z",
  "updatedAt": "2026-03-14T14:22:00Z",
  "languages": ["typescript", "go"],
  "services": [
    {
      "name": "api-gateway",
      "path": "packages/api-gateway",
      "language": "typescript",
      "dependsOn": ["auth-service", "shared-types"],
      "dependedOnBy": []
    },
    {
      "name": "auth-service",
      "path": "packages/auth",
      "language": "typescript",
      "dependsOn": ["shared-types", "database"],
      "dependedOnBy": ["api-gateway", "user-service"]
    },
    {
      "name": "shared-types",
      "path": "packages/shared-types",
      "language": "typescript",
      "dependsOn": [],
      "dependedOnBy": ["api-gateway", "auth-service", "user-service"]
    }
  ]
}
```

### Schema Decisions

- `version` field for future schema evolution.
- `generatedAt` vs `updatedAt` tracks initial scan vs self-learning updates separately.
- Bidirectional edges (`dependsOn` + `dependedOnBy`) — redundant but enables instant lookups without graph traversal.
- No contract details (endpoints, schemas) — topology only. Claude reads actual code when it needs specifics.

## Scope Expansion

The core behavior. When `codebase:service-map` loads the map, it determines which service(s) the current task touches and walks the dependency graph to collect all directly related services.

### Task-to-Service Matching

Claude matches the current task to services using this priority order:
1. **File paths in the request** — if the user mentions `packages/auth/src/verify.ts`, match to the service whose `path` is a prefix (`auth-service` at `packages/auth`).
2. **CWD** — if Claude's working directory is inside a service path, that service is touched.
3. **Service name mentions** — if the user says "auth service" or "auth-service", match against service `name` fields.
4. **Inferred from context** — during planning/brainstorm, if Claude reads files inside a service path, that service is touched.

If no service matches (e.g., editing a root-level config file), scope expansion does not fire.

### Expansion Behavior

For each matched service, collect all directly related services — both `dependsOn` and `dependedOnBy`.

These are returned as the skill's output text, which Claude incorporates into the Gate 2 merged context:

> "This task touches `auth-service`. Related services that must be checked:
> - `shared-types` (auth depends on it)
> - `api-gateway` (depends on auth)
> - `user-service` (depends on auth)
>
> For each: verify no changes needed, or include required changes in the plan."

This fires before Gate 3 routing, so by the time brainstorm/planning starts, the full scope is established.

## Self-Learning

During code changes (post-Gate 3 execution phase), if Claude encounters evidence of a relationship not in `.service-map.json`:
- A new import from another workspace package
- A new service directory with its own `package.json` or `go.mod`
- A `replace` directive or workspace entry pointing somewhere not in the map

Claude updates `.service-map.json` (adds the service or edge, updates both `dependsOn` and `dependedOnBy` for bidirectional consistency) and informs the user:

> "Discovered new dependency: `auth-service` now depends on `email-service`. Updated `.service-map.json`."

This happens opportunistically during normal work — no dedicated scan needed. Self-learning only **adds** services and edges; it does not remove them.

### Forced Re-scan

User can say "re-scan services" or "rebuild service map" to trigger full fresh discovery, replacing the cache entirely.

## Staleness Strategy

The skill does not proactively check staleness on cache read. It trusts the cache and relies on self-learning to keep it current. Forced re-scan is available as an escape hatch.

### Known Limitation

Deleted or renamed services are not auto-detected. If a service directory is removed or renamed, the stale entry persists in `.service-map.json` until a forced re-scan. This is acceptable because service deletion/rename is infrequent and Claude will naturally notice when a referenced path doesn't exist.

## Edge Cases

### No Services Detected

If the project root has no workspace configs, no `go.work`, and only a single `package.json`/`go.mod`, the skill outputs nothing and scope expansion does not fire. Single-service projects are unaffected.

### Cross-Language Runtime Dependencies

Dependencies between services in different languages (e.g., TS service calling a Go service via HTTP) are **not auto-detected** by import/workspace heuristics. These must be added via self-learning (Claude notices during code changes) or manual forced re-scan after the user describes the relationship. This is a known scope limitation for v1.

### Malformed Config Files

If a `package.json`, `go.mod`, or workspace config is malformed or references a path that doesn't exist on disk, the skill skips that entry with a warning and continues discovery for the remaining services. Discovery does not abort on individual errors.

## Integration Changes

### Modified Files

1. **`claude_entry-point/SKILL.md`** — Gate 2 instruction adds parallel `codebase:service-map` invocation.
2. **`registry.json`** — New `codebase` domain:
   ```json
   "codebase": {
     "description": "Codebase structure awareness — service topology, dependency graphs",
     "triggers": ["service", "monorepo", "workspace", "service-map", "cross-service", "multi-service"],
     "skills": ["codebase:service-map"],
     "docs": []
   }
   ```
3. **README.md** — New domain row, skill count incremented.
4. **Architecture spec** — Plugin structure tree (Section 1) and frontmatter reference (Section 10).

### Unchanged

- `docs:lookup` — untouched, documentation only.
- SessionStart hook — no additional payload.
- Three-gate flow structure — still three gates.
- All other skills — unaware of service-map unless they read `.service-map.json`.

### Summary

No new hooks, no new dependencies, no plugin runtime changes. One new skill, one new domain, one-line entry-point gate change.

## Acceptance Criteria

1. **Discovery (JS/TS):** Given a pnpm monorepo with packages A, B, C where B's `package.json` depends on A, running discovery produces a map with B.dependsOn=[A] and A.dependedOnBy=[B].
2. **Discovery (Go):** Given a `go.work` with modules X, Y where Y imports X, running discovery produces Y.dependsOn=[X] and X.dependedOnBy=[Y].
3. **Cache hit:** On second invocation, skill reads `.service-map.json` and does not re-scan.
4. **Scope expansion:** User edits a file in service A that has dependents B and C. Skill output includes mandatory checklist with B and C.
5. **No-op on single service:** A project with one `package.json` and no workspace config produces no scope expansion output.
6. **Self-learning:** Claude adds an import from service D (not in map) during code changes. `.service-map.json` is updated to include D, and user is informed.
7. **Forced re-scan:** User says "rebuild service map." Cache is replaced with fresh discovery results.
8. **Malformed config:** A `package.json` with invalid JSON is skipped with a warning; other services are still discovered.
