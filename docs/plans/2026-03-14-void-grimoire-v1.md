# Void Grimoire v1 Implementation Plan

> **For Claude:** REQUIRED: Use execute-plan or develop-with-subagents to implement this plan task-by-task.

**Goal:** Build the void-grimoire Claude Code plugin — a domain-organized skill system with three-gate flow (rules → docs → routing), self-learning, and prompt expansion.

**Architecture:** Thin entry point injected at session start with registry. Three gates (rules, docs, routing) fire before code actions. Skills declare composition via `depends-on`, `chains-to`, `suggests` frontmatter. Superpowers workflow ported into namespaced domains.

**Tech Stack:** Markdown (SKILL.md), JSON (registry), Bash (hooks), qmd (doc indexing)

**Spec:** `docs/specs/2026-03-14-void-grimoire-architecture-design.md`

**Source for porting:** `/Users/dmytro.l/dmltdev/skills/superpowers/`

---

## Reference: Skill Name Mapping (Superpowers → Void Grimoire)

All ported skills must replace these references throughout their content:

| Old reference | New reference |
|---|---|
| `superpowers:brainstorming` / `brainstorming` | `brainstorm` |
| `superpowers:writing-plans` / `writing-plans` | `write-plan` |
| `superpowers:executing-plans` / `executing-plans` | `execute-plan` |
| `superpowers:subagent-driven-development` / `subagent-driven-development` | `develop-with-subagents` |
| `superpowers:dispatching-parallel-agents` / `dispatching-parallel-agents` | `dispatch-parallel-agents` |
| `superpowers:verification-before-completion` / `verification-before-completion` | `verify-before-completion` |
| `superpowers:test-driven-development` / `test-driven-development` | `develop-tdd` |
| `superpowers:systematic-debugging` / `systematic-debugging` | `debug-systematically` |
| `superpowers:using-git-worktrees` / `using-git-worktrees` | `use-worktrees` |
| `superpowers:requesting-code-review` / `requesting-code-review` | `request-review` |
| `superpowers:receiving-code-review` / `receiving-code-review` | `receive-review` |
| `superpowers:finishing-a-development-branch` / `finishing-a-development-branch` | `finish-branch` |
| `superpowers:writing-skills` / `writing-skills` | `write-skill` |
| `superpowers:using-superpowers` / `using-superpowers` | `use-void-grimoire` |
| `superpowers:code-reviewer` | `request-review` |
| `docs/superpowers/specs/` | `docs/specs/` |
| `docs/superpowers/plans/` | `docs/plans/` |

---

### Task 1: Infrastructure — Registry, Rules, Hooks

**Files:**
- Create: `.claude/skills/registry.json`
- Create: `rules/global.md`
- Create: `rules/design.md`
- Create: `rules/git.md`
- Create: `rules/dev.md`
- Create: `rules/workflow.md`
- Create: `hooks/hooks.json`
- Create: `hooks/run-hook.cmd`
- Create: `hooks/session-start`

All paths relative to `/Users/dmytro.l/dmltdev/skills/void-grimoire/`.

- [ ] **Step 1: Create `registry.json`**

Create `.claude/skills/registry.json` with the full registry from the spec (Section 2). Copy it verbatim — it includes all 7 domains with their triggers, skills arrays, and empty docs arrays.

- [ ] **Step 2: Create empty rule files**

Create `rules/` directory with these files, each containing only a header:

`rules/global.md`:
```markdown
# Global Rules

<!-- Learned rules that apply across all domains. Managed by learn-correction. -->
```

Repeat for ALL 7 domains: `rules/design.md` (`# Design Rules`), `rules/git.md` (`# Git Rules`), `rules/dev.md` (`# Dev Rules`), `rules/workflow.md` (`# Workflow Rules`), `rules/docs.md` (`# Docs Rules`), `rules/void-grimoire.md` (`# Void Grimoire Rules`), `rules/npm.md` (`# NPM Rules`). Same comment format in each.

- [ ] **Step 3: Create `hooks/hooks.json`**

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

- [ ] **Step 4: Create `hooks/run-hook.cmd`**

Copy from `/Users/dmytro.l/dmltdev/skills/superpowers/hooks/run-hook.cmd` verbatim. This is the polyglot batch+bash wrapper — no modifications needed.

- [ ] **Step 5: Create `hooks/session-start`**

