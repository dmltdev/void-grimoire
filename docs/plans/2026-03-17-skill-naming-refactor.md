# Skill Naming Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove `{domain}:` prefix from skill names, add `domain` frontmatter field, enforce `{verb}-{subject}` naming, rename `claude` domain to `void-grimoire`, flatten directory names.

**Architecture:** Pure rename/refactor of markdown, JSON, and directory names. No code, no tests. All skills get new names, new directory names, updated frontmatter, and updated cross-references.

**Tech Stack:** Markdown, JSON, shell (mv commands)

---

## Naming Map

| Old Name | New Name | Domain | Old Dir | New Dir |
|---|---|---|---|---|
| `claude:using-void-grimoire` | `use-void-grimoire` | void-grimoire | `claude_using-void-grimoire` | `use-void-grimoire` |
| `claude:route` | `route-request` | void-grimoire | `claude_route` | `route-request` |
| `claude:expand-prompt` | `expand-prompt` | void-grimoire | `claude_expand-prompt` | `expand-prompt` |
| `claude:learn` | `learn-correction` | void-grimoire | `claude_learn` | `learn-correction` |
| `claude:write-skill` | `write-skill` | void-grimoire | `claude_write-skill` | `write-skill` |
| `claude:init` | `init-project` | void-grimoire | `claude_init` | `init-project` |
| `codebase:service-map` | `map-services` | codebase | `codebase_service-map` | `map-services` |
| `design:frontend-design` | `design-frontend` | design | `design_frontend-design` | `design-frontend` |
| `design:teach-design` | `teach-design` | design | `design_teach-design` | `teach-design` |
| `design:adapt` | `adapt-design` | design | `design_adapt` | `adapt-design` |
| `design:animate` | `animate-design` | design | `design_animate` | `animate-design` |
| `design:audit` | `audit-design` | design | `design_audit` | `audit-design` |
| `design:bolder` | `bolden-design` | design | `design_bolder` | `bolden-design` |
| `design:clarify` | `clarify-design` | design | `design_clarify` | `clarify-design` |
| `design:colorize` | `colorize-design` | design | `design_colorize` | `colorize-design` |
| `design:critique` | `critique-design` | design | `design_critique` | `critique-design` |
| `design:delight` | `delight-design` | design | `design_delight` | `delight-design` |
| `design:distill` | `distill-design` | design | `design_distill` | `distill-design` |
| `design:extract` | `extract-design` | design | `design_extract` | `extract-design` |
| `design:harden` | `harden-design` | design | `design_harden` | `harden-design` |
| `design:normalize` | `normalize-design` | design | `design_normalize` | `normalize-design` |
| `design:onboard` | `design-onboarding` | design | `design_onboard` | `design-onboarding` |
| `design:optimize` | `optimize-design` | design | `design_optimize` | `optimize-design` |
| `design:polish` | `polish-design` | design | `design_polish` | `polish-design` |
| `design:quieter` | `quieten-design` | design | `design_quieter` | `quieten-design` |
| `dev:debug` | `debug-systematically` | dev | `dev_debug` | `debug-systematically` |
| `dev:tdd` | `develop-tdd` | dev | `dev_tdd` | `develop-tdd` |
| `docs:index` | `index-docs` | docs | `docs_index` | `index-docs` |
| `docs:lookup` | `lookup-docs` | docs | `docs_lookup` | `lookup-docs` |
| `git:commit-push-pr` | `commit-push-pr` | git | `git_commit-push-pr` | `commit-push-pr` |
| `git:finish-branch` | `finish-branch` | git | `git_finish-branch` | `finish-branch` |
| `git:receive-review` | `receive-review` | git | `git_receive-review` | `receive-review` |
| `git:request-review` | `request-review` | git | `git_request-review` | `request-review` |
| `git:safety` | `enforce-git-safety` | git | `git_safety` | `enforce-git-safety` |
| `git:worktrees` | `use-worktrees` | git | `git_worktrees` | `use-worktrees` |
| `npm:release-safety` | `enforce-release-safety` | npm | `npm_release-safety` | `enforce-release-safety` |
| `workflow:brainstorm` | `brainstorm` | workflow | `workflow_brainstorm` | `brainstorm` |
| `workflow:write-plan` | `write-plan` | workflow | `workflow_write-plan` | `write-plan` |
| `workflow:execute-plan` | `execute-plan` | workflow | `workflow_execute-plan` | `execute-plan` |
| `workflow:subagent-dev` | `develop-with-subagents` | workflow | `workflow_subagent-dev` | `develop-with-subagents` |
| `workflow:parallel-agents` | `dispatch-parallel-agents` | workflow | `workflow_parallel-agents` | `dispatch-parallel-agents` |
| `workflow:verify-before-completion` | `verify-before-completion` | workflow | `workflow_verify-before-completion` | `verify-before-completion` |
| `workflow:prepare-compact` | `prepare-compact` | workflow | `workflow_prepare-compact` | `prepare-compact` |

