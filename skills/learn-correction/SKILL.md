---
name: learn-correction
domain: void-grimoire
description: Use when a user corrects agent behavior — persists the correction as a rule, defaulting to project AGENTS.md/CLAUDE.md unless the user names another destination
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

## Where to Save (precedence)

Resolve the destination in this order. Stop at the first match.

1. **User stated the destination explicitly** — "save this to `X.md`", "put it in the global config", "add it under the styles heading." Write exactly there. Do NOT redirect or correct the choice.
2. **User mentioned (or the project clearly uses) another rules file** — if the user has pointed at a specific conventions/rules `.md` for this kind of guidance, append there instead of the default.
3. **Default** — project `AGENTS.md` or `CLAUDE.md` at repo root.

**Default file and heading (when falling through to step 3):**
- Mentions specific files, paths, or project names → project `AGENTS.md` / `CLAUDE.md`.
- About a technology, pattern, or domain practice → same file, grouped under the relevant domain heading (create it if absent).
- About communication style, output format, or general approach → user's global `~/.claude/CLAUDE.md` (with permission).

**Tiebreaker:** if both `AGENTS.md` and `CLAUDE.md` exist, prefer the one that already carries rules of this kind; otherwise `AGENTS.md`. Write to the global `~/.claude/CLAUDE.md` only when the rule is clearly cross-project AND the user confirms.

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
> 1. [correction summary] — **Save to:** project AGENTS.md/CLAUDE.md / global ~/.claude/CLAUDE.md / [mentioned rules file] / skip?
> 2. [correction summary] — **Save to:** project AGENTS.md/CLAUDE.md / global ~/.claude/CLAUDE.md / [mentioned rules file] / skip?"

User picks per item. Skipped items are discarded.

**Note:** Batch learning is best-effort. If the session ends without a wind-down cue, queued corrections are lost. Future improvement: persist the queue to disk.

## Rules Are Append-Only

Never edit or remove existing rules automatically. The user or a future `prune-rules` skill handles cleanup.