Copy from `/Users/dmytro.l/dmltdev/skills/superpowers/hooks/session-start`. Then modify:
- Change the skill path from `skills/using-superpowers/SKILL.md` to `.claude/skills/use-void-grimoire/SKILL.md`
- Add registry injection: after reading the SKILL.md content, also read the registry:
  ```bash
  REGISTRY=$(cat "$PLUGIN_ROOT/.claude/skills/registry.json")
  CONTENT="$SKILL_CONTENT\n\n## Domain Registry\n\n\`\`\`json\n$REGISTRY\n\`\`\`"
  ```
  Append the registry to the same `hookSpecificOutput` additionalContext string
- Update any references to "superpowers" in output messages to "void-grimoire"
- Keep platform detection logic (Claude Code vs others) intact

Make the script executable: `chmod +x hooks/session-start`

- [ ] **Step 6: Verify**

Run: `cat hooks/hooks.json | python3 -m json.tool`
Expected: Valid JSON, no errors

Run: `cat .claude/skills/registry.json | python3 -m json.tool`
Expected: Valid JSON, no errors

Run: `bash -n hooks/session-start`
Expected: No syntax errors

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/registry.json rules/ hooks/
git commit -m "feat: add infrastructure — registry, rules, hooks"
```

---

### Task 2: `use-void-grimoire` — Session Orchestrator

**Files:**
- Create: `.claude/skills/use-void-grimoire/SKILL.md`

This is written from scratch (not ported). It replaces `using-superpowers`.

- [ ] **Step 1: Write `SKILL.md`**

```markdown
---
name: use-void-grimoire
description: Use when starting any conversation — establishes three-gate flow (rules, docs, routing) and loads the domain registry
depends-on: []
chains-to: null
suggests: []
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.
</EXTREMELY-IMPORTANT>

## Instruction Priority

1. **User's explicit instructions** (CLAUDE.md, GEMINI.md, AGENTS.md, direct requests) — highest priority
2. **Void Grimoire skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

## Three-Gate Flow

Before ANY code change or implementation action, you MUST run these gates in order:

### Gate 1: Rules Gate (always runs)
Read `rules/global.md`. Additionally read `rules/{domain}.md` for each domain matched by the task. These are learned corrections from prior sessions — follow them.

### Gate 2: Doc Gate
Invoke `lookup-docs` with the task context. This checks for relevant documentation (via qmd or local file fallback). Even "no docs found" is a valid result — the point is you looked.

### Gate 3: Domain Gate
Invoke `route-request` with the user's request. It matches against the registry and returns applicable skills. Invoke those skills before acting.

<HARD-GATE>
Do NOT write code, modify files, or take implementation actions until all three gates have been evaluated. The gates can be fast (a few file reads), but they MUST run.
</HARD-GATE>

## Skill Composition

Skills declare relationships in their frontmatter:
- **`depends-on`** — hard prerequisite. You MUST invoke these before the skill.
- **`chains-to`** — hard successor. The skill's terminal state invokes this next skill.
- **`suggests`** — soft. Check if the suggested skill's domain matches the current task. If yes, invoke it.

## The Rule

**Invoke relevant skills BEFORE any response or action.** Even a 1% chance a skill applies = invoke it.

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "The skill is overkill" | Simple things become complex. Use it. |

## Skill Priority

When multiple skills could apply:
1. **Process skills first** (brainstorm, debug-systematically) — these determine HOW to approach
2. **Implementation skills second** (design-frontend, develop-tdd) — these guide execution

## Self-Learning Detection

Watch for correction signals during conversation:
- **High-confidence** (save inline): "always/never do X", "remember this", same correction twice
- **Ambiguous** (queue for batch): "no, do it this way instead", implicit preference changes

When you detect a correction, invoke `learn-correction` to persist it.

When the conversation is winding down ("thanks", "that's all", "commit and done"), check if any ambiguous corrections were queued. If so, present them for the user to classify.

## Skill Types

**Rigid** (develop-tdd, debug-systematically): Follow exactly. Don't adapt away discipline.
**Flexible** (design patterns): Adapt principles to context.
```

- [ ] **Step 2: Verify frontmatter**

Run: `head -6 .claude/skills/use-void-grimoire/SKILL.md`
Expected: Valid YAML frontmatter with name, description, depends-on, chains-to, suggests

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/use-void-grimoire/
git commit -m "feat: add use-void-grimoire skill — session orchestrator with three-gate flow"
```

---

### Task 3: `route-request` — Domain Matching

**Files:**
- Create: `.claude/skills/route-request/SKILL.md`

- [ ] **Step 1: Write `SKILL.md`**

