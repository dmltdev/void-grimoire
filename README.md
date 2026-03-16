# Void Grimoire

![Void Grimoire](void-grimoire.webp)

A skill system for Claude Code that enforces structured workflows, learns your conventions, and prevents the most common failure modes of AI-assisted development.

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

## Get Started

The plugin activates automatically. On every message, `claude:using-void-grimoire` runs three gates (rules → docs → routing) before any action is taken — you don't need to invoke it manually.

**To build something new**, just describe what you want:

```
I want to add a dark mode toggle to the settings page
```

The plugin will route you through `workflow:brainstorm` — exploring your intent, asking clarifying questions, and producing a design spec before any code is written. From there, the pipeline chains automatically:

```
brainstorm → write-plan → execute-plan → verify → finish-branch
```

**To fix a bug**, describe the symptom:

```
The sidebar collapses on page refresh
```

The plugin routes to `dev:debug` for systematic root-cause analysis before proposing fixes.

**To invoke a skill directly**, use its full name:

```
/skill workflow:brainstorm
/skill dev:tdd
/skill design:frontend-design
```

**Self-learning** happens automatically. When you correct the AI mid-session ("don't use mocks here", "always use camelCase"), `claude:learn` persists the correction. Next session, it loads automatically.

## Why

AI coding assistants are powerful but undisciplined. They skip research, forget context, ignore your team's patterns, and claim things work without checking. Void Grimoire adds guardrails.

### What It Solves

| Problem | How Void Grimoire Addresses It |
|---------|-------------------------------|
| **AI doesn't understand intent** — jumps to code without grasping the business goal | `workflow:brainstorm` gates all work behind intent exploration, clarifying questions, and design approval before any code is written |
| **Workflow sequencing** — AI codes when it should be researching or planning | Hard-chained pipeline: brainstorm → plan → implement → verify → finish. Skills enforce phase order via `chains-to`; no skipping allowed |
| **Codebase conventions ignored** — AI defaults to generic patterns instead of yours | Three-tier rule system (global → domain → project). `claude:learn` captures corrections mid-session and persists them for future sessions |
| **Verification gap** — AI writes code but never proves it works | `workflow:verify-before-completion` enforces an iron law: no completion claims without fresh evidence (test run, build, lint). `dev:tdd` enforces red-green-refactor |
| **Scope creep & over-engineering** — AI refactors things you didn't ask about | TDD enforces minimal code. Brainstorm decomposes large scopes. Spec compliance reviews catch additions not in the plan |
| **Prompt drift** — instructions degrade over long sessions | Rules are reloaded from disk on every turn via `claude:using-void-grimoire`. Learned corrections persist across sessions, not just within them |
| **Stale mental model** — AI forgets decisions made 20 messages ago | Design specs, implementation plans, and session summaries are written to disk. Decisions survive `/compact` and session boundaries |
| **Handoff friction** — re-establishing context between sessions or tools | `workflow:prepare-compact` generates a session summary with a ready-to-paste continuation prompt. Plans are structured with chunk boundaries for parallel handoff |
| **Topology awareness** — AI doesn't know how services relate | `codebase:service-map` auto-discovers workspace dependencies (pnpm, lerna, Go workspaces), caches a bidirectional graph, and expands task scope to include affected services |

### Known Limitations

| Problem | Status |
|---------|--------|
| **Context window saturation** — large codebases exceed what AI can hold | Partially addressed. Session preservation and on-demand skill loading help, but there's no automatic selective code loading for very large codebases |
| **Multi-repo blindness** — AI only sees the repo it's in | Partially addressed. Service-map covers monorepo workspaces but doesn't span separate Git repositories or trace cross-repo contracts |

## How It Works

Before any code action, three gates fire in order:

1. **Rules Gate** — reads learned rules (`rules/global.md` + `rules/{domain}.md`)
2. **Docs & Codebase Gate** — searches for documentation via [qmd](https://github.com/tobi/qmd) and discovers service topology in parallel
3. **Domain Gate** — matches request against registry triggers, returns applicable skills

Skills declare composition via frontmatter: `depends-on` (hard prereq), `chains-to` (hard successor), `suggests` (soft recommendation).

## Usage

### Workflow Pipeline

For any non-trivial task, the plugin enforces this sequence:

```
brainstorm → write-plan → execute-plan / subagent-dev → verify → finish-branch
```

You can enter at any stage if prior artifacts exist (e.g., you already have a spec).

### Self-Learning

When you correct the AI — "don't mock the database", "always use snake_case for API fields" — the `claude:learn` skill detects the correction and persists it to the appropriate rule file. Next session, that rule loads automatically via Gate 1.

### Service Topology

On first run in a workspace, `codebase:service-map` scans for workspace configs and builds `.service-map.json`. When you touch a service, the plugin expands scope to include its dependents and dependencies so nothing breaks silently.

### Session Continuity

Before running `/compact` or ending a session, invoke `workflow:prepare-compact`. It saves a session summary to `docs/sessions/` with a continuation prompt you can paste into the next session.

## Project Configuration

Initialize void-grimoire in your project to unlock per-project config, learned rules, and decision history:

```
/skill claude:init
```

This creates a `.void-grimoire/` directory with:

- **`config.json`** — feature toggles and tool configuration
- **`rules/`** — learned rules from your sessions (populated by `claude:learn`)
- **`history/`** — decision artifacts grouped by initiative (brainstorms, plans, implementation records)
- **`service-map.json`** — cached workspace topology (gitignored)

### Configurable Features

| Feature | Default | Description |
|---------|---------|-------------|
| `qmd` | disabled | Local hybrid search for markdown notes and docs |
| `logAccess` | disabled | AI queries project logs during debugging (supports MCP tools like Sentry, Axiom) |
| `decisionHistory` | enabled | Stores brainstorms, plans, and implementation records in `.void-grimoire/history/` |
| `serviceMap` | enabled | Auto-discovers workspace topology and caches to `.void-grimoire/service-map.json` |

Edit `.void-grimoire/config.json` to configure. See `docs/specs/2026-03-15-centralized-config-and-features-design.md` for details.

## Domains

| Domain | Skills | Description |
|--------|--------|-------------|
| **workflow** | brainstorm, write-plan, execute-plan, subagent-dev, parallel-agents, verify-before-completion, prepare-compact | End-to-end development lifecycle |
| **design** | 18 skills (frontend-design, audit, critique, polish, animate, etc.) | UI/UX design and implementation |
| **dev** | tdd, debug | Test-driven development and systematic debugging |
| **git** | worktrees, request-review, receive-review, finish-branch, commit-push-pr, safety | Git workflow and code review |
| **docs** | lookup, index | Documentation search and indexing |
| **codebase** | service-map | Codebase structure awareness and service topology |
| **claude** | using-void-grimoire, route, expand-prompt, learn, write-skill, init | Plugin meta-skills and self-learning |
| **npm** | release-safety | Package publishing safety |

**42 skills** total across 8 domains. (`claude:using-void-grimoire` is loaded via hook, not routed.)

## Architecture

See the full spec: [`docs/specs/2026-03-14-void-grimoire-architecture-design.md`](docs/specs/2026-03-14-void-grimoire-architecture-design.md)

## Lore

If you're into fantasy, see [`docs/LORE.md`](docs/LORE.md) for why this plugin is a grimoire.

## License

MIT
