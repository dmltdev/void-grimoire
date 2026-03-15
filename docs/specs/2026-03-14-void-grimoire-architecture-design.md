# Void Grimoire Architecture Design

> **For agentic workers:** REQUIRED: Use workflow:write-plan to create an implementation plan from this spec.

**Goal:** Build a Claude Code plugin that organizes skills by domain, enforces doc-lookup and skill-routing before code actions, supports prompt expansion, and self-learns from user corrections.

**Predecessor:** Superpowers plugin (absorbed fully — workflow skills ported into `workflow:*` namespace).

---

## 1. Plugin Structure

```
void-grimoire/
├── .claude/
│   ├── settings.json
│   └── skills/
│       ├── registry.json
│       │
│       ├── claude_entry-point/
│       ├── claude_route/
│       ├── claude_expand-prompt/
│       ├── claude_learn/
│       ├── claude_write-skill/
│       ├── claude_symlink-skills/
│       │
│       ├── docs_lookup/
│       ├── docs_index/
│       │
│       ├── codebase_service-map/
│       │
│       ├── workflow_brainstorm/
│       ├── workflow_write-plan/
│       ├── workflow_execute-plan/
│       ├── workflow_subagent-dev/
│       ├── workflow_parallel-agents/
│       ├── workflow_verify-before-completion/
│       │
│       ├── dev_tdd/
│       ├── dev_debug/
│       │
│       ├── git_safety/
│       ├── git_commit-push-pr/
│       ├── git_worktrees/
│       ├── git_request-review/
│       ├── git_receive-review/
│       ├── git_finish-branch/
│       │
│       ├── design_frontend-design/
│       ├── design_audit/
│       ├── design_critique/
│       ├── design_adapt/
│       ├── design_animate/
│       ├── design_bolder/
│       ├── design_clarify/
│       ├── design_colorize/
│       ├── design_delight/
│       ├── design_distill/
│       ├── design_extract/
│       ├── design_harden/
│       ├── design_normalize/
│       ├── design_onboard/
│       ├── design_optimize/
│       ├── design_polish/
│       ├── design_quieter/
│       ├── design_teach-design/
│       │
│       └── npm_release-safety/
│
├── hooks/
│   ├── hooks.json
│   ├── run-hook.cmd
│   └── session-start
│
├── rules/
│   ├── global.md
│   ├── design.md
│   ├── git.md
│   ├── dev.md
│   └── workflow.md
│
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
│
├── README.md
└── .gitignore
```

**41 skills across 8 domains:** claude (4), docs (2), codebase (1), workflow (7), dev (2), git (6), design (18), npm (1). `claude:entry-point` is excluded from the count — it is loaded via hook, not routed.

Skill directories use underscore separator: `{domain}_{skill-name}`. Skill names in frontmatter use colon: `{domain}:{skill-name}`.

Supporting files (prompts, references, anti-pattern docs) live inside their respective skill directory alongside SKILL.md.

`.claude/settings.json` defines tool permission policies (allowed/denied Bash patterns), post-tool hooks (e.g., auto-format after Write/Edit), and security restrictions (e.g., deny `env:*`).

---

## 2. Registry

`registry.json` maps domains to trigger keywords, skills, and doc sources. Loaded at session start alongside the entry point. ~600-800 tokens.