---

### Task 1: Rename all skill directories

**Files:** All 43 directories under `void-grimoire/skills/`

**Step 1: Run rename commands**

```bash
cd /Users/dmytro.l/dmltdev/skills/void-grimoire/skills

# void-grimoire domain (was claude)
mv claude_using-void-grimoire use-void-grimoire
mv claude_route route-request
mv claude_expand-prompt expand-prompt
mv claude_learn learn-correction
mv claude_write-skill write-skill
mv claude_init init-project

# codebase
mv codebase_service-map map-services

# design
mv design_frontend-design design-frontend
mv design_teach-design teach-design
mv design_adapt adapt-design
mv design_animate animate-design
mv design_audit audit-design
mv design_bolder bolden-design
mv design_clarify clarify-design
mv design_colorize colorize-design
mv design_critique critique-design
mv design_delight delight-design
mv design_distill distill-design
mv design_extract extract-design
mv design_harden harden-design
mv design_normalize normalize-design
mv design_onboard design-onboarding
mv design_optimize optimize-design
mv design_polish polish-design
mv design_quieter quieten-design

# dev
mv dev_debug debug-systematically
mv dev_tdd develop-tdd

# docs
mv docs_index index-docs
mv docs_lookup lookup-docs

# git
mv git_commit-push-pr commit-push-pr
mv git_finish-branch finish-branch
mv git_receive-review receive-review
mv git_request-review request-review
mv git_safety enforce-git-safety
mv git_worktrees use-worktrees

# npm
mv npm_release-safety enforce-release-safety

# workflow
mv workflow_brainstorm brainstorm
mv workflow_write-plan write-plan
mv workflow_execute-plan execute-plan
mv workflow_subagent-dev develop-with-subagents
mv workflow_parallel-agents dispatch-parallel-agents
mv workflow_verify-before-completion verify-before-completion
mv workflow_prepare-compact prepare-compact
```

**Step 2: Verify all directories renamed**

```bash
ls /Users/dmytro.l/dmltdev/skills/void-grimoire/skills/
```