```markdown
---
name: route-request
description: Use when determining which domain skills apply to a user request — matches against registry triggers and returns applicable skills
depends-on: []
chains-to: null
suggests: []
---

# Domain Routing

Match a user request against the domain registry to identify applicable skills.

## Process

1. **Read the registry** — `registry.json` is loaded at session start. Each domain has trigger keywords.

2. **Match domains** — Compare the user's request against each domain's triggers. A domain matches if ANY of its trigger keywords appear in or are semantically relevant to the request. Be generous — it's better to match an extra domain than to miss one.

3. **Collect skills** — For each matched domain, gather all skills from that domain's `skills` array.

4. **Filter by relevance** — From the collected skills, identify which specific skills are relevant to the task. Not every skill in a matched domain applies. Read each skill's `description` field to decide.

5. **Return results** — Report matched domains and applicable skills to the caller.

## Matching Rules

- Match on semantic relevance, not just exact keyword match. "add a login page" should match `design` (it's a page) and `dev` (it's a feature) even though "login" isn't a trigger.
- When uncertain, include the domain. False positives (checking an irrelevant skill) are cheap. False negatives (missing a relevant skill) cause real problems.
- The `workflow` domain matches when the task is a new feature, project, or multi-step change. It does NOT match for quick fixes, questions, or single-file edits.
- The `void-grimoire` domain only matches for meta-tasks (creating skills, managing the plugin, remembering rules).

## Output Format

After routing, announce which domains and skills matched:
> "Matched domains: design, dev. Applicable skills: design-frontend, develop-tdd."

Then invoke each applicable skill.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/route-request/
git commit -m "feat: add route-request skill — domain matching against registry"
```

---

### Task 4: `lookup-docs` and `index-docs`

**Files:**
- Create: `.claude/skills/lookup-docs/SKILL.md`
- Create: `.claude/skills/index-docs/SKILL.md`

- [ ] **Step 1: Write `lookup-docs` SKILL.md**

```markdown
---
name: lookup-docs
description: Use before any code change to check for relevant documentation — searches via qmd if available, falls back to local file search
depends-on: []
chains-to: null
suggests: []
---

# Documentation Lookup

Check for relevant documentation before writing code. This is Gate 2 of the three-gate flow.

## Process

### 1. Check qmd preference
Read the project's CLAUDE.md for `<!-- void-grimoire:qmd:enabled -->` or `<!-- void-grimoire:qmd:disabled -->`.

### 2. If no preference found
Check if qmd is installed: `which qmd`

If qmd is NOT installed, ask the user ONCE:
> "qmd is not installed. It enables searching indexed documentation (API docs, framework guides, etc.). Want me to set it up, or continue without it?
> - **Install:** I'll run `go install github.com/tobi/qmd@latest` (requires Go)
> - **Skip:** I'll search local docs only (README, docs/, inline comments)"

Save their choice to the project's CLAUDE.md as an HTML comment:
- `<!-- void-grimoire:qmd:enabled -->` or `<!-- void-grimoire:qmd:disabled -->`

### 3. Search for docs

**If qmd enabled:**
```bash
qmd search "<task keywords>"
```
If qmd returns results, read the most relevant ones.
If no results, fall through to local search.

**Local search (always runs, qmd or not):**
- Grep README.md, CONTRIBUTING.md for task-related keywords
- Check `docs/` directory for relevant files
- Check inline comments in files the task will touch
- Check for framework/library docs in the project (e.g., `.storybook/`, `typedoc.json`)

### 4. Return findings
Report what was found. "No docs found" is a valid result — the gate passed because you looked.

## Key Principle
This gate is about the act of looking, not about finding. Even a negative result means the agent checked before coding.
```

- [ ] **Step 2: Write `index-docs` SKILL.md**

```markdown
---
name: index-docs
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
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/lookup-docs/ .claude/skills/index-docs/
git commit -m "feat: add lookup-docs and index-docs skills — qmd integration with local fallback"
```

---

### Task 5: `learn-correction` — Self-Learning

**Files:**
- Create: `.claude/skills/learn-correction/SKILL.md`

- [ ] **Step 1: Write `SKILL.md`**

```markdown
---
name: learn-correction
description: Use when a user corrects agent behavior — persists the correction as a rule to the appropriate scope (global, domain, or project CLAUDE.md)
depends-on: []
chains-to: null
suggests: []
---

# Self-Learning from Corrections

Persist user corrections as rules so the same mistake is not repeated in future sessions.

## When to Invoke

### High-confidence (save inline immediately)
- User says "always do X" or "never do Y"
- User says "remember this" or "save this rule"
- Same correction given twice in one session

### Ambiguous (queue for batch at session end)
- User says "no, do it this way instead" (could be one-off)
- User implicitly changes agent output (aspirational — requires future diffing mechanism)
- Agent self-detects it deviated from a prior correction

## Storage Tier Classification

```
Correction detected
  ├─ Specific to THIS project/codebase? → Append to project's CLAUDE.md
  ├─ Specific to a domain (design, git, dev, etc.)? → Append to rules/{domain}.md
  └─ General behavior? → Append to rules/global.md