```json
{
  "domains": {
    "claude": {
      "description": "Meta skills — plugin management, skill authoring, self-learning",
      "triggers": ["skill", "plugin", "claude", "remember", "learn", "rule"],
      "skills": ["claude:route", "claude:expand-prompt", "claude:learn", "claude:write-skill"],
      "docs": []
    },
    "docs": {
      "description": "Documentation lookup and indexing via qmd",
      "triggers": ["docs", "documentation", "reference", "API docs", "lookup"],
      "skills": ["docs:lookup", "docs:index"],
      "docs": []
    },
    "codebase": {
      "description": "Codebase structure awareness — service topology, dependency graphs",
      "triggers": ["service", "monorepo", "workspace", "service-map", "cross-service", "multi-service"],
      "skills": ["codebase:service-map"],
      "docs": []
    },
    "workflow": {
      "description": "Development pipeline — brainstorm, plan, execute, verify",
      "triggers": ["brainstorm", "plan", "implement", "execute", "verify", "ship", "compact", "session", "summary"],
      "skills": ["workflow:brainstorm", "workflow:write-plan", "workflow:execute-plan", "workflow:subagent-dev", "workflow:parallel-agents", "workflow:verify-before-completion", "workflow:prepare-compact"],
      "docs": []
    },
    "dev": {
      "description": "Development techniques — TDD, debugging, error handling",
      "triggers": ["test", "TDD", "debug", "bug", "error", "fail", "broken", "crash"],
      "skills": ["dev:tdd", "dev:debug"],
      "docs": []
    },
    "git": {
      "description": "Git workflow — commits, branches, PRs, reviews",
      "triggers": ["commit", "push", "PR", "pull request", "branch", "merge", "review", "rebase"],
      "skills": ["git:safety", "git:commit-push-pr", "git:worktrees", "git:request-review", "git:receive-review", "git:finish-branch"],
      "docs": []
    },
    "design": {
      "description": "UI/UX design — frontend, accessibility, visual quality",
      "triggers": ["UI", "UX", "component", "layout", "CSS", "responsive", "a11y", "animation", "color", "design", "frontend", "page", "screen"],
      "skills": ["design:frontend-design", "design:audit", "design:critique", "design:adapt", "design:animate", "design:bolder", "design:clarify", "design:colorize", "design:delight", "design:distill", "design:extract", "design:harden", "design:normalize", "design:onboard", "design:optimize", "design:polish", "design:quieter", "design:teach-design"],
      "docs": []
    },
    "npm": {
      "description": "NPM package management and publishing safety",
      "triggers": ["npm", "publish", "release", "package", "version"],
      "skills": ["npm:release-safety"],
      "docs": []
    }
  }
}
```

---

## 3. Entry Point & Three-Gate Flow

`claude:entry-point` is injected at session start via SessionStart hook. It defines three gates that fire before any code action:

### Gate 1: Rules Gate

> **Superseded by:** `2026-03-15-centralized-config-and-features-design.md` — Gate 1 now loads config from `.void-grimoire/config.json`, rules from `.void-grimoire/rules/` (with plugin fallback). HTML comment qmd detection is deprecated.

Always reads `rules/global.md`. Additionally reads `rules/{domain}.md` for each domain matched by the task. Injects learned corrections into context. Always runs (just file reads, no skill invocation).

### Gate 2: Docs & Codebase Gate
Invoke `docs:lookup` and `codebase:service-map` in parallel. `docs:lookup` searches indexed docs via qmd (or falls back to local Grep/Read). `codebase:service-map` checks for `.service-map.json` cache (or runs discovery) and expands task scope to include affected services. Merge both outputs before Gate 3.

### Gate 3: Domain Gate
Invoke `claude:route`. Match user request against registry triggers. Return list of applicable skills. Agent invokes those skills before acting.

### Flow

```
User message
  → Gate 1: Read rules/{matched domains}.md
  → Gate 2: docs:lookup ‖ codebase:service-map
  → Gate 3: claude:route → invoke matched skills
  → Proceed with task
```

The entry point does NOT contain routing logic, prompt expansion, self-learning, or workflow sequencing. It only defines gates and delegates.

~150-200 lines. Total persistent context (entry point + registry): ~2200-2800 tokens.

---

## 4. Skill Composition Model

### Frontmatter Format

```yaml
---
name: domain:skill-name
description: Use when [triggering conditions — optimized for Claude search]
depends-on: []
chains-to: []
suggests: []
---
```

### Relationship Types

| Field | Type | Enforcement | Meaning |
|-------|------|-------------|---------|
| `depends-on` | Array | Hard — agent MUST invoke these first | Prerequisites |
| `chains-to` | String or null | Hard — skill's terminal state invokes this | Pipeline successor |
| `suggests` | Array | Soft — agent checks domain relevance and decides | Contextual recommendations |

