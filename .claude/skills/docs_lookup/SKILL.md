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

### 1. Check qmd preference
Read the project's CLAUDE.md for `<!-- omniclaude:qmd:enabled -->` or `<!-- omniclaude:qmd:disabled -->`.

### 2. If no preference found
Check if qmd is installed: `which qmd`

If qmd is NOT installed, ask the user ONCE:
> "qmd is not installed. It enables searching indexed documentation (API docs, framework guides, etc.). Want me to set it up, or continue without it?
> - **Install:** I'll run `go install github.com/tobi/qmd@latest` (requires Go)
> - **Skip:** I'll search local docs only (README, docs/, inline comments)"

Save their choice to the project's CLAUDE.md as an HTML comment:
- `<!-- omniclaude:qmd:enabled -->` or `<!-- omniclaude:qmd:disabled -->`

### 3. Search for docs

**If qmd enabled:**
```bash
qmd search "<task keywords>"
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
