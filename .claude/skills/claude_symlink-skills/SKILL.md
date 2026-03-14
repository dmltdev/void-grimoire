---
name: claude:symlink-skills
description: Creates symlinks for a skill from `.agents/skills` into multiple target directories (`.windsurf/skills`, `.claude/skills`, `.opencode/skills`).
depends-on: []
chains-to: null
suggests: []
---

# Symlink Skills

## Overview

This utility creates symlinks for a skill from `.agents/skills` into multiple target directories (`.windsurf/skills`, `.claude/skills`, `.opencode/skills`).

## Usage

```bash
./.agents/skills/symlink-skills/symlink.sh <skill-name>
```

## Examples

```bash
# Symlink a specific skill
./.agents/skills/symlink-skills/symlink.sh commit-push-pr

# Symlink the explore skill
./.agents/skills/symlink-skills/symlink.sh explore

# List available skills
./.agents/skills/symlink-skills/symlink.sh
```

## What it does

1. Checks if the skill exists in `.agents/skills`
2. For each target directory (`.windsurf/skills`, `.claude/skills`, `.opencode/skills`):
   - Removes existing symlink if present
   - Warns if a directory already exists (doesn't overwrite)
   - Creates a symlink from `.agents/skills/<skill-name>` to `<target>/skills/<skill-name>`

## Notes

- The script uses absolute paths (`realpath`) for symlinks to ensure they work correctly
- Existing directories are not overwritten (safety feature)
- Missing target directories are skipped with a warning
