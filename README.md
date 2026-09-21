# Void Grimoire

![Void Grimoire](void-grimoire.webp)

Utility skills for coding agents. It covers operational gaps around session journaling, learned-correction persistence, prompt expansion, context discipline, safety checks, lookup helpers, and small workflow assists.

Boundary: this is a utility library, not a product-delivery framework. It does not enforce phases, own acceptance criteria, gate implementation, or maintain hidden project state. Skills load on demand via the `Skill` tool. Use the helper that matches the moment; ignore the rest.

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

### Individual Skills (skills.sh)

Download only the skill you need with [`npx skills`](https://skills.sh/docs):

```bash
npx skills add dmltdev/void-grimoire --skill session-summary
```

Replace `session-summary` with any skill name from the list below.

## What You Get

51 skills physically grouped across 12 domains, plus one repo-local operational skill. Pick by name:

| Domain | Skills | Description |
|--------|--------|-------------|
| **plugin-management** | using-void-grimoire, skill-forge, autoresearch, infer-patterns | Void Grimoire onboarding, skill authoring, optimization, and convention extraction |
| **context** | expand-prompt, learn-correction, failure-memory-compiler | Prompt expansion, learned corrections, and failure-derived operational memory |
| **session** | session-summary, session-usage-summary, session-friction, strategic-compact | Session journaling, usage review, friction capture, context compaction, and handoff preparation |
| **communication** | peer-communication, using-simple-english, brief, engineering-recap, quick-recap, audio-plan, audio-recap | Peer messages, concise summaries, change recaps, status output, and spoken artifacts |
| **planning** | human-typed-plan, design-implementation | Human-owned and approval-gated implementation planning |
| **implementation** | autonomous, ideal-example-clone, refactor-transaction | Autonomous execution, exemplar-driven implementation, and clean refactor cutovers |
| **quality** | unslop, unslop-design, test-with-browser | Code and interface cleanup plus browser-backed UI verification |
| **documentation** | lookup-docs, index-docs, atlas-research, document-ideas, document-adr | Documentation lookup, indexing, research, idea capture, and architecture decisions |
| **reasoning** | five-reasons-why, what-if | Causal analysis and bounded counterfactual exploration |
| **tools** | using-herdr, using-codex, using-omp, omp-plugins, using-adhd, using-agent-browser, using-elevenlabs-tts, using-orx | External CLI and browser wrappers, invocation, preflight, fallbacks, and plugin operations |
| **git** | enforce-git-safety, git-workflow, git-active-remote, git-commit, git-branch-policy, git-push, git-pr, gh-workflow, glab-workflow | Git safety, commit, push, branch policy, and GitHub or GitLab workflows |
| **release** | enforce-release-safety | Package release and publication safety |

### Repo-local operational skill

`.agents/skills/void-install-skills` reinstalls the local plugin into supported harnesses after skill or manifest changes. `.claude/skills` is a symlink to `.agents/skills` so Claude Code sees the same repo-local operational skills.

### The Headline Skills

- **`session-summary`** — Write a session journal: TL;DR, decisions with trade-offs, accomplishments, unfinished work, files touched. Use before `/compact` or at session end.
- **`using-void-grimoire`**: Orient work in this repository, identify canonical sources, preserve the utility-library boundary, apply version policy, and route skill authoring and local installation to their owning skills.
- **`session-usage-summary`** — Retrospective on the human-AI loop in this session. Scores spec clarity, decision ownership, verification depth, and correction loops.
- **`quick-recap`** — Adds the final red/yellow/green status-line convention for finished, pending, or blocked responses.
- **`engineering-recap`**: Reports completed engineering work as Problem, Decision, Check, and Next; use it for delivery summaries and handoffs, not generic document briefs.
- **`document-adr`**: Creates convention-first Architecture Decision Records for accepted or proposed hard-to-reverse decisions.
- **`learn-correction`** — When you correct the AI ("don't mock the DB", "always use snake_case"), persists the correction to your project's `AGENTS.md` / `CLAUDE.md` so it survives future sessions.
- **`expand-prompt`** — Turn a terse request ("add dark mode") into a structured intent: relevant docs, learned rules, decomposed sub-tasks. Requires explicit user approval before any action.
- **`strategic-compact`** — Suggests manual `/compact` at phase boundaries (planning -> implementing -> verifying) so context survives the next phase rather than waiting for arbitrary auto-compaction.
- **`autoresearch`** — Run a skill repeatedly, score outputs against binary evals, mutate the prompt, keep improvements. Karpathy-style autonomous skill optimization.

## How It Works

Each shipped skill is a `skills/<domain>/<skill-name>/SKILL.md` file with frontmatter (`name`, `description`; some older skills also include `depends-on`, `chains-to`, `suggests`). Skills are loaded on demand — there is no startup hook, no `.void-grimoire/` directory, no forced gate flow.

Composition still works:
- `depends-on` — listed skills must run first
- `chains-to` — the named skill is invoked after this one completes
- `suggests` — soft recommendation, agent checks if relevant

The categorized `skills/` directory tree is the single domain map for shipped skills. The README mirrors that structure for humans. Claude Code loads relevant skills automatically via their descriptions; invoke any skill by name when you want it explicitly.

Repo-local operational skills live in `.agents/skills`; `.claude/skills` points there by symlink.

## Boundaries

Void Grimoire deliberately stays small and additive:

- **Utilities, not orchestration.** It helps with prompts, sessions, docs lookup, safety checks, cleanup, and tool use; it does not run a full SDLC.
- **On-demand, not ambient.** No startup hook, no hidden `.void-grimoire/` state directory, no mandatory gate flow.
- **Project-owned truth.** Your repo's tests, docs, schemas, issues, and agent instructions remain authoritative. These skills help find, update, or summarize them; they do not replace them.

## Lore

If you're into fantasy, see [`docs/LORE.md`](docs/LORE.md) for why this plugin is a grimoire.

## License

MIT
