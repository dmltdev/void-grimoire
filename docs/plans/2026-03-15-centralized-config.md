# Centralized Config, Debug Log Access & Decision History — Implementation Plan

> **For agentic workers:** REQUIRED: Use develop-with-subagents (if subagents available) or execute-plan to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `.void-grimoire/` per-project config directory with centralized config, debug log access, and decision history features.

**Architecture:** Gate 1 loads `config.json` from `.void-grimoire/` in the consumer project (falls back to plugin's `rules/` if absent). Skills read feature flags from config. `init-project` scaffolds the directory. All plugin state (rules, service-map, decision history) moves under `.void-grimoire/`.

**Tech Stack:** Markdown skill files, JSON config/schema. No runtime code — this is a Claude Code plugin of instruction files.

**Spec:** `docs/specs/2026-03-15-centralized-config-and-features-design.md`

---

## Chunk 1: Config Schema & Init Skill

### Task 1: Create config.schema.json

This is a template file that `init-project` will copy into consumer projects. It lives in the plugin repo so there's a single source of truth.

**Files:**
- Create: `templates/config.schema.json`

- [ ] **Step 1: Create templates directory and write the JSON Schema**

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "void-grimoire project config",
  "description": "Per-project configuration for the void-grimoire Claude Code plugin",
  "type": "object",
  "required": ["version", "features"],
  "properties": {
    "$schema": {
      "type": "string"
    },
    "version": {
      "type": "integer",
      "const": 1,
      "description": "Config schema version. Enables future migrations."
    },
    "features": {
      "type": "object",
      "properties": {
        "qmd": {
          "type": "object",
          "required": ["enabled", "description"],
          "properties": {
            "enabled": { "type": "boolean", "default": false },
            "command": { "type": "string", "default": "qmd search", "description": "CLI command to run for qmd searches" },
            "description": { "type": "string" }
          },
          "additionalProperties": false
        },
        "logAccess": {
          "type": "object",
          "required": ["enabled", "description"],
          "properties": {
            "enabled": { "type": "boolean", "default": false },
            "tool": { "type": "string", "description": "Name of the MCP tool or CLI tool for log access" },
            "usage": { "type": "string", "description": "Freeform instructions for how the AI should use the tool" },
            "description": { "type": "string" }
          },
          "additionalProperties": false
        },
        "decisionHistory": {
          "type": "object",
          "required": ["enabled", "description"],
          "properties": {
            "enabled": { "type": "boolean", "default": true },
            "description": { "type": "string" }
          },
          "additionalProperties": false
        },
        "serviceMap": {
          "type": "object",
          "required": ["enabled", "description"],
          "properties": {
            "enabled": { "type": "boolean", "default": true },
            "description": { "type": "string" }
          },
          "additionalProperties": false
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

- [ ] **Step 2: Commit**

```bash
git add templates/config.schema.json
git commit -m "feat: add config.schema.json template for .void-grimoire/ config"
```

### Task 2: Create default config.json template

**Files:**
- Create: `templates/config.json`

- [ ] **Step 1: Write default config template**

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
      "tool": "",
      "usage": "",
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

- [ ] **Step 2: Commit**

```bash
git add templates/config.json
git commit -m "feat: add default config.json template"
```

### Task 3: Create init-project skill

**Files:**
- Create: `skills/init-project/SKILL.md`
- Modify: `skills/registry.json` — add `init-project` to claude domain skills array

- [ ] **Step 1: Write the skill file**

`skills/init-project/SKILL.md`:

```markdown
---
name: init-project
description: Use when setting up void-grimoire in a new project — scaffolds .void-grimoire/ directory with config, schema, and rule templates
depends-on: []
chains-to: null
suggests: []
user-invokable: true
---

# Initialize void-grimoire for a Project

Scaffold the `.void-grimoire/` directory in the current project root with config, schema, empty rule templates, and history directory.

## Process

### Step 1: Check for existing .void-grimoire/

If `.void-grimoire/` already exists at project root:
> ".void-grimoire/ already exists. Want me to overwrite the config and schema (rules and history will be preserved)?"

If user declines, stop.

### Step 2: Scaffold directory structure

Create the following structure at project root:

```
.void-grimoire/
  config.json
  config.schema.json
  rules/
    global.md
    void-grimoire.md
    codebase.md
    design.md
    dev.md
    docs.md
    git.md
    npm.md
    workflow.md
  history/
```

- Copy `config.json` and `config.schema.json` from the plugin's `templates/` directory
- Create each rule file with placeholder content: `<!-- Learned rules for {domain} domain. Managed by learn-correction. -->`
- `global.md` uses: `<!-- Learned rules that apply across all domains. Managed by learn-correction. -->`
- Create `history/` as empty directory (add `.gitkeep` inside it)

### Step 3: Check for stale files

- If `.service-map.json` exists at project root, warn:
  > "Found `.service-map.json` at project root. With void-grimoire initialized, the service map will now be stored at `.void-grimoire/service-map.json`. You can delete the old file."
- If CLAUDE.md contains `<!-- void-grimoire:qmd:enabled -->` or `<!-- void-grimoire:qmd:disabled -->`, warn:
  > "Found qmd preference in CLAUDE.md as HTML comment. This is now configured via `.void-grimoire/config.json` under `features.qmd`. You can remove the HTML comment."

### Step 4: Suggest .gitignore entry

> "Add this to your `.gitignore`:
> ```
> .void-grimoire/service-map.json
> ```
> Config, rules, and history should be committed."

### Step 5: Report

> "void-grimoire initialized. Edit `.void-grimoire/config.json` to configure features:
> - `qmd` — set `enabled: true` and configure `command` if you use qmd
> - `logAccess` — set `enabled: true`, `tool`, and `usage` for debug log access
> - `decisionHistory` — enabled by default, stores brainstorms/plans in `.void-grimoire/history/`
> - `serviceMap` — enabled by default, caches topology in `.void-grimoire/service-map.json`"
```

- [ ] **Step 2: Register in registry.json**

In `skills/registry.json`, add `"init-project"` to the `void-grimoire.skills` array (after `"write-skill"`).

Add `"init"` and `"initialize"` and `"setup"` to the `void-grimoire.triggers` array.

- [ ] **Step 3: Commit**

```bash
git add skills/init-project/SKILL.md skills/registry.json
git commit -m "feat: add init-project skill for scaffolding .void-grimoire/ in consumer projects"
```

---

## Chunk 2: Gate 1 & Entry Point Changes

### Task 4: Update use-void-grimoire for config loading

**Files:**
- Modify: `skills/use-void-grimoire/SKILL.md`

- [ ] **Step 1: Update Gate 1 in the entry point**

Replace the section starting with `### Gate 1: Rules Gate (always runs)` through its content (ending before `### Gate 2`) with:

```markdown
### Gate 1: Rules & Config Gate (always runs)

**Config loading:**
1. Check if `.void-grimoire/config.json` exists at project root
2. If yes — read it. If it fails to parse or doesn't match the schema, warn the user and continue with defaults (do not halt).
3. Config stays in context for downstream skills to reference.

**Rules loading:**
1. If `.void-grimoire/rules/` exists — read `rules/global.md` + `rules/{domain}.md` for each domain matched by the task
2. If `.void-grimoire/rules/` does NOT exist — fall back to plugin's own `rules/global.md` + `rules/{domain}.md`

These are learned corrections from prior sessions — follow them.
```

- [ ] **Step 2: Update Gate 2 to respect serviceMap config**

Replace the section starting with `### Gate 2: Docs & Codebase Gate` through its content (ending before `### Gate 3`) with:

```markdown
### Gate 2: Docs & Codebase Gate
Invoke the following in parallel, then merge outputs:
- `lookup-docs` — always runs
- `map-services` — runs unless config has `features.serviceMap.enabled: false`

Wait for both (or just lookup-docs if service-map is skipped). Documentation findings inform the task context; service-map scope expansion adds mandatory checklist items for affected services. Pass the combined context to Gate 3. Even "no docs found" or "no services detected" are valid results — the point is you looked.
```

- [ ] **Step 3: Commit**

```bash
git add skills/use-void-grimoire/SKILL.md
git commit -m "feat: update using-void-grimoire Gate 1 to load config from .void-grimoire/, Gate 2 to respect serviceMap flag"
```

### Task 5: Update learn-correction to write rules to .void-grimoire/

**Files:**
- Modify: `skills/learn-correction/SKILL.md`

- [ ] **Step 1: Update the Storage Tier Classification section**

Replace the storage tier classification code block with:

```markdown
## Storage Tier Classification

```
Correction detected
  ├─ Specific to THIS project/codebase? → Append to project's CLAUDE.md
  ├─ Specific to a domain (design, git, dev, etc.)?
  │     ├─ .void-grimoire/rules/ exists? → Append to .void-grimoire/rules/{domain}.md
  │     └─ No .void-grimoire/? → Append to plugin's rules/{domain}.md
  └─ General behavior?
        ├─ .void-grimoire/rules/ exists? → Append to .void-grimoire/rules/global.md
        └─ No .void-grimoire/? → Append to plugin's rules/global.md
```

**Decision heuristics:**
- Mentions specific files, paths, or project names → project CLAUDE.md
- About a technology, pattern, or domain practice → rules/{domain}.md
- About communication style, output format, general approach → rules/global.md

**Path resolution:** Always check for `.void-grimoire/rules/` first. If it exists, write there. If not, fall back to the plugin's `rules/` directory. This ensures projects that have run `init-project` get project-scoped rules, while uninitialised projects still work.
```

- [ ] **Step 2: Commit**

```bash
git add skills/learn-correction/SKILL.md
git commit -m "feat: update learn-correction to write rules to .void-grimoire/rules/ when available"
```

---

## Chunk 3: Feature-Aware Skill Updates

### Task 6: Update lookup-docs to use config instead of HTML comments

**Files:**
- Modify: `skills/lookup-docs/SKILL.md`

- [ ] **Step 1: Rewrite the Process section**

Replace the entire `## Process` section with:

```markdown
## Process

### 1. Check qmd config
If `.void-grimoire/config.json` was loaded in Gate 1, read `features.qmd`:
- `enabled: true` → use qmd with the configured `command`
- `enabled: false` or config absent → skip qmd, use local search only

**Deprecated:** The `<!-- void-grimoire:qmd:enabled -->` HTML comment approach in CLAUDE.md is no longer used. If encountered, ignore it and follow config.json.

**Intentional behavior change:** The old interactive "install qmd?" prompt is removed. qmd is now configured explicitly via `init-project` + config.json. This avoids prompting users who don't want qmd on every first run.

### 2. If no config exists and qmd status is unknown
Check if qmd is installed: `which qmd`

If qmd is NOT installed, skip it silently. If installed but no config, use `qmd search` as default command.

**Note:** To configure qmd, run `/skill init-project` and set `features.qmd.enabled: true` in `.void-grimoire/config.json`.

### 3. Search for docs

**If qmd enabled:**
```bash
{configured command} "<task keywords>"
```
If qmd returns results, read the most relevant ones.
If no results, fall through to local search.

**Local search (always runs, qmd or not):**
- Grep README.md, CONTRIBUTING.md for task-related keywords
- Check `docs/` directory for relevant files
- Check inline comments in files the task will touch
- Check for framework/library docs in the project (e.g., `.storybook/`, `typedoc.json`)

### 4. Return findings
Report what was found. "No docs found" is a valid result — the gate passed because you looked.
```

- [ ] **Step 2: Commit**

```bash
git add skills/lookup-docs/SKILL.md
git commit -m "feat: update lookup-docs to read qmd config from .void-grimoire/config.json"
```

### Task 7: Update index-docs to reference config

**Files:**
- Modify: `skills/index-docs/SKILL.md`

- [ ] **Step 1: Add config note to Prerequisites section**

After the existing Prerequisites section, add:

```markdown
**Config:** If `.void-grimoire/config.json` exists and `features.qmd.enabled` is `false`, warn the user:
> "qmd is disabled in your config. Enable it in `.void-grimoire/config.json` under `features.qmd` to use indexed documentation with `lookup-docs`."
```

- [ ] **Step 2: Commit**

```bash
git add skills/index-docs/SKILL.md
git commit -m "feat: update index-docs to check qmd config status"
```

### Task 8: Update debug-systematically for log access

**Files:**
- Modify: `skills/debug-systematically/SKILL.md`

- [ ] **Step 1: Add Log Access section after Phase 1, Step 1 (Read Error Messages Carefully)**

Insert a new subsection in Phase 1, between step 1 ("Read Error Messages Carefully") and step 2 ("Reproduce Consistently"):

```markdown
1b. **Query Project Logs (if configured)**
   If `.void-grimoire/config.json` has `features.logAccess.enabled: true`:
   - Use the configured `tool` and follow the `usage` instructions to query relevant logs
   - Search for error messages, stack traces, or keywords related to the bug
   - This runs BEFORE attempting reproduction — logs may already contain the evidence you need

   If logAccess is not configured, rely on user-provided logs or terminal output as usual.
```

- [ ] **Step 2: Commit**

```bash
git add skills/debug-systematically/SKILL.md
git commit -m "feat: add log access config support to debug-systematically Phase 1"
```

### Task 9: Update map-services for .void-grimoire/ paths

**Files:**
- Modify: `skills/map-services/SKILL.md`

- [ ] **Step 1: Update cache path references**

In the `### On Invocation` section, step 1 ("Check cache"), replace:
```
Read `.service-map.json` at project root.
```
with:
```
Read `.void-grimoire/service-map.json` if `.void-grimoire/` exists, otherwise `.service-map.json` at project root.
```

In step 2 ("Discovery"), replace the "Write results to `.service-map.json`" line with:
```
Write results to `.void-grimoire/service-map.json` if `.void-grimoire/` exists, otherwise `.service-map.json` at project root.
```

In the "Self-Learning" section, update the same path pattern: write to `.void-grimoire/service-map.json` when `.void-grimoire/` exists, fall back to `.service-map.json`.

In the "Forced Re-scan" section, update: delete the appropriate file based on which location exists.

- [ ] **Step 2: Commit**

```bash
git add skills/map-services/SKILL.md
git commit -m "feat: update service-map to use .void-grimoire/service-map.json when available"
```

---

## Chunk 4: Decision History in Workflow Skills

### Task 10: Update brainstorm for decision history

**Files:**
- Modify: `skills/brainstorm/SKILL.md`

- [ ] **Step 1: Update the "After the Design" documentation section**

Replace the lines:
```
- Write the validated design (spec) to `docs/specs/YYYY-MM-DD-<topic>-design.md`
  - (User preferences for spec location override this default)
```
with:
```
- **If `.void-grimoire/config.json` has `features.decisionHistory.enabled: true`:**
  Write the validated design (spec) to `.void-grimoire/history/<initiative>/brainstorm.md`
  - Initiative name: slugify the brainstorm topic to lowercase kebab-case (e.g., "Auth Refactor" → `auth-refactor`). Max 50 characters, alphanumeric + hyphens only. On collision, append `-2`, `-3`, etc.
  - Ask the user to confirm or override the initiative name before writing.
- **Otherwise:** Write to `docs/specs/YYYY-MM-DD-<topic>-design.md`
- (User preferences for spec location override both defaults)
```

Also update step 6 in the Checklist to match:
```
6. **Write design doc** — save to `.void-grimoire/history/<initiative>/brainstorm.md` (if decision history enabled) or `docs/specs/YYYY-MM-DD-<topic>-design.md` (default), and commit
```

- [ ] **Step 2: Commit**

```bash
git add skills/brainstorm/SKILL.md
git commit -m "feat: update brainstorm to write to .void-grimoire/history/ when decision history enabled"
```

### Task 11: Update write-plan for decision history

**Files:**
- Modify: `skills/write-plan/SKILL.md`

- [ ] **Step 1: Update the "Save plans to" line**

Replace:
```
**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`
- (User preferences for plan location override this default)
```
with:
```
**Save plans to:**
- **If decision history enabled** (`.void-grimoire/config.json` → `features.decisionHistory.enabled: true`): `.void-grimoire/history/<initiative>/plan.md` — use the same initiative directory created by brainstorm
- **Otherwise:** `docs/plans/YYYY-MM-DD-<feature-name>.md`
- (User preferences for plan location override both defaults)
```

- [ ] **Step 2: Commit**

```bash
git add skills/write-plan/SKILL.md
git commit -m "feat: update write-plan to write to .void-grimoire/history/ when decision history enabled"
```

### Task 12: Update execute-plan for decision history

**Files:**
- Modify: `skills/execute-plan/SKILL.md`

- [ ] **Step 1: Add implementation record step**

After Step 2 ("Execute Tasks") and before Step 3 ("Complete Development"), add:

```markdown
### Step 2.5: Record Implementation (if decision history enabled)

If `.void-grimoire/config.json` has `features.decisionHistory.enabled: true` and the plan was saved under `.void-grimoire/history/<initiative>/plan.md`:

Write a brief implementation record to `.void-grimoire/history/<initiative>/implementation.md`:

```markdown
# Implementation Record: <initiative name>

**Date:** YYYY-MM-DD
**Plan:** plan.md
**Brainstorm:** brainstorm.md

## What Was Built
- {bullet list of what was implemented}

## Deviations from Plan
- {any changes made during implementation that differed from the plan, or "None"}

## Key Decisions Made During Implementation
- {decisions that came up during coding that weren't in the plan}
```

This record completes the decision chain: brainstorm → plan → implementation.
```

- [ ] **Step 2: Commit**

```bash
git add skills/execute-plan/SKILL.md
git commit -m "feat: update execute-plan to write implementation record to decision history"
```

### Task 13: Update prepare-compact for decision history

**Files:**
- Modify: `skills/prepare-compact/SKILL.md`

- [ ] **Step 1: Add history reference to Step 1**

In Step 1 ("Gather Session Context"), add item 6:

```markdown
6. **Decision history** — if `.void-grimoire/history/` exists, note which initiative(s) were worked on and include their paths in "Key Context" so the next session can read them for full decision chain context
```

- [ ] **Step 2: Commit**

```bash
git add skills/prepare-compact/SKILL.md
git commit -m "feat: update prepare-compact to reference decision history"
```

---

## Chunk 5: Documentation & Cleanup

### Task 14: Update feature-requests.md

**Files:**
- Modify: `docs/feature-requests.md`

- [ ] **Step 1: Add FR-002, FR-003, FR-004**

Append after FR-001:

```markdown

---

## FR-002: Debug Log Access

**Status:** Approved (part of centralized config spec)
**Priority:** Medium
**Date:** 2026-03-15

### Intent

AI should have query access to project logs during debugging. Configured per-project via `config.features.logAccess` with tool name and usage instructions. Supports MCP tools (Sentry, Axiom) or local CLI tools.

### Design

See `docs/specs/2026-03-15-centralized-config-and-features-design.md`

---

## FR-003: Decision History

**Status:** Approved (part of centralized config spec)
**Priority:** Medium
**Date:** 2026-03-15

### Intent

Make existing artifacts (brainstorms, plans, implementations) discoverable across sessions. Artifacts stored in `.void-grimoire/history/<initiative>/` grouped by initiative. Value: context recovery after `/compact`, prevents re-litigating rejected approaches.

### Design

See `docs/specs/2026-03-15-centralized-config-and-features-design.md`

---

## FR-004: Centralized Project Config (`.void-grimoire/`)

**Status:** Approved
**Priority:** High
**Date:** 2026-03-15

### Intent

Unified per-project directory for all plugin state: config, rules, decision history, service map. Replaces scattered locations (root `rules/`, root `.service-map.json`, `docs/superpowers/specs/`, CLAUDE.md HTML comments). Initialized via `init-project` skill. Loaded in Gate 1.

### Design

See `docs/specs/2026-03-15-centralized-config-and-features-design.md`
```

- [ ] **Step 2: Commit**

```bash
git add docs/feature-requests.md
git commit -m "docs: add FR-002 (debug log access), FR-003 (decision history), FR-004 (centralized config)"
```

### Task 15: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add .void-grimoire/ section**

Add a new section after "Get Started" (or after "Service Topology") covering:

- What `.void-grimoire/` is and how to initialize it (`/skill init-project`)
- Brief description of each configurable feature (qmd, logAccess, decisionHistory, serviceMap)
- Link to the spec for details

- [ ] **Step 2: Add init-project to the skill count and claude domain row**

Update the total skill count (increment by 1) and add `init` to the claude domain listing.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add .void-grimoire/ config documentation to README"
```

### Task 16: Update architecture spec with supersedes notes

**Files:**
- Modify: `docs/specs/2026-03-14-void-grimoire-architecture-design.md`

- [ ] **Step 1: Add supersedes notes**

At the top of the relevant sections (Gate 1, Storage Tiers, qmd detection), add:

```markdown
> **Superseded by:** `2026-03-15-centralized-config-and-features-design.md` — Gate 1 now loads config from `.void-grimoire/config.json`, rules from `.void-grimoire/rules/` (with plugin fallback). HTML comment qmd detection is deprecated.
```

- [ ] **Step 2: Add init-project to Section 10 (Skill Frontmatter Reference)**

```yaml
---
name: init-project
description: Use when setting up void-grimoire in a new project — scaffolds .void-grimoire/ directory with config, schema, and rule templates
depends-on: []
chains-to: null
suggests: []
user-invokable: true
---
```

- [ ] **Step 3: Commit**

```bash
git add docs/specs/2026-03-14-void-grimoire-architecture-design.md
git commit -m "docs: add supersedes notes to architecture spec for centralized config changes"
```
