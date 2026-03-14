---
name: workflow:prepare-compact
description: Use when the session is getting long and context needs to be preserved before compacting — generates a session summary file and gives the user a ready-to-paste continuation prompt
depends-on: []
chains-to: null
suggests: []
---

# Prepare Compact

## Overview

Capture session context into a summary file so work can continue seamlessly after `/compact` clears the conversation.

**Announce at start:** "I'm using the workflow:prepare-compact skill to prepare a session summary before compacting."

## The Process

### Step 1: Gather Session Context

Analyze the current conversation and identify:
1. **Session title** — a short descriptive name for the work done (e.g., "Add auth middleware", "Fix CI pipeline")
2. **What was accomplished** — completed tasks, decisions made, files changed
3. **What's in progress** — unfinished work, current blockers
4. **What's next** — immediate next steps the agent should pick up
5. **Key context** — important decisions, constraints, or gotchas that would be lost

### Step 2: Create Session Summary File

1. Generate filename: `{YYYY-MM-DD}-{kebab-case-title}.md` (e.g., `2026-03-14-add-auth-middleware.md`)
2. Create directory `docs/sessions/` if it doesn't exist
3. Write the summary file to `docs/sessions/{filename}`

**Summary file format:**

```markdown
# {Session Title}

**Date:** {YYYY-MM-DD}

## Accomplished
- {bullet list of what was done}

## In Progress
- {bullet list of unfinished work, if any}

## Next Steps
- {numbered list of what to do next}

## Key Context
- {important decisions, constraints, gotchas — anything the next session needs to know}

## Files Changed
- {list of modified/created files with brief notes}
```

### Step 3: Present Continuation Prompt

After writing the summary file, tell the user:

---

**Session summary saved to `docs/sessions/{filename}`.**

To continue this work after compacting, run `/compact` and then paste:

```
Read @docs/sessions/{filename} and continue from where we left off — {one-sentence description of the immediate next action from "Next Steps"}
```

---

## When to Use

- Session is getting long and you or the user want to compact
- User says "prepare for compact", "save session", "let's compact"
- Before switching to a different task in the same session
- User invokes `/workflow:prepare-compact`

## Rules

- Always use today's actual date, not a placeholder
- Keep the summary concise — this is a handoff document, not a transcript
- The continuation prompt must be specific enough that a fresh agent can pick up immediately
- If there are no next steps (work is complete), say so — the continuation prompt should reflect that
- Do NOT run `/compact` yourself — that's for the user to do
