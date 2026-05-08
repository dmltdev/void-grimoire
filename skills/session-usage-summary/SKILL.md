---
name: session-usage-summary
domain: workflow
description: Use when the user wants feedback on how they used AI during this session — evaluates prompt quality, decision ownership, verification habits, and correction loops, then gives concrete improvement recommendations
depends-on: []
chains-to: null
suggests: []
---

# Session Usage Summary

Evaluate how the user worked with the AI this session and give actionable feedback. Not a session journal — that's `session-summary`. This is a retrospective on AI usage quality.

**Announce at start:** "I'm using the session-usage-summary skill to review how you used AI this session."

## The Process

### Step 1: Walk the Conversation

Scan the full conversation history and collect evidence for each signal below. Note counts, specific exchanges, and patterns.

**Signals to track:**

| Signal | What to look for |
|--------|-----------------|
| **Spec quality** | Did requests include clear requirements, context, constraints? Or were they vague ("build me X", "fix this") with corrections following? |
| **Decision ownership** | Did the user make calls, or repeatedly ask Claude to decide? ("what do you think I should use?", "you pick") |
| **Verification** | Did the user test, run commands, check output before accepting? Or accept and move on? |
| **Correction loops** | How many rounds of "no, not like that"? What caused them — vague prompt, accepted bad output, or legitimate pivot? |
| **Context provision** | Did the user attach relevant files, share errors in full, or describe the system? Or expect Claude to guess? |
| **Tool/skill usage** | Did the user invoke skills when they applied? Use the right tools? Or brute-force prompts where a structured workflow exists? |
| **Pushback** | Did the user challenge Claude when output was wrong or incomplete? Or accept surface-level answers? |

### Step 2: Write the File

Filename: `docs/sessions/usage-{YYYY-MM-DD}.md` (suffix `-2`, `-3` on collision — never overwrite).

**Format:**

```markdown
# AI Usage Review — {YYYY-MM-DD}

## What Went Well
- {Specific observed strength with example from the session.}

## What to Improve
- {Specific observed weakness with example from the session.}

## Recommendations
1. {Concrete, actionable. One behavior change per item. Not abstract advice.}
```

**Rules for content:**
- Every item must reference something that actually happened this session. No generic AI advice.
- "What Went Well" and "What to Improve" each need at least one item. If the session was perfect, write one honest stretch goal.
- Recommendations are numbered and actionable. "Be more specific" is not actionable. "Before asking for implementation, write 2-3 acceptance criteria" is.
- Max 5 items per section. Trim to signal.

### Step 3: Print the Output

Print the full file content inline after saving it, then add:

---

**Usage review saved to `docs/sessions/usage-{YYYY-MM-DD}.md`.**

---

## Rules

- Evidence-only. If you didn't observe it, don't infer it.
- Direct tone. No praise padding, no softening criticism.
- One recommendation per loop cause. Don't list 4 variations of the same problem.
- If the session had fewer than 5 exchanges, note that the sample is too small for reliable patterns — still write what's observable.
