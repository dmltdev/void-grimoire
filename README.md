# Void Grimoire

Domain-organized skill system for Claude Code with three-gate flow, self-learning, and prompt expansion.

## How It Works
 
Before any code action, three gates fire in order:

1. **Rules Gate** — reads learned rules (`rules/global.md` + `rules/{domain}.md`)
2. **Docs & Codebase Gate** — searches for documentation via [qmd](https://github.com/tobi/qmd) and discovers service topology in parallel
3. **Domain Gate** — matches request against registry triggers, returns applicable skills

Skills declare composition via frontmatter: `depends-on` (hard prereq), `chains-to` (hard successor), `suggests` (soft recommendation).

## Domains

| Domain | Skills | Description |
|--------|--------|-------------|
| **workflow** | brainstorm, write-plan, execute-plan, subagent-dev, parallel-agents, verify-before-completion, prepare-compact | End-to-end development lifecycle |
| **design** | 18 skills (frontend-design, audit, critique, polish, animate, etc.) | UI/UX design and implementation |
| **dev** | tdd, debug | Test-driven development and systematic debugging |
| **git** | worktrees, request-review, receive-review, finish-branch, commit-push-pr, safety | Git workflow and code review |
| **docs** | lookup, index | Documentation search and indexing |
| **codebase** | service-map | Codebase structure awareness and service topology |
| **claude** | entry-point, route, expand-prompt, learn, write-skill | Plugin meta-skills and self-learning |
| **npm** | release-safety | Package publishing safety |

**41 skills** total across 8 domains.

## Installation

### Claude Code (Marketplace)

```bash
/plugin install void-grimoire@claude-plugins-official
```

### Claude Code (Manual)

```bash
/plugin marketplace add dmltdev/void-grimoire-marketplace
/plugin install dmltdev@void-grimoire-marketplace
```

## Architecture

See the full spec: [`docs/specs/2026-03-14-void-grimoire-architecture-design.md`](docs/specs/2026-03-14-void-grimoire-architecture-design.md)

## Lore

If you're into fantasy, see [`docs/LORE.md`](docs/LORE.md) for why this plugin is a grimoire.

## License

MIT
