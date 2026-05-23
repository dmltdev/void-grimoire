---
name: lookup-docs
domain: docs
description: Use before any code change to check for relevant documentation — searches via qmd if available, falls back to local file search
depends-on: []
chains-to: null
suggests: []
---

# Documentation Lookup

Check for relevant documentation before writing code.

## Process

### 1. Detect qmd
Run `which qmd`. If installed, use `qmd search` as the default command. If not, skip silently and fall through to local search.

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
