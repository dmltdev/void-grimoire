# Void Grimoire

![Void Grimoire](void-grimoire.webp)

A small, additive skill library for Claude Code. Covers what generic workflows don't: session journaling, learned-correction persistence, prompt expansion, and a handful of safety and lookup helpers.

This is **not** a workflow framework. It does not enforce phases, gate your work, or auto-inject context. Skills load on demand via the `Skill` tool. Use what you need, ignore the rest.

## Installation

### Claude Code (Marketplace)

```bash
/plugin install void-grimoire@claude-plugins-official
```

### Claude Code (Manual)

```bash
/plugin marketplace add dmltdev/void-grimoire
/plugin install void-grimoire@dmltdev
```

## What You Get

23 skills across 7 domains, plus a 2-agent toolkit and a plugin-local `rules/` reference tree. Pick by name:

| Domain | Skills | Description |
|--------|--------|-------------|
| **void-grimoire** | expand-prompt, learn-correction, autoresearch, token-budget-advisor, strategic-compact | Prompt expansion, self-learning, skill optimization, context discipline |
| **workflow** | verify-requirements, session-summary, session-usage-summary | Requirements validation, session journaling, AI-usage feedback |
| **docs** | lookup-docs, index-docs | Documentation search via [qmd](https://github.com/tobi/qmd), with first-class openspec/specs awareness |
| **codebase** | map-services | Auto-discover monorepo service topology and dependents |
| **git** | enforce-git-safety, commit-push-pr | Block destructive git ops; commit/push/PR helper |
| **npm** | enforce-release-safety | Pre-publish safety checks |
| **patterns** | nestjs-patterns, nextjs-turbopack, postgres-patterns, redis-patterns, mcp-server-patterns, motion-foundations, motion-patterns, motion-ui, motion-advanced | Stack-specific reference skills. Read-on-demand, not auto-loaded. |

### Agents

Read-on-demand subagents under `agents/`:

- **`silent-failure-hunter`** — zero-tolerance review for swallowed errors, empty catch blocks, dangerous fallbacks, broken error propagation.
- **`type-design-analyzer`** — evaluates type design across encapsulation, invariant expression, usefulness, and enforcement.

### Rules

Plugin-local `rules/` reference tree under three buckets: `common/` (language-agnostic baselines), `typescript/` (TS/JS-specific guidance with the matching common baseline inlined), and `web/` (frontend/web-specific guidance with the same flattening). Read on demand; never auto-injected.

### The Headline Skills

- **`session-summary`** — Write a session journal: TL;DR, decisions with trade-offs, accomplishments, unfinished work, files touched. Use before `/compact` or at session end.
- **`session-usage-summary`** — Retrospective on the human-AI loop in this session. Scores spec clarity, decision ownership, verification depth, and correction loops.
- **`learn-correction`** — When you correct the AI ("don't mock the DB", "always use snake_case"), persists the correction to your project's `AGENTS.md` / `CLAUDE.md` so it survives future sessions.
- **`expand-prompt`** — Turn a terse request ("add dark mode") into a structured intent: relevant docs, learned rules, decomposed sub-tasks. Requires explicit user approval before any action.
- **`autoresearch`** — Run a skill repeatedly, score outputs against binary evals, mutate the prompt, keep improvements. Karpathy-style autonomous skill optimization.

## How It Works

Each skill is a `SKILL.md` file with frontmatter (`name`, `description`, `depends-on`, `chains-to`, `suggests`). Skills are loaded on demand — there is no startup hook, no `.void-grimoire/` directory, no forced gate flow.

Composition still works:
- `depends-on` — listed skills must run first
- `chains-to` — the named skill is invoked after this one completes
- `suggests` — soft recommendation, agent checks if relevant

`skills/registry.json` is a domain → skills catalog used for documentation. Claude Code loads relevant skills automatically via their descriptions; invoke any skill by name when you want it explicitly.

## What This Library Is Not

It deliberately does **not** include:
- Brainstorming, planning, TDD, debugging, worktrees, code review, or subagent workflows — those are core engineering skills better served by the [superpowers](https://github.com/obra/superpowers) plugin, which Void Grimoire used to mirror.
- Design skills (frontend, audit, polish, etc.) — those live in the [Impeccable](https://github.com/dwillis/impeccable) plugin and belong with their authors.

If you want any of the above, install those plugins alongside this one.

## Architecture

The original architecture spec described a multi-gate flow with `.void-grimoire/` config, rules, and registry-driven routing. That system has been retired — the spec is kept in `docs/specs/` for historical reference but no longer reflects the plugin.

## Lore

If you're into fantasy, see [`docs/LORE.md`](docs/LORE.md) for why this plugin is a grimoire.

## License

MIT