```

**Decision heuristics:**
- Mentions specific files, paths, or project names → project CLAUDE.md
- About a technology, pattern, or domain practice → rules/{domain}.md
- About communication style, output format, general approach → rules/global.md

## Rule Format

Append to the appropriate file:

```markdown
## [Rule title — imperative, e.g., "Use Tailwind classes instead of inline styles"]
- **Source:** User correction, YYYY-MM-DD
- **Context:** [What the user said or what triggered this]
- **Scope:** [domain name or "global"]
```

## Batch Prompt (session wind-down)

When the conversation is ending and ambiguous corrections are queued:

> "I noticed these potential rules from our session:
> 1. [correction summary] — **Save to:** global / [matched domain] / project CLAUDE.md / skip?
> 2. [correction summary] — **Save to:** global / [matched domain] / project CLAUDE.md / skip?"

User picks per item. Skipped items are discarded.

**Note:** Batch learning is best-effort. If the session ends without a wind-down cue, queued corrections are lost. Future improvement: persist the queue to disk.

## Rules Are Append-Only

Never edit or remove existing rules automatically. The user or a future `prune-rules` skill handles cleanup.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/learn-correction/
git commit -m "feat: add learn-correction skill — self-learning from user corrections"
```

---

### Task 6: `expand-prompt` — Prompt Expansion

**Files:**
- Create: `.claude/skills/expand-prompt/SKILL.md`

- [ ] **Step 1: Write `SKILL.md`**

```markdown
---
name: expand-prompt
description: Use when a user request is terse or ambiguous — expands it with domain context, docs, and learned rules before proceeding
depends-on: [route-request, lookup-docs]
chains-to: "brainstorm"
suggests: []
user-invokable: true
args:
  - name: prompt
    description: The terse prompt to expand (or uses the last user message if omitted)
    required: false
---

# Prompt Expansion

Take a terse user request and flesh it out with domain context, documentation, and learned rules before handing off to brainstorming.

## When to Use

- User gives a short, ambiguous request ("add dark mode", "fix the auth bug")
- User explicitly invokes `/expand-prompt`
- Agent is unsure what the user wants and needs to expand before brainstorming

## Process

1. **Identify domains** — Run `route-request` (dependency) to match the request against registry triggers.

2. **Gather context:**
   - Read `rules/global.md` + `rules/{matched domains}.md` for learned rules
   - Run `lookup-docs` (dependency) for relevant documentation
   - Check recent git history for related changes

3. **Expand the prompt** into a structured intent:
   ```
   Original: "<user's terse prompt>"

   Expanded:
   - Domains: [matched domains]
   - Applicable skills: [skills from routing]
   - Relevant docs: [findings from lookup-docs]
   - Learned rules: [applicable rules]
   - Decomposed sub-tasks:
     1. [sub-task]
     2. [sub-task]
     ...
   - Suggested workflow: brainstorm → write-plan → ...
   ```

4. **Present to user** for confirmation. They can approve, modify, or reject.

5. **On approval** → proceed into `brainstorm` (chains-to) with the expanded context.

## Key Constraint

This skill NEVER acts on the expansion. It only produces the expanded intent and hands off. Implementation happens through the normal workflow pipeline.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/expand-prompt/
git commit -m "feat: add expand-prompt skill — prompt expansion with domain context"
```

---

### Task 7: Port Workflow Skills (6 skills)

**Files:**
- Create: `.claude/skills/brainstorm/` (copy from superpowers `brainstorming/`)
- Create: `.claude/skills/write-plan/` (copy from superpowers `writing-plans/`)
- Create: `.claude/skills/execute-plan/` (copy from superpowers `executing-plans/`)
- Create: `.claude/skills/develop-with-subagents/` (copy from superpowers `subagent-driven-development/`)
- Create: `.claude/skills/dispatch-parallel-agents/` (copy from superpowers `dispatching-parallel-agents/`)
- Create: `.claude/skills/verify-before-completion/` (copy from superpowers `verification-before-completion/`)

**Source:** `/Users/dmytro.l/dmltdev/skills/superpowers/skills/`

For ALL 6 skills, apply these transformations:

- [ ] **Step 1: Copy files**

For each skill, copy the entire directory contents (SKILL.md + all supporting files):

