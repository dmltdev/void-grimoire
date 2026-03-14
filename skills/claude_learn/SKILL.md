---
name: claude:learn
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

Never edit or remove existing rules automatically. The user or a future `claude:prune-rules` skill handles cleanup.