All fields use consistent types: `depends-on` and `suggests` are always arrays (even if single-element). `chains-to` is always a single string (one successor) or omitted/null if the skill is a terminal node.

### Workflow Pipeline (via `chains-to`)

```
workflow:brainstorm
  → workflow:write-plan
    → (skill decides at runtime) workflow:execute-plan OR workflow:subagent-dev
      → workflow:verify-before-completion
        → git:finish-branch
```

**Branching at `workflow:write-plan`:** This skill does NOT use `chains-to` because the successor depends on the plan's characteristics. Instead, `write-plan` has internal logic that chooses:
- `workflow:subagent-dev` — when the plan has 3+ independent tasks suitable for parallel subagent execution
- `workflow:execute-plan` — for sequential plans or plans with fewer than 3 tasks

The skill invokes the chosen successor directly. This is the one place in the pipeline where routing is internal to the skill rather than declared in frontmatter.

### `suggests` Runtime Behavior

1. Skill declares `suggests: [design:critique, dev:tdd]`
2. Agent checks: does the current task match any suggested skill's domain triggers?
3. If yes → invoke that skill
4. If no → skip silently

### Validation Rules

- `chains-to` must be a single string or null (not an array)
- `depends-on` and `suggests` are always arrays
- Circular dependencies in `depends-on` are invalid — entry point detects and warns
- A skill may omit `chains-to` and invoke a successor internally when branching logic is needed (e.g., `workflow:write-plan`)

---

## 5. Self-Learning System

### Detection Signals

| Signal | Confidence | Action |
|--------|------------|--------|
| "Always/never do X" | High | Save inline immediately |
| "Remember this" / "Save this rule" | High | Save inline immediately |
| Same correction twice in session | High | Save inline immediately |
| "No, do it this way instead" | Ambiguous | Queue for batch |
| User edits agent output implicitly (aspirational — requires future diffing mechanism) | Ambiguous | Queue for batch |
| Agent self-detects deviation from prior correction | Ambiguous | Queue for batch |

### Storage Tiers

> **Superseded by:** `2026-03-15-centralized-config-and-features-design.md` — Gate 1 now loads config from `.void-grimoire/config.json`, rules from `.void-grimoire/rules/` (with plugin fallback). HTML comment qmd detection is deprecated.

```
Correction detected
  → Specific to this project? → Save to project CLAUDE.md
  → Specific to a domain? → Save to rules/{domain}.md
  → General? → Save to rules/global.md
```

### Rule Format in `rules/*.md`

```markdown
## Rule title
- **Source:** User correction, YYYY-MM-DD
- **Context:** What the user said / what triggered this
- **Scope:** domain name
```

Append-only. Manual pruning by user or future `claude:prune-rules` skill.

### Batch Prompt

When ambiguous corrections were queued, the agent presents them when the conversation is wrapping up:

> "I noticed these potential rules from our session:
> 1. [correction] — Save to: global / {domain} / project CLAUDE.md / skip?
> 2. [correction] — Save to: global / {domain} / project CLAUDE.md / skip?"

User picks per item. Skipped items are discarded.

**Note:** Batch self-learning is best-effort. If the user closes the terminal without a wind-down cue, queued corrections are lost. Future improvement: persist the queue to disk so it survives session termination and can be presented at next session start.

### Integration with Entry Point

Gate 1 (rules gate) reads `rules/` files matching the task's domain(s) at session start. Learned rules are in context from the beginning.

---

## 6. Doc Gate & QMD Integration

### `docs:lookup` (automatic, via gate 2)

> **Superseded by:** `2026-03-15-centralized-config-and-features-design.md` — Gate 1 now loads config from `.void-grimoire/config.json`, rules from `.void-grimoire/rules/` (with plugin fallback). HTML comment qmd detection is deprecated.