```bash
SP="/Users/dmytro.l/dmltdev/skills/superpowers/skills"
OC="/Users/dmytro.l/dmltdev/skills/void-grimoire/.claude/skills"

# brainstorming → brainstorm
mkdir -p "$OC/brainstorm"
cp "$SP/brainstorming/SKILL.md" "$OC/brainstorm/"
cp "$SP/brainstorming/spec-document-reviewer-prompt.md" "$OC/brainstorm/"
cp "$SP/brainstorming/visual-companion.md" "$OC/brainstorm/"
cp -r "$SP/brainstorming/scripts" "$OC/brainstorm/"

# writing-plans → write-plan
mkdir -p "$OC/write-plan"
cp "$SP/writing-plans/SKILL.md" "$OC/write-plan/"
cp "$SP/writing-plans/plan-document-reviewer-prompt.md" "$OC/write-plan/"

# executing-plans → execute-plan
mkdir -p "$OC/execute-plan"
cp "$SP/executing-plans/SKILL.md" "$OC/execute-plan/"

# subagent-driven-development → develop-with-subagents
mkdir -p "$OC/develop-with-subagents"
cp "$SP/subagent-driven-development/SKILL.md" "$OC/develop-with-subagents/"
cp "$SP/subagent-driven-development/implementer-prompt.md" "$OC/develop-with-subagents/"
cp "$SP/subagent-driven-development/spec-reviewer-prompt.md" "$OC/develop-with-subagents/"
cp "$SP/subagent-driven-development/code-quality-reviewer-prompt.md" "$OC/develop-with-subagents/"

# dispatching-parallel-agents → dispatch-parallel-agents
mkdir -p "$OC/dispatch-parallel-agents"
cp "$SP/dispatching-parallel-agents/SKILL.md" "$OC/dispatch-parallel-agents/"

# verification-before-completion → verify-before-completion
mkdir -p "$OC/verify-before-completion"
cp "$SP/verification-before-completion/SKILL.md" "$OC/verify-before-completion/"
```

- [ ] **Step 2: Update frontmatter for all 6 skills**

Replace the existing frontmatter in each SKILL.md with the new format. The name and composition fields for each:

**brainstorm:**
```yaml
---
name: brainstorm
description: Use when starting any feature, change, or project — explores intent and produces a design spec before any implementation
depends-on: []
chains-to: "write-plan"
suggests: [critique-design, design-frontend]
---
```

**write-plan:**
```yaml
---
name: write-plan
description: Use when you have a spec or requirements for a multi-step task, before touching code
depends-on: [brainstorm]
chains-to: null
suggests: [develop-tdd]
---
```
Note: `chains-to` is null because this skill decides at runtime between `execute-plan` (sequential/fewer than 3 tasks) and `develop-with-subagents` (3+ independent tasks).

**execute-plan:**
```yaml
---
name: execute-plan
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
depends-on: [write-plan]
chains-to: "verify-before-completion"
suggests: []
---
```

**develop-with-subagents:**
```yaml
---
name: develop-with-subagents
description: Use when executing implementation plans with independent tasks in the current session — dispatches fresh subagent per task with two-stage review
depends-on: [write-plan]
chains-to: "verify-before-completion"
suggests: []
---
```

**dispatch-parallel-agents:**
```yaml
---
name: dispatch-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies
depends-on: []
chains-to: null
suggests: []
---
```

**verify-before-completion:**
```yaml
---
name: verify-before-completion
description: Use when about to claim work is complete, fixed, or passing — requires running verification commands and confirming output before making success claims
depends-on: []
chains-to: "finish-branch"
suggests: []
---
```

- [ ] **Step 3: Update all internal references**

In each SKILL.md and supporting file, replace ALL superpowers skill references with void-grimoire equivalents. Use the mapping table at the top of this plan. Key replacements per file:

**brainstorm/SKILL.md:**
- `writing-plans` → `write-plan` (ALL occurrences)
- `docs/superpowers/specs/` → `docs/specs/` (ALL occurrences)
- `skills/brainstorming/visual-companion.md` → `visual-companion.md` (relative path, ALL occurrences)

**write-plan/SKILL.md:**
- `superpowers:subagent-driven-development` → `develop-with-subagents` (ALL occurrences)
- `superpowers:executing-plans` → `execute-plan` (ALL occurrences)
- `docs/superpowers/plans/` → `docs/plans/` (ALL occurrences)

**execute-plan/SKILL.md:**
- `superpowers:finishing-a-development-branch` → `finish-branch` (ALL occurrences)
- `superpowers:using-git-worktrees` → `use-worktrees` (ALL occurrences)
- `superpowers:writing-plans` → `write-plan` (ALL occurrences)

