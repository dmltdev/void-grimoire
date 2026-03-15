---
name: claude:init
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
    claude.md
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
- Create each rule file with placeholder content: `<!-- Learned rules for {domain} domain. Managed by claude:learn. -->`
- `global.md` uses: `<!-- Learned rules that apply across all domains. Managed by claude:learn. -->`
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