1. Check CLAUDE.md for `<!-- void-grimoire:qmd:enabled -->` or `<!-- void-grimoire:qmd:disabled -->`
2. If no preference found → check if qmd is installed (`which qmd`)
3. If qmd missing → ask user: "qmd is not installed. Want me to set it up, or continue without it?"
4. Save choice to project CLAUDE.md
5. If qmd enabled → `qmd search` with task keywords
6. If qmd disabled → Grep/Read on README.md, docs/, CONTRIBUTING.md, inline comments
7. Return findings (even "no docs found" is valid — the gate passed)

### `docs:index` (explicit, user-invoked)

User runs `/docs:index <url>` or `/docs:index <local-path>`.

- Runs `qmd fetch <url>` + indexes content
- Registers in `registry.json` under the relevant domain's `docs` field
- If qmd not installed, walks user through installation first (install via `go install github.com/tobi/qmd@latest` or see https://github.com/tobi/qmd)

### CLAUDE.md Persistence

```markdown
<!-- void-grimoire:qmd:enabled -->
```
or
```markdown
<!-- void-grimoire:qmd:disabled -->
```

HTML comment format — invisible in rendered markdown, parseable by skills.

---

## 7. Prompt Expansion

`claude:expand-prompt` is explicitly invoked (not part of automatic gates). User calls it for terse or ambiguous requests.

### Process

1. Take user's terse prompt
2. Read registry → identify relevant domains
3. Check `rules/` for applicable learned rules
4. Run `docs:lookup` for relevant context
5. Expand into structured intent:
   - Matched domains and skills
   - Relevant docs and learned rules
   - Decomposed sub-tasks
   - Suggested workflow
6. Present expansion to user for confirmation
7. On approval → proceed into `workflow:brainstorm` with expanded context

### Frontmatter

```yaml
---
name: claude:expand-prompt
description: Use when a user request is terse or ambiguous — expands it with domain context, docs, and learned rules before proceeding
depends-on: [claude:route, docs:lookup]
chains-to: "workflow:brainstorm"
suggests: []
---
```

Key constraint: this skill never acts on the expansion. It only produces it and hands off.

---

## 8. Hooks

### `hooks.json`

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start",
            "async": false
          }
        ]
      }
    ]
  }
}
```

The `matcher` field matches against Claude Code session event types (startup, resume, clear, compact). `run-hook.cmd` is a polyglot wrapper (batch + bash hybrid) that dispatches to the named hook script — enables cross-platform support (Windows via Git Bash/MSYS2/Cygwin, Unix/macOS natively).

SessionStart hook reads `claude:entry-point` SKILL.md + `registry.json` and injects both into session context via `hookSpecificOutput`.

### Design Decisions

- **Self-learning is NOT a hook.** It requires nuanced reasoning that bash can't do. The agent detects corrections; `claude:learn` persists them.
- **Doc gate and domain gate are NOT hooks.** They're skill invocations orchestrated by the entry point. All reasoning stays in markdown.
- **Batch self-learning triggers on conversation wind-down** (user says "thanks", "that's all", "commit and done"), not a hook event. No `SessionEnd` hook exists in Claude Code yet.

### Future Hook Candidates (not v1)

- PostToolUse hook for auto-formatting (already in settings.json)
- SessionEnd hook for batch self-learning (when Claude Code supports it)

---

## 9. Ported Superpowers Skills

All 14 superpowers skills are absorbed into void-grimoire namespaces:

| Superpowers | Void Grimoire | Supporting files |
|---|---|---|
| `brainstorming` | `workflow:brainstorm` | spec-document-reviewer-prompt.md, visual-companion.md |
| `writing-plans` | `workflow:write-plan` | plan-document-reviewer-prompt.md |
| `executing-plans` | `workflow:execute-plan` | — |
| `subagent-driven-development` | `workflow:subagent-dev` | implementer-prompt.md, spec-reviewer-prompt.md, code-quality-reviewer-prompt.md |
| `dispatching-parallel-agents` | `workflow:parallel-agents` | — |
| `verification-before-completion` | `workflow:verify-before-completion` | — |
| `test-driven-development` | `dev:tdd` | testing-anti-patterns.md |
| `systematic-debugging` | `dev:debug` | root-cause-tracing.md, defense-in-depth.md, condition-based-waiting.md |
| `using-git-worktrees` | `git:worktrees` | — |
| `requesting-code-review` | `git:request-review` | code-reviewer.md |
| `receiving-code-review` | `git:receive-review` | — |
| `finishing-a-development-branch` | `git:finish-branch` | — |
| `writing-skills` | `claude:write-skill` | anthropic-best-practices.md, persuasion-principles.md, testing-skills-with-subagents.md |
| `using-superpowers` | `claude:entry-point` | Rewritten for void-grimoire (registry-aware, three-gate flow) |

Skills are ported with content intact. Frontmatter updated to new format (adding `depends-on`, `chains-to`, `suggests`). Internal references to superpowers skill names updated to void-grimoire names.

---

## 10. Skill Frontmatter Reference

Complete frontmatter for all skills with composition relationships:

```yaml
# claude domain (not in registry — loaded via hook)
claude:entry-point       → depends-on: [], chains-to: null, suggests: []