**develop-with-subagents/SKILL.md:**
- `superpowers:using-git-worktrees` → `use-worktrees`
- `superpowers:writing-plans` → `write-plan`
- `superpowers:requesting-code-review` → `request-review`
- `superpowers:finishing-a-development-branch` → `finish-branch`
- `superpowers:test-driven-development` → `develop-tdd`
- `superpowers:executing-plans` → `execute-plan`
- `superpowers:code-reviewer` → `request-review`

**verify-before-completion/SKILL.md:**
- No internal superpowers references to update.

**dispatch-parallel-agents/SKILL.md:**
- No internal superpowers references to update.

Also update supporting prompt files (spec-document-reviewer-prompt.md, implementer-prompt.md, etc.) — search for any `superpowers:` references and replace with the void-grimoire equivalents.

- [ ] **Step 4: Verify no stale references remain**

Run: `grep -r "superpowers" .claude/skills/brainstorm/ .claude/skills/write-plan/ .claude/skills/execute-plan/ .claude/skills/develop-with-subagents/ .claude/skills/dispatch-parallel-agents/ .claude/skills/verify-before-completion/`
Expected: No matches (all references updated)

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/brainstorm/ .claude/skills/write-plan/ .claude/skills/execute-plan/ .claude/skills/develop-with-subagents/ .claude/skills/dispatch-parallel-agents/ .claude/skills/verify-before-completion/
git commit -m "feat: port 6 workflow skills from superpowers — brainstorm, write-plan, execute-plan, subagent-dev, parallel-agents, verify-before-completion"
```

---

### Task 8: Port Dev Skills (2 skills)

**Files:**
- Create: `.claude/skills/develop-tdd/` (copy from superpowers `test-driven-development/`)
- Create: `.claude/skills/debug-systematically/` (copy from superpowers `systematic-debugging/`)

- [ ] **Step 1: Copy files**

```bash
SP="/Users/dmytro.l/dmltdev/skills/superpowers/skills"
OC="/Users/dmytro.l/dmltdev/skills/void-grimoire/.claude/skills"

# test-driven-development → develop-tdd
mkdir -p "$OC/develop-tdd"
cp "$SP/test-driven-development/SKILL.md" "$OC/develop-tdd/"
cp "$SP/test-driven-development/testing-anti-patterns.md" "$OC/develop-tdd/"

# systematic-debugging → debug-systematically
mkdir -p "$OC/debug-systematically"
cp "$SP/systematic-debugging/SKILL.md" "$OC/debug-systematically/"
cp "$SP/systematic-debugging/root-cause-tracing.md" "$OC/debug-systematically/"
cp "$SP/systematic-debugging/defense-in-depth.md" "$OC/debug-systematically/"
cp "$SP/systematic-debugging/condition-based-waiting.md" "$OC/debug-systematically/"
# Also copy supporting files
cp "$SP/systematic-debugging/condition-based-waiting-example.ts" "$OC/debug-systematically/" 2>/dev/null || true
cp "$SP/systematic-debugging/find-polluter.sh" "$OC/debug-systematically/" 2>/dev/null || true
```

- [ ] **Step 2: Update frontmatter**

**develop-tdd:**
```yaml
---
name: develop-tdd
description: Use when implementing any feature or bugfix, before writing implementation code
depends-on: []
chains-to: null
suggests: []
---
```

**debug-systematically:**
```yaml
---
name: debug-systematically
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
depends-on: []
chains-to: null
suggests: [develop-tdd]
---
```

- [ ] **Step 3: Update internal references**

Search both SKILL.md files and supporting files for `superpowers:` references and replace per the mapping table.

- [ ] **Step 4: Verify**

Run: `grep -r "superpowers" .claude/skills/develop-tdd/ .claude/skills/debug-systematically/`
Expected: No matches

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/develop-tdd/ .claude/skills/debug-systematically/
git commit -m "feat: port develop-tdd and debug-systematically skills from superpowers"
```

---

### Task 9: Port Git Skills (4 skills)

**Files:**
- Create: `.claude/skills/use-worktrees/` (from superpowers `using-git-worktrees/`)
- Create: `.claude/skills/request-review/` (from superpowers `requesting-code-review/`)
- Create: `.claude/skills/receive-review/` (from superpowers `receiving-code-review/`)
- Create: `.claude/skills/finish-branch/` (from superpowers `finishing-a-development-branch/`)

- [ ] **Step 1: Copy files**

