# Codebase Service Map Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `codebase:service-map` skill that auto-discovers services and dependencies in JS/TS and Go codebases, caches the topology, and expands task scope to include affected services.

**Architecture:** New `codebase` domain with one skill. Gate 2 in the using-void-grimoire fires `docs:lookup` and `codebase:service-map` in parallel. The skill reads/writes `.service-map.json` at the project root. Language-specific detection heuristics live in reference files loaded on demand.

**Tech Stack:** Pure markdown skill (no runtime code). Cache is a JSON file.

**Spec:** `docs/specs/2026-03-14-codebase-service-map-design.md`

---

### Task 1: Create JS/TS Reference File

**Files:**
- Create: `.claude/skills/codebase_service-map/references/js-ts.md`

**Step 1: Create the reference file**

```markdown
# JS/TS Service Discovery Reference

Load this reference when the project root contains `package.json` with a `workspaces` field, a `pnpm-workspace.yaml`, or a `lerna.json`.

## Service Enumeration

1. Check for workspace config (in priority order):
   - `pnpm-workspace.yaml` → read `packages:` array of globs
   - Root `package.json` → read `workspaces` field (array of globs)
   - `lerna.json` → read `packages` field (array of globs)
2. Glob-expand each pattern to find directories containing `package.json`
3. For each found `package.json`, extract:
   - `name` field → service name
   - Directory path (relative to project root) → service path
   - `language: "typescript"` (or `"javascript"` if no `tsconfig.json` in that directory)

**If no workspace config exists and only a single `package.json` at root:** This is a single-service project. Return empty list — no service map needed.

## Dependency Detection

For each discovered service, check its `package.json`:

1. **Workspace cross-references:** Scan `dependencies`, `devDependencies`, and `peerDependencies` for keys that match another discovered service's `name`. Each match is a `dependsOn` edge.
2. **TSConfig path aliases:** If `tsconfig.json` exists, check `compilerOptions.paths` for aliases pointing to sibling package directories (e.g., `"@org/shared": ["../shared-types/src"]`). Each match is a `dependsOn` edge.

## Output

For each service, produce:
```json
{
  "name": "<package.json name>",
  "path": "<relative directory>",
  "language": "typescript",
  "dependsOn": ["<names of other workspace packages this depends on>"]
}
```

After all services are enumerated, compute `dependedOnBy` by inverting `dependsOn` edges: for each service A that appears in another service B's `dependsOn`, add B to A's `dependedOnBy`.

## Error Handling

- If a `package.json` is malformed (invalid JSON), skip it with a warning: "Skipping `<path>/package.json`: malformed JSON." Continue with remaining services.
- If a workspace glob matches a directory with no `package.json`, skip silently.
```

**Step 2: Verify file exists**

Run: `cat .claude/skills/codebase_service-map/references/js-ts.md | head -5`
Expected: Shows the title and first lines of the file.

**Step 3: Commit**

```bash
git add .claude/skills/codebase_service-map/references/js-ts.md
git commit -m "feat(codebase): add JS/TS service discovery reference"
```

---

### Task 2: Create Go Reference File

**Files:**
- Create: `.claude/skills/codebase_service-map/references/go.md`

**Step 1: Create the reference file**

```markdown
# Go Service Discovery Reference

Load this reference when the project root contains `go.work` or when multiple `go.mod` files exist within the first two directory levels.

## Service Enumeration

1. **If `go.work` exists:** Parse `use` directives to find module directories. Each `use ./path` points to a directory containing a `go.mod`.
2. **If no `go.work`:** Scan for `go.mod` files in the project root and one level of subdirectories (e.g., `*/go.mod`). Do not scan deeper than two levels.
3. For each found `go.mod`, extract:
   - `module` directive → service name (use the last path segment as short name, e.g., `github.com/org/repo/auth` → `auth`)
   - Full module path → stored for dependency matching
   - Directory path (relative to project root) → service path
   - `language: "go"`

**If only a single `go.mod` at root and no `go.work`:** This is a single-service project. Return empty list — no service map needed.

## Dependency Detection

For each discovered module:

1. **`require` directives:** Check if any required module path matches (or is a prefix of) another discovered module's full module path. Each match is a `dependsOn` edge.
2. **`replace` directives:** Check for `replace` directives pointing to local paths (`=> ./relative/path`). If the target path is another discovered module's directory, that is a `dependsOn` edge.

## Output

For each service, produce:
```json
{
  "name": "<short module name>",
  "path": "<relative directory>",
  "language": "go",
  "dependsOn": ["<names of other modules this depends on>"]
}
```

After all services are enumerated, compute `dependedOnBy` by inverting `dependsOn` edges.

## Error Handling

- If a `go.mod` is malformed, skip it with a warning: "Skipping `<path>/go.mod`: could not parse module directive." Continue with remaining modules.
- If a `go.work` `use` directive points to a directory without `go.mod`, skip silently.
```

**Step 2: Verify file exists**

Run: `cat .claude/skills/codebase_service-map/references/go.md | head -5`
Expected: Shows the title and first lines of the file.

**Step 3: Commit**

```bash
git add .claude/skills/codebase_service-map/references/go.md
git commit -m "feat(codebase): add Go service discovery reference"
```

---

### Task 3: Create SKILL.md

**Files:**
- Create: `.claude/skills/codebase_service-map/SKILL.md`

**Step 1: Create the skill file**

```markdown
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
```

**Step 2: Verify file exists**

Run: `cat .claude/skills/codebase_service-map/SKILL.md | head -10`
Expected: Shows frontmatter with name `codebase:service-map`.

**Step 3: Commit**

```bash
git add .claude/skills/codebase_service-map/SKILL.md
git commit -m "feat(codebase): add service-map skill"
```

