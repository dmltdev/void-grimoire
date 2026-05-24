---
name: lookup-docs
domain: docs
description: Use before any code change to check for relevant documentation — scans qmd, `./openspec/specs/`, `./docs/`, README/CONTRIBUTING, and inline comments. Excludes `./openspec/changes/` by default.
depends-on: []
chains-to: null
suggests: []
---

# Documentation Lookup

Check for relevant documentation before writing code. "No docs found" is a valid result — the gate passed because you looked.

## Sources

1. **qmd index** (if installed)
2. **`./openspec/specs/**/*.md`** — accepted, canonical project specs (treat as first-class docs)
3. **`./docs/**`** + **README.md** + **CONTRIBUTING.md**
4. **Inline comments** in files the task will touch
5. **Framework artifacts** in the project (e.g. `.storybook/`, `typedoc.json`)

**Excluded by default:** `./openspec/changes/**` — in-flight proposals are contradictory and not yet accepted. Only scan them when the caller passes an explicit change name to scope to.

## Process

### 1. Detect qmd
Run `which qmd`. If installed, use `qmd search` as the default search path. If not, skip silently and fall through to local search.

### 2. Search
**If qmd is available AND has an `openspec` or `specs` collection configured:** route openspec-specs queries through qmd first. Only fall back to raw glob if qmd returns zero results.

**Always run local search alongside:**
- Grep `./openspec/specs/**/*.md` (skip if dir absent — non-fatal)
- Grep `README.md`, `CONTRIBUTING.md`, `./docs/**` for task keywords
- Check inline comments in files the task will touch
- Check framework/library docs in the project

**If a change name is explicitly passed:** also scan `./openspec/changes/<name>/**/*.md`.

### 3. Label provenance
- Spec results → `openspec:specs/<capability>`
- Change-scoped results → `openspec:changes/<name>`
- Other results → file path

### 4. Return findings
Report what was found grouped by provenance. If `./openspec/` doesn't exist in the project, silently skip — do not warn or error.

## Key Principle

This gate is about the act of looking, not about finding. Even a negative result means the agent checked before coding.