```bash
SP="/Users/dmytro.l/dmltdev/skills/superpowers/skills"
OC="/Users/dmytro.l/dmltdev/skills/void-grimoire/.claude/skills"

mkdir -p "$OC/use-worktrees"
cp "$SP/using-git-worktrees/SKILL.md" "$OC/use-worktrees/"

mkdir -p "$OC/request-review"
cp "$SP/requesting-code-review/SKILL.md" "$OC/request-review/"
cp "$SP/requesting-code-review/code-reviewer.md" "$OC/request-review/"

mkdir -p "$OC/receive-review"
cp "$SP/receiving-code-review/SKILL.md" "$OC/receive-review/"

mkdir -p "$OC/finish-branch"
cp "$SP/finishing-a-development-branch/SKILL.md" "$OC/finish-branch/"
```

- [ ] **Step 2: Update frontmatter**

**use-worktrees:**
```yaml
---
name: use-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans
depends-on: []
chains-to: null
suggests: []
---
```

**request-review:**
```yaml
---
name: request-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
depends-on: []
chains-to: null
suggests: [enforce-git-safety]
---
```

**receive-review:**
```yaml
---
name: receive-review
description: Use when receiving code review feedback, before implementing suggestions — requires technical rigor and verification, not blind implementation
depends-on: []
chains-to: null
suggests: []
---
```

**finish-branch:**
```yaml
---
name: finish-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work
depends-on: []
chains-to: null
suggests: [enforce-git-safety]
---
```

- [ ] **Step 3: Update internal references**

Replace all `superpowers:` references per the mapping table. Key replacements:

**finish-branch/SKILL.md:**
- `subagent-driven-development` → `develop-with-subagents`
- `executing-plans` → `execute-plan`
- `using-git-worktrees` → `use-worktrees`

**request-review/SKILL.md:**
- `superpowers:code-reviewer` → `request-review`
- `subagent-driven-development` → `develop-with-subagents`

- [ ] **Step 4: Verify**

Run: `grep -r "superpowers" .claude/skills/use-worktrees/ .claude/skills/request-review/ .claude/skills/receive-review/ .claude/skills/finish-branch/`
Expected: No matches

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/use-worktrees/ .claude/skills/request-review/ .claude/skills/receive-review/ .claude/skills/finish-branch/
git commit -m "feat: port use-worktrees, request-review, receive-review, finish-branch from superpowers"
```

---

### Task 10: Port `write-skill`

**Files:**
- Modify: `.claude/skills/write-skill/SKILL.md` (update with superpowers content)

The existing `write-skill` should be replaced with the superpowers `writing-skills` content, which is more comprehensive.

- [ ] **Step 1: Replace SKILL.md**

Rename the directory from `write-skill` to `write-skill` (matching the spec), then copy superpowers content:

```bash
SP="/Users/dmytro.l/dmltdev/skills/superpowers/skills"
OC="/Users/dmytro.l/dmltdev/skills/void-grimoire/.claude/skills"

# Rename directory to match spec
mv "$OC/write-skill" "$OC/write-skill"

# Copy superpowers content (overwrites existing SKILL.md)
cp "$SP/writing-skills/SKILL.md" "$OC/write-skill/"
cp "$SP/writing-skills/anthropic-best-practices.md" "$OC/write-skill/"
cp "$SP/writing-skills/persuasion-principles.md" "$OC/write-skill/"
cp "$SP/writing-skills/testing-skills-with-subagents.md" "$OC/write-skill/"
cp "$SP/writing-skills/graphviz-conventions.dot" "$OC/write-skill/" 2>/dev/null || true
cp "$SP/writing-skills/render-graphs.js" "$OC/write-skill/" 2>/dev/null || true
cp -r "$SP/writing-skills/examples" "$OC/write-skill/" 2>/dev/null || true
```

- [ ] **Step 2: Update frontmatter**

```yaml
---
name: write-skill
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment
depends-on: []
chains-to: null
suggests: []
---
```

- [ ] **Step 3: Update internal references**

Replace `superpowers:test-driven-development` → `develop-tdd` and any other `superpowers:` references.

- [ ] **Step 4: Verify**

Run: `grep -r "superpowers" .claude/skills/write-skill/`
Expected: No matches

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/write-skill/
git commit -m "feat: replace skill-builder with ported write-skill from superpowers"
```

---

### Task 11: Update Existing Skills Frontmatter

**Files:**
- Modify: All 18 `design-*/SKILL.md` files
- Modify: `.claude/skills/enforce-git-safety/SKILL.MD`
- Modify: `.claude/skills/commit-push-pr/SKILL.md`
- Modify: `.claude/skills/enforce-release-safety/SKILL.md`
- Modify: `.claude/skills/symlink-skills/SKILL.md`