Expected: no `{domain}_` prefixed directories remain, only flat kebab-case names + registry.json.

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor: rename skill directories to flat kebab-case"
```

---

### Task 2: Update all SKILL.md frontmatter

For every SKILL.md, change frontmatter from:

```yaml
---
name: domain:old-name
description: ...
depends-on: [domain:ref, ...]
chains-to: "domain:ref"
suggests: [domain:ref, ...]
---
```

To:

```yaml
---
name: new-name
domain: domain-name
description: ...
depends-on: [new-ref, ...]
chains-to: "new-ref"
suggests: [new-ref, ...]
---
```

**Process per skill:** Read SKILL.md → update `name` → add `domain` → update all refs in `depends-on`, `chains-to`, `suggests` → update any body text refs to old skill names.

**Cross-reference map** (only skills with non-empty composition fields):

| Skill (new name) | depends-on | chains-to | suggests |
|---|---|---|---|
| `expand-prompt` | `[route-request, lookup-docs]` | `brainstorm` | `[]` |
| `map-services` | `[]` | `null` | `[lookup-docs]` |
| `brainstorm` | `[]` | `write-plan` | `[critique-design, design-frontend]` |
| `write-plan` | `[brainstorm]` | `null` | `[develop-tdd]` |
| `execute-plan` | `[write-plan]` | `verify-before-completion` | `[]` |
| `develop-with-subagents` | `[write-plan]` | `verify-before-completion` | `[]` |
| `verify-before-completion` | `[]` | `finish-branch` | `[]` |
| `debug-systematically` | `[]` | `null` | `[develop-tdd]` |
| `commit-push-pr` | `[]` | `null` | `[enforce-git-safety]` |
| `request-review` | `[]` | `null` | `[enforce-git-safety]` |
| `finish-branch` | `[]` | `null` | `[enforce-git-safety]` |

**Step 1: Update all SKILL.md files**

Use the naming map and cross-reference map above. For each of the 43 SKILL.md files:
1. Read the file
2. Update `name:` field (remove domain prefix)
3. Add `domain:` field after name
4. Update `depends-on`, `chains-to`, `suggests` refs per cross-reference map
5. Search body text for any old-style refs (`domain:skill-name`) and replace with new names

**Parallelize:** All 43 files are independent — dispatch subagents per domain batch (void-grimoire, design, workflow+dev+docs, git+npm+codebase).

**Step 2: Verify no old-style refs remain**

```bash
grep -r 'claude:\|workflow:\|dev:\|docs:\|git:\|design:\|npm:\|codebase:' \
  /Users/dmytro.l/dmltdev/skills/void-grimoire/skills/*/SKILL.md
```

Expected: zero matches (except possibly in description text explaining what the skill does, which should also be updated).

**Step 3: Commit**

```bash
git add -A && git commit -m "refactor: update SKILL.md frontmatter to new naming convention"
```

---

### Task 3: Update registry.json

**File:** `void-grimoire/skills/registry.json`

Replace entire contents with:

```json
{
  "domains": {
    "void-grimoire": {
      "description": "Meta skills — plugin management, skill authoring, self-learning",
      "triggers": ["skill", "plugin", "void-grimoire", "remember", "learn", "rule", "init", "initialize", "setup"],
      "skills": ["use-void-grimoire", "route-request", "expand-prompt", "learn-correction", "write-skill", "init-project"],
      "docs": []
    },
    "docs": {
      "description": "Documentation lookup and indexing via qmd",
      "triggers": ["docs", "documentation", "reference", "API docs", "lookup"],
      "skills": ["lookup-docs", "index-docs"],
      "docs": []
    },
    "codebase": {
      "description": "Codebase structure awareness — service topology, dependency graphs",
      "triggers": ["service", "monorepo", "workspace", "service-map", "cross-service", "multi-service"],
      "skills": ["map-services"],
      "docs": []
    },
    "workflow": {
      "description": "Development pipeline — brainstorm, plan, execute, verify",
      "triggers": ["brainstorm", "plan", "implement", "execute", "verify", "ship", "compact", "session", "summary"],
      "skills": ["brainstorm", "write-plan", "execute-plan", "develop-with-subagents", "dispatch-parallel-agents", "verify-before-completion", "prepare-compact"],
      "docs": []
    },
    "dev": {
      "description": "Development techniques — TDD, debugging, error handling",
      "triggers": ["test", "TDD", "debug", "bug", "error", "fail", "broken", "crash"],
      "skills": ["develop-tdd", "debug-systematically"],
      "docs": []
    },
    "git": {
      "description": "Git workflow — commits, branches, PRs, reviews",
      "triggers": ["commit", "push", "PR", "pull request", "branch", "merge", "review", "rebase"],
      "skills": ["enforce-git-safety", "commit-push-pr", "use-worktrees", "request-review", "receive-review", "finish-branch"],
      "docs": []
    },
    "design": {
      "description": "UI/UX design — frontend, accessibility, visual quality",
      "triggers": ["UI", "UX", "component", "layout", "CSS", "responsive", "a11y", "animation", "color", "design", "frontend", "page", "screen"],
      "skills": ["design-frontend", "audit-design", "critique-design", "adapt-design", "animate-design", "bolden-design", "clarify-design", "colorize-design", "delight-design", "distill-design", "extract-design", "harden-design", "normalize-design", "design-onboarding", "optimize-design", "polish-design", "quieten-design", "teach-design"],
      "docs": []
    },
    "npm": {
      "description": "NPM package management and publishing safety",
      "triggers": ["npm", "publish", "release", "package", "version"],
      "skills": ["enforce-release-safety"],
      "docs": []
    }
  }
}
```

**Commit:**

```bash
git add skills/registry.json && git commit -m "refactor: update registry.json with new skill names and void-grimoire domain"
```

---

### Task 4: Update README.md

**File:** `void-grimoire/README.md`

Changes:
- All `claude:*` refs → new names, domain → `void-grimoire`
- All `workflow:*`, `dev:*`, `design:*`, `git:*`, `docs:*`, `codebase:*`, `npm:*` refs → new names
- Domain table row: `claude` → `void-grimoire`
- Skill invocation examples: `/skill workflow:brainstorm` → `/skill brainstorm`, etc.
- "Get Started" section: update all skill name references

**Commit:**

```bash
git add README.md && git commit -m "docs: update README.md with new skill names"
```

---

### Task 5: Update architecture spec

**File:** `void-grimoire/docs/specs/2026-03-14-void-grimoire-architecture-design.md`

Changes:
- Section 1: directory tree — all `{domain}_{name}/` → `{new-name}/`
- Section 1: skill count text — update domain name from claude to void-grimoire
- Section 2: registry example — update all refs + rename claude key to void-grimoire
- Section 3: all gate flow references (`claude:using-void-grimoire` → `use-void-grimoire`, `claude:route` → `route-request`, `docs:lookup` → `lookup-docs`, `codebase:service-map` → `map-services`)
- Section 4: frontmatter format example — add `domain` field, remove prefix from name
- Section 4: workflow pipeline — all refs
- Section 4: `suggests` example — update refs
- Section 7: prompt expansion — all refs
- Section 9: superpowers porting table — update "Void Grimoire" column
- Section 10: complete frontmatter reference — all entries
- Convention text: "Skill directories use underscore separator: `{domain}_{skill-name}`" → "Skill directories use the skill name directly (flat kebab-case). Domain is specified in SKILL.md frontmatter."

**Commit:**

```bash
git add docs/specs/2026-03-14-void-grimoire-architecture-design.md && git commit -m "docs: update architecture spec with new naming convention"
```

---

### Task 6: Update other spec files

**File:** `void-grimoire/docs/specs/2026-03-15-centralized-config-and-features-design.md`

Changes:
- All `claude:init` → `init-project`, `claude:learn` → `learn-correction`, `claude:using-void-grimoire` → `use-void-grimoire`
- All `dev:debug` → `debug-systematically`, `docs:lookup` → `lookup-docs`, `docs:index` → `index-docs`
- All `codebase:service-map` → `map-services`
- All `workflow:*` → new names
- Directory refs: `skills/claude_init/SKILL.md` → `skills/init-project/SKILL.md`, etc.

**File:** `void-grimoire/docs/specs/2026-03-14-codebase-service-map-design.md`

Changes:
- `codebase:service-map` → `map-services`
- `docs:lookup` → `lookup-docs`
- Directory ref: `.claude/skills/codebase_service-map/` → `skills/map-services/`
- `claude_using-void-grimoire/SKILL.md` → `use-void-grimoire/SKILL.md`

**Commit:**

```bash
git add docs/specs/ && git commit -m "docs: update spec files with new skill names"
```

---

### Task 7: Update project CLAUDE.md

**File:** `/Users/dmytro.l/dmltdev/skills/CLAUDE.md`

Changes:
- Directory convention: `{domain}_{skill-name}` → flat `{skill-name}` (the new name IS the directory name)
- Frontmatter example: add `domain` field, remove `{domain}:` prefix from name
- Registry instruction: skill ref is just `skill-name` now, not `{domain}:{skill-name}`
- Domain Reference table: remove "Prefix" column (no longer relevant), rename claude → void-grimoire
- Removing a Skill: update path format
- Add note about naming convention: `{verb}-{subject}` for ambiguous bare verbs

**Commit:**

```bash
git add /Users/dmytro.l/dmltdev/skills/CLAUDE.md && git commit -m "docs: update project CLAUDE.md with new naming conventions"
```

---

### Task 8: Final verification

**Step 1: Check no old-style refs remain**

```bash
grep -r 'claude:\|workflow:\|dev:\|docs:\|git:\|design:\|npm:\|codebase:' \
  /Users/dmytro.l/dmltdev/skills/void-grimoire/skills/ \
  /Users/dmytro.l/dmltdev/skills/void-grimoire/README.md \
  /Users/dmytro.l/dmltdev/skills/void-grimoire/docs/ \
  /Users/dmytro.l/dmltdev/skills/CLAUDE.md \
  --include='*.md' --include='*.json'
```

Expected: zero matches.

**Step 2: Check no old directory names remain**

```bash
ls /Users/dmytro.l/dmltdev/skills/void-grimoire/skills/ | grep '_'
```

Expected: only `registry.json` (no underscore-prefixed dirs).

**Step 3: Check all SKILL.md have `domain:` field**

```bash
for f in /Users/dmytro.l/dmltdev/skills/void-grimoire/skills/*/SKILL.md; do
  grep -L '^domain:' "$f"
done
```

Expected: no output (all files have domain field).
