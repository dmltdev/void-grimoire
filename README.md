# Void Grimoire

![Void Grimoire](void-grimoire.webp)

An additive Claude Code library — skills, agents, and rules. Covers what generic workflows don't: session journaling, learned-correction persistence, prompt expansion, context discipline (token budgets, strategic `/compact`), TypeScript/web rule baselines, plus a handful of safety and lookup helpers.

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

34 skills across 8 domains, plus a 9-agent toolkit and a plugin-local `rules/` reference tree. Pick by name:

| Domain | Skills | Description |
|--------|--------|-------------|
| **void-grimoire** | expand-prompt, learn-correction, autoresearch, strategic-compact, orchestrate-chaos, orchestrate-subagents, mission-control, babysitter-orchestrator, unslop, unslop-design | Prompt expansion, self-learning, skill optimization, context discipline, CHAOS multi-agent dispatch (plain + babysat mode), minimal in-session subagent orchestration, mission-control coordination, babysitter playbook, inline slop classifier, product UI unslopping |
| **tools** | using-herdr, using-codex, using-omp, using-adhd, using-agent-browser, using-chrome-devtools-mcp | External CLI/MCP wrappers — preflight, invocation, fallbacks for herdr, Codex, oh-my-pi, adhd, agent-browser, chrome-devtools-mcp |
| **qa** | test-with-browser | Evidence-based UI verification — drive a browser against acceptance criteria, capture screenshots/console/network, write a report under `.test-results/` |
| **workflow** | verify-requirements, session-summary, session-usage-summary, session-friction, grill-me, grill-me-fast, grill-with-docs, docs-source-of-truth, ideal-example-clone | Requirements validation, session journaling, AI-usage feedback, append-only friction log for correction events, plan-grilling, fast batched plan-grilling, DDD-shaped docs-as-source-of-truth workflow, and ideal-example cloning from code-first exemplars |
| **docs** | lookup-docs, index-docs | Documentation search via [qmd](https://github.com/tobi/qmd), with first-class openspec/specs awareness |
| **git** | enforce-git-safety, commit-push-pr, create-pr | Block destructive git ops; commit/push/PR helper; concise risk-sized PR body rubric |
| **npm** | enforce-release-safety | Pre-publish safety checks |
| **concilium** | convene-concilium, verify-and-correct | Multi-lens parallel code review (correctness, security, maintainability, scalability) plus evidence-gated self-correction. Pragmatic, non-blocking. |

### Agents

Read-on-demand subagents under `agents/`:

- **`silent-failure-hunter`** — zero-tolerance review for swallowed errors, empty catch blocks, dangerous fallbacks, broken error propagation.
- **`type-design-analyzer`** — evaluates type design across encapsulation, invariant expression, usefulness, and enforcement.
- **`herdr-orchestrator`** — coordinator for multi-pane parallel work in a herdr workspace. Decomposes goals, spawns worker Claude / omp / adhd instances in sibling panes, monitors, aggregates. Driven by `orchestrate-chaos`.
- **`babysitter-orchestrator`** — context/session babysitter for persistent orchestrators. Watches phase drift, context decay, verifier failures, and prompt quality; writes verifier/relaunch prompts into a `.chaos/interventions.md` audit trail. Spawned as a sibling pane by babysat `orchestrate-chaos`.

The **concilium** — four pragmatic, read-only reviewer lenses dispatched in parallel by `convene-concilium`, each citing the shared `quality-dimensions.md` bar:

- **`dev-in-test`** — correctness, edge cases, silent failures, test presence/quality.
- **`dev-in-security`** — secrets, injection, authz, unsafe sinks, dependency risk (OWASP-class).
- **`dev-in-maintainability`** — readability, type design, documentation, code-standards (one folded lens).
- **`dev-in-scalability`** — performance hot paths, data-access patterns, resource/cost, concurrency.

And the verifier that proves work instead of judging it:

- **`adversarial-verifier`** — evidence-gated QA. Proves a change works by *running* it (tests, app/CLI, lint) and citing the output; refuses to PASS without execution. Driven by `verify-and-correct` in a bounded verify → fix → re-verify → escalate cycle.

### Rules

Plugin-local `rules/` reference tree under three buckets: `common/` (language-agnostic baselines), `typescript/` (TS/JS-specific guidance with the matching common baseline inlined), and `web/` (frontend/web-specific guidance with the same flattening). Read on demand; never auto-injected.

### The Headline Skills

- **`session-summary`** — Write a session journal: TL;DR, decisions with trade-offs, accomplishments, unfinished work, files touched. Use before `/compact` or at session end.
- **`session-usage-summary`** — Retrospective on the human-AI loop in this session. Scores spec clarity, decision ownership, verification depth, and correction loops.
- **`learn-correction`** — When you correct the AI ("don't mock the DB", "always use snake_case"), persists the correction to your project's `AGENTS.md` / `CLAUDE.md` so it survives future sessions.
- **`expand-prompt`** — Turn a terse request ("add dark mode") into a structured intent: relevant docs, learned rules, decomposed sub-tasks. Requires explicit user approval before any action.
- **`strategic-compact`** — Suggests manual `/compact` at phase boundaries (planning -> implementing -> verifying) so context survives the next phase rather than waiting for arbitrary auto-compaction.
- **`autoresearch`** — Run a skill repeatedly, score outputs against binary evals, mutate the prompt, keep improvements. Karpathy-style autonomous skill optimization.

## How It Works

Each skill is a `SKILL.md` file with frontmatter (`name`, `description`, `depends-on`, `chains-to`, `suggests`). Skills are loaded on demand — there is no startup hook, no `.void-grimoire/` directory, no forced gate flow.

Composition still works:
- `depends-on` — listed skills must run first
- `chains-to` — the named skill is invoked after this one completes
- `suggests` — soft recommendation, agent checks if relevant

`skills/registry.json` is a domain → skills catalog used for documentation. Claude Code loads relevant skills automatically via their descriptions; invoke any skill by name when you want it explicitly.

## What This Library Is Not

It deliberately does **not** enforce workflows by default. Orchestration skills are opt-in control-plane helpers; they do not create startup hooks, mandatory gates, or hidden state.

Most design/audit/polish skills still live in the Impeccable plugin and belong with their authors. `unslop-design` is the narrow exception: a product-workflow redesign helper for rough SaaS/admin screens.

## Architecture

The original architecture spec described a multi-gate flow with `.void-grimoire/` config, rules, and registry-driven routing. That system has been retired — the spec is kept in `docs/specs/` for historical reference but no longer reflects the plugin.

## Lore

If you're into fantasy, see [`docs/LORE.md`](docs/LORE.md) for why this plugin is a grimoire.

## License

MIT
