---
name: claude:entry-point
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
Invoke `docs:lookup` with the task context. This checks for relevant documentation (via qmd or local file fallback). Even "no docs found" is a valid result — the point is you looked.

### Gate 3: Domain Gate
Invoke `claude:route` with the user's request. It matches against the registry and returns applicable skills. Invoke those skills before acting.

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
1. **Process skills first** (workflow:brainstorm, dev:debug) — these determine HOW to approach
2. **Implementation skills second** (design:frontend-design, dev:tdd) — these guide execution

## Self-Learning Detection

Watch for correction signals during conversation:
- **High-confidence** (save inline): "always/never do X", "remember this", same correction twice
- **Ambiguous** (queue for batch): "no, do it this way instead", implicit preference changes

When you detect a correction, invoke `claude:learn` to persist it.

When the conversation is winding down ("thanks", "that's all", "commit and done"), check if any ambiguous corrections were queued. If so, present them for the user to classify.

## Skill Types

**Rigid** (dev:tdd, dev:debug): Follow exactly. Don't adapt away discipline.
**Flexible** (design patterns): Adapt principles to context.
