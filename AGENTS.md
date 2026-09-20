# Agent Instructions

## Skills
- When asked to create, change, or delete any skill in this repository, reinstall the affected Void Grimoire skills into all supported local harnesses before reporting completion.
- When asked to create, change, or delete any skill in this repository, update the plugin version in every plugin/package manifest before reinstalling or reporting completion.
- Use `/void-install-skills` for skill installation. Default supported harness targets, when available: Pi, OMP, Claude Code, and Codex.
- Repo-local operational skills belong under `.agents/skills/<skill-name>/SKILL.md`; do not replace requested skill creation with AGENTS.md-only rules.

## Versioning
- Classify version bumps by change scope: use a major version for overhaul-level changes, a minor version for any new skill or significant changes across multiple skills, and a patch version for small changes to one skill, README or documentation changes, and similar maintenance.

## Skill output style
- In skill-authored user-facing output, use commas, semicolons, colons, parentheses, or hyphens instead of em dash characters.
