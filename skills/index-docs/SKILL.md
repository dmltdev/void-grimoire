---
name: index-docs
domain: docs
description: Use when the user wants to index documentation for qmd search — fetches and indexes URLs or local paths
depends-on: []
chains-to: null
suggests: []
user-invokable: true
args:
  - name: source
    description: URL or local path to index
    required: true
---

# Documentation Indexing

Fetch and index documentation so `lookup-docs` can search it via qmd.

## Prerequisites

qmd must be installed. If not:
```bash
go install github.com/tobi/qmd@latest
```
See https://github.com/tobi/qmd for alternative installation methods.

**Config:** If `.void-grimoire/config.json` exists and `features.qmd.enabled` is `false`, warn the user:
> "qmd is disabled in your config. Enable it in `.void-grimoire/config.json` under `features.qmd` to use indexed documentation with `lookup-docs`."

## Process

1. **Fetch the documentation:**
```bash
qmd fetch <source>
```

2. **Verify indexing:**
```bash
qmd search "test query related to the docs"
```

3. **Register in registry** (optional but recommended):
Identify which domain this documentation belongs to (design, dev, git, etc.) and note it for the user. The registry's `docs` field per domain can be updated to track indexed sources.

## Examples

```bash
# Index a framework's docs
qmd fetch https://tailwindcss.com/docs

# Index local documentation
qmd fetch ./docs/api-reference

# Verify
qmd search "dark mode tailwind"
```