# claude:init (user-invokable setup skill)
---
name: claude:init
description: Use when setting up void-grimoire in a new project — scaffolds .void-grimoire/ directory with config, schema, and rule templates
depends-on: []
chains-to: null
suggests: []
user-invokable: true
---

# claude domain (in registry)
claude:route             → depends-on: [], chains-to: null, suggests: []
claude:expand-prompt     → depends-on: [claude:route, docs:lookup], chains-to: "workflow:brainstorm", suggests: []
claude:learn             → depends-on: [], chains-to: null, suggests: []
claude:write-skill       → depends-on: [], chains-to: null, suggests: []
claude:symlink-skills    → depends-on: [], chains-to: null, suggests: []

# docs domain
docs:lookup              → depends-on: [], chains-to: null, suggests: []
docs:index               → depends-on: [], chains-to: null, suggests: []

# codebase domain
codebase:service-map    → depends-on: [], chains-to: null, suggests: [docs:lookup]

# workflow domain
workflow:brainstorm          → depends-on: [], chains-to: "workflow:write-plan", suggests: [design:critique, design:frontend-design]
workflow:write-plan          → depends-on: [workflow:brainstorm], chains-to: null, suggests: [dev:tdd]
  # chains-to is null: skill decides at runtime between workflow:execute-plan and workflow:subagent-dev
  # (see Section 4 "Branching at workflow:write-plan")
workflow:execute-plan        → depends-on: [workflow:write-plan], chains-to: "workflow:verify-before-completion", suggests: []
workflow:subagent-dev        → depends-on: [workflow:write-plan], chains-to: "workflow:verify-before-completion", suggests: []
workflow:parallel-agents     → depends-on: [], chains-to: null, suggests: []
workflow:verify-before-completion → depends-on: [], chains-to: "git:finish-branch", suggests: []

# dev domain
dev:tdd                  → depends-on: [], chains-to: null, suggests: []
dev:debug                → depends-on: [], chains-to: null, suggests: [dev:tdd]

# git domain
git:safety               → depends-on: [], chains-to: null, suggests: []
git:commit-push-pr       → depends-on: [], chains-to: null, suggests: [git:safety]
git:worktrees            → depends-on: [], chains-to: null, suggests: []
git:request-review       → depends-on: [], chains-to: null, suggests: [git:safety]
git:receive-review       → depends-on: [], chains-to: null, suggests: []
git:finish-branch        → depends-on: [], chains-to: null, suggests: [git:safety]

# design domain — all chains-to: null, suggests: []
# (design skills are invoked via workflow:brainstorm/write-plan suggests or direct user request)

# npm domain
npm:release-safety       → depends-on: [], chains-to: null, suggests: []
```

---

## 11. Context Budget

| Component | Tokens |
|-----------|--------|
| Entry point SKILL.md | ~1500-2000 |
| registry.json | ~600-800 |
| **Total persistent context** | **~2200-2800** |
| Learned rules (per domain file, loaded on demand) | ~200-500 each |
| Individual skill (loaded on invocation) | ~500-2000 each |

Persistent context is well under the 5K budget. Skills and rules are loaded on demand, not kept in persistent context.