---

### Task 4: Register the Codebase Domain

**Files:**
- Modify: `.claude/skills/registry.json`

**Step 1: Add codebase domain to registry.json**

Add a new `"codebase"` key to the `"domains"` object, after the `"docs"` entry:

```json
"codebase": {
  "description": "Codebase structure awareness — service topology, dependency graphs",
  "triggers": ["service", "monorepo", "workspace", "service-map", "cross-service", "multi-service"],
  "skills": ["codebase:service-map"],
  "docs": []
},
```

**Step 2: Verify JSON is valid**

Run: `cat .claude/skills/registry.json | python3 -m json.tool > /dev/null && echo "valid JSON"`
Expected: `valid JSON`

**Step 3: Verify the domain appears**

Run: `cat .claude/skills/registry.json | python3 -c "import sys,json; d=json.load(sys.stdin); print('codebase' in d['domains'])"`
Expected: `True`

**Step 4: Commit**

```bash
git add .claude/skills/registry.json
git commit -m "feat(codebase): register codebase domain in registry"
```

---

### Task 5: Update Entry-Point Gate 2

**Files:**
- Modify: `.claude/skills/claude_using-void-grimoire/SKILL.md` (lines 30-31)

**Step 1: Update Gate 2 instruction**

Replace the current Gate 2 section:

```markdown
### Gate 2: Doc Gate
Invoke `docs:lookup` with the task context. This checks for relevant documentation (via qmd or local file fallback). Even "no docs found" is a valid result — the point is you looked.
```

With:

```markdown
### Gate 2: Docs & Codebase Gate
Invoke `docs:lookup` and `codebase:service-map` in parallel. Wait for both to complete. Merge their outputs: documentation findings inform the task context; service-map scope expansion adds mandatory checklist items for affected services. Pass the combined context to Gate 3. Even "no docs found" or "no services detected" are valid results — the point is you looked.
```

**Step 2: Verify the change**

Run: `grep -A2 "Gate 2" .claude/skills/claude_using-void-grimoire/SKILL.md`
Expected: Shows "Docs & Codebase Gate" and mentions both `docs:lookup` and `codebase:service-map`.

**Step 3: Commit**

```bash
git add .claude/skills/claude_using-void-grimoire/SKILL.md
git commit -m "feat(codebase): update Gate 2 to invoke service-map in parallel"
```

---

### Task 6: Update README.md

**Files:**
- Modify: `README.md`

**Step 1: Add codebase domain row to the table**

Add after the `docs` row:

```markdown
| **codebase** | service-map | Codebase structure awareness and service topology |
```

**Step 2: Update skill count**

Change `**41 skills** total across 7 domains.` to `**42 skills** total across 8 domains.`

**Step 3: Update Gate 2 description in "How It Works"**

Change:
```
2. **Doc Gate** — searches for relevant documentation via [qmd](https://github.com/tobi/qmd) or local file fallback
```

To:
```
2. **Docs & Codebase Gate** — searches for documentation via [qmd](https://github.com/tobi/qmd) and discovers service topology in parallel
```

**Step 4: Verify**

Run: `grep -c "codebase" README.md`
Expected: At least 2 matches (table row + gate description).

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add codebase domain to README"
```

---

### Task 7: Update Architecture Spec

**Files:**
- Modify: `docs/specs/2026-03-14-void-grimoire-architecture-design.md`

**Step 1: Add to plugin structure tree (Section 1)**

After the `docs_index/` line, add:

```
│       │
│       ├── codebase_service-map/
```

**Step 2: Update skill count in Section 1**

Change `**41 skills across 7 domains:**` to `**42 skills across 8 domains:**` and add `codebase (1)` to the domain list.

**Step 3: Add frontmatter to Section 10**

After the `docs:index` line, add:

```yaml
# codebase domain
codebase:service-map    → depends-on: [], chains-to: null, suggests: [docs:lookup]
```

**Step 4: Verify**

Run: `grep "codebase" docs/specs/2026-03-14-void-grimoire-architecture-design.md | wc -l`
Expected: At least 3 matches.

**Step 5: Commit**

```bash
git add docs/specs/2026-03-14-void-grimoire-architecture-design.md
git commit -m "docs: add codebase:service-map to architecture spec"
```

---

### Task 8: Add codebase rules file

**Files:**
- Create: `rules/codebase.md`

**Step 1: Create empty rules file**

```markdown
<!-- Learned rules for the codebase domain. Managed by claude:learn. -->
```

**Step 2: Commit**

```bash
git add rules/codebase.md
git commit -m "feat(codebase): add empty codebase rules file"
```

---

### Task 9: Manual Verification

**Step 1: Verify skill directory structure**

Run: `find .claude/skills/codebase_service-map -type f | sort`
Expected:
```
.claude/skills/codebase_service-map/SKILL.md
.claude/skills/codebase_service-map/references/go.md
.claude/skills/codebase_service-map/references/js-ts.md
```

**Step 2: Verify registry has 8 domains**

Run: `cat .claude/skills/registry.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['domains']), 'domains:', sorted(d['domains'].keys()))"`
Expected: `8 domains: ['claude', 'codebase', 'design', 'dev', 'docs', 'git', 'npm', 'workflow']`

**Step 3: Verify using-void-grimoire mentions service-map**

Run: `grep "service-map" .claude/skills/claude_using-void-grimoire/SKILL.md`
Expected: Shows the updated Gate 2 line.

**Step 4: Verify README skill count**

Run: `grep "skills.*total" README.md`
Expected: `**42 skills** total across 8 domains.`

**Step 5: Commit (if any fixups needed)**

```bash
git add -A && git commit -m "fix: address verification issues" || echo "nothing to fix"
```
