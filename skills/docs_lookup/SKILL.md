---
name: docs:lookup
description: Use before any code change to check for relevant documentation — searches via qmd if available, falls back to local file search
depends-on: []
chains-to: null
suggests: []
---

# Documentation Lookup

Check for relevant documentation before writing code. This is Gate 2 of the three-gate flow.

## Process

### 1. Check qmd config
If `.void-grimoire/config.json` was loaded in Gate 1, read `features.qmd`:
- `enabled: true` → use qmd with the configured `command`
- `enabled: false` or config absent → skip qmd, use local search only

**Deprecated:** The `<!-- void-grimoire:qmd:enabled -->` HTML comment approach in CLAUDE.md is no longer used. If encountered, ignore it and follow config.json.

**Intentional behavior change:** The old interactive "install qmd?" prompt is removed. qmd is now configured explicitly via `claude:init` + config.json. This avoids prompting users who don't want qmd on every first run.

### 2. If no config exists and qmd status is unknown
Check if qmd is installed: `which qmd`

If qmd is NOT installed, skip it silently. If installed but no config, use `qmd search` as default command.

**Note:** To configure qmd, run `/skill claude:init` and set `features.qmd.enabled: true` in `.void-grimoire/config.json`.

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

## Key Principle
This gate is about the act of looking, not about finding. Even a negative result means the agent checked before coding.
