---
name: codebase:service-map
description: Use when any task may affect multiple services — auto-discovers services and dependencies from workspace configs and cross-package imports (JS/TS, Go), caches topology to .service-map.json, and expands task scope to include affected services
depends-on: []
chains-to: null
suggests: ["docs:lookup"]
---

## Service Map Skill

Discovers services in multi-service codebases, maps their dependencies, and ensures Claude checks all affected services when making changes.

### On Invocation

1. **Check cache:** Read `.service-map.json` at project root.
   - If it exists → skip to **Scope Expansion**.
   - If not → run **Discovery**.

2. **Discovery:**
   - Detect language(s) at project root:
     - `package.json` with `workspaces`, `pnpm-workspace.yaml`, or `lerna.json` → load `references/js-ts.md`
     - `go.work` or multiple `go.mod` files → load `references/go.md`
     - Both present → load both, merge results
     - Neither present (single-service project) → output nothing, done
   - Follow the loaded reference(s) to enumerate services and detect dependencies
   - Write results to `.service-map.json`:
     ```json
     {
       "version": 1,
       "generatedAt": "<ISO 8601 timestamp>",
       "updatedAt": "<ISO 8601 timestamp>",
       "languages": ["<detected languages>"],
       "services": [<service objects per reference output format>]
     }
     ```
   - Ensure bidirectional edges: every `dependsOn` entry has a corresponding `dependedOnBy` entry on the target service

3. **Scope Expansion:**
   - Determine which service(s) the current task touches using this priority:
     1. **File paths in the request** — match against service `path` prefixes
     2. **CWD** — if inside a service path, that service is touched
     3. **Service name mentions** — match user's words against service `name` fields
     4. **Inferred from context** — files read during planning inside a service path
   - If no service matches → output nothing, done
   - For each matched service, collect all `dependsOn` and `dependedOnBy` services
   - Output mandatory scope expansion:

> This task touches `<service>`. Related services that must be checked:
> - `<dep1>` (<service> depends on it)
> - `<dep2>` (depends on <service>)
>
> For each: verify no changes needed, or include required changes in the plan.

### Self-Learning (During Code Changes)

When you encounter evidence of a dependency NOT in `.service-map.json` during post-Gate 3 work:
- A new import from another workspace package
- A new service directory with its own `package.json` or `go.mod`
- A `replace` directive or workspace entry not in the map

**Action:** Update `.service-map.json` — add the new service or edge. Update both `dependsOn` and `dependedOnBy` for bidirectional consistency. Set `updatedAt` to current timestamp. Inform the user:

> Discovered new dependency: `<source>` now depends on `<target>`. Updated `.service-map.json`.

Self-learning only **adds** services and edges. It does not remove them.

### Forced Re-scan

If user says "re-scan services", "rebuild service map", or similar: delete `.service-map.json` and re-run Discovery from scratch.

### Known Limitations

- **Deleted/renamed services** are not auto-detected. Stale entries persist until forced re-scan.
- **Cross-language runtime dependencies** (e.g., TS calling Go via HTTP) are not auto-detected. They surface via self-learning or forced re-scan after user describes the relationship.