- [ ] **Step 1: Add composition fields to all design skills**

For each design skill's SKILL.md, add three lines after the existing frontmatter fields (before the closing `---`):

```yaml
depends-on: []
chains-to: null
suggests: []
```

All 18 design skills get the same values — they have no hard composition relationships. They are invoked via `brainstorm`'s `suggests` or direct user request.

Design skill directories to update:
`design-adapt`, `design-animate`, `design-audit`, `design-bolder`, `design-clarify`, `design-colorize`, `critique-design`, `design-delight`, `design-distill`, `design-extract`, `design-frontend`, `design-harden`, `design-normalize`, `design-onboard`, `design-optimize`, `design-polish`, `design-quieter`, `teach-design`

- [ ] **Step 2: Update enforce-git-safety frontmatter**

Add to `.claude/skills/enforce-git-safety/SKILL.MD` frontmatter:
```yaml
depends-on: []
chains-to: null
suggests: []
```

- [ ] **Step 3: Update commit-push-pr frontmatter**

Add to `.claude/skills/commit-push-pr/SKILL.md` frontmatter:
```yaml
depends-on: []
chains-to: null
suggests: [enforce-git-safety]
```

- [ ] **Step 4: Update enforce-release-safety frontmatter**

Add to `.claude/skills/enforce-release-safety/SKILL.md` frontmatter:
```yaml
depends-on: []
chains-to: null
suggests: []
```

- [ ] **Step 5: Update symlink-skills frontmatter**

Add to `.claude/skills/symlink-skills/SKILL.md` frontmatter:
```yaml
depends-on: []
chains-to: null
suggests: []
```

- [ ] **Step 6: Verify all skills have composition fields**

Run: `grep -rL "chains-to" .claude/skills/*/SKILL.md .claude/skills/*/SKILL.MD 2>/dev/null`
Expected: No files listed (every SKILL.md has `chains-to`)

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/
git commit -m "feat: add depends-on, chains-to, suggests to all existing skill frontmatter"
```

---

### Task 12: Cleanup and Plugin Metadata

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Delete: All `.claude/skills/design-*/*.tmp` files
- Modify: `README.md`

- [ ] **Step 1: Remove .tmp files**

```bash
find .claude/skills/ -name "*.tmp" -delete
```

These are draft files left over from design skill development. They should not be in the final plugin.

- [ ] **Step 2: Update `plugin.json`**

Update version and description:

```json
{
  "name": "void-grimoire",
  "version": "1.0.0",
  "description": "Domain-organized skill system with three-gate flow, self-learning, and prompt expansion for Claude Code",
  "author": {
    "name": "Dmytro L.",
    "email": "dmltdev@proton.me"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/dmltdev/void-grimoire"
  },
  "keywords": [
    "skills",
    "tdd",
    "debugging",
    "design",
    "workflow",
    "self-learning",
    "documentation",
    "best-practices"
  ]
}
```

- [ ] **Step 3: Update README.md**

Update the README to reflect the new architecture:
- Plugin name: Void Grimoire
- Description: Domain-organized skill system with three-gate flow
- List all 7 domains with brief descriptions
- Installation instructions (marketplace + manual)
- Link to the spec doc

- [ ] **Step 4: Final verification**

Run: `find .claude/skills/ -name "SKILL.md" -o -name "SKILL.MD" | wc -l`
Expected: 41 (all skills have a SKILL.md)

Run: `cat .claude/skills/registry.json | python3 -m json.tool > /dev/null && echo "valid"`
Expected: "valid"

Run: `grep -r "superpowers:" .claude/skills/ | grep -v "Predecessor" | grep -v "formerly"`
Expected: No matches (all references updated, except spec doc historical notes)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: cleanup tmp files, update plugin metadata and README for v1.0.0"
```

---

## Task Dependency Graph

```
Task 1 (infrastructure) ──┬── Task 2 (using-void-grimoire)
                           ├── Task 3 (route)
                           ├── Task 4 (lookup-docs + index-docs)
                           ├── Task 5 (learn)
                           └── Task 6 (expand-prompt) [depends on T3, T4]

Independent of T1:
  Task 7 (port workflow)
  Task 8 (port dev)
  Task 9 (port git)
  Task 10 (port write-skill)
  Task 11 (update existing frontmatter)

Task 12 (cleanup) ── depends on all above
```

**Parallelizable groups:**
- Group A: Tasks 2, 3, 4, 5 (after Task 1)
- Group B: Tasks 7, 8, 9, 10, 11 (independent of Group A)
- Task 6 requires Tasks 3 + 4
- Task 12 is the final sweep
