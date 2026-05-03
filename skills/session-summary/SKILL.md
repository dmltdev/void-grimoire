---
name: session-summary
domain: workflow
description: Use when the user wants to journal a session, capture context before compacting, or save a retrospective record of decisions, trade-offs, and progress
depends-on: []
chains-to: null
suggests: []
---

# Session Summary

## Overview

Capture a session into a single readable artifact: TL;DR up top, then decisions with trade-offs, valuable discussion, accomplishments, unfinished work, and files touched. Replaces the older `prepare-compact` skill — same handoff capability, plus retrospective journaling.

**Announce at start:** "I'm using the session-summary skill to write up this session."

## The Process

### Step 1: Gather Session Context

Walk the conversation and extract:

1. **Session title** — short, descriptive (e.g., "Add auth middleware", "Refactor billing service").
2. **TL;DR material** — what was the session about, what's the outcome, is continuation expected?
3. **Decisions** — choices made *with trade-offs*. A decision needs alternatives considered and reasons for the pick. If there are no trade-offs, it's not a decision — it's an accomplishment.
4. **Discussion** — constraints discovered, insights, rejected approaches *with the reason they were rejected*. Skip tool churn, dead ends without lessons, small talk.
5. **Accomplished** — concrete done items: features, fixes, files written.
6. **Unfinished / Next Steps** — work remaining, in execution order.
7. **Files Changed** — modified or created paths with one-line notes.
8. **Decision history pointer** — if `.void-grimoire/history/` was used, note which initiative(s) were touched in *Discussion* so the next session can read them.

### Step 2: Resolve Filename and Write the File

1. Build kebab-case filename from the title: `{kebab-title}.md` (no date in the filename — date lives inside the file).
2. Ensure `docs/sessions/` exists.
3. **Collision handling:** if `docs/sessions/{kebab-title}.md` already exists, suffix with the next available integer starting at `2`: `{kebab-title}-2.md`, `{kebab-title}-3.md`, etc. Never overwrite.
4. Write the file using the format below.

**File format** (omit any section that would be empty — no "N/A" placeholders):

```markdown
# {Session Title}

**Date:** {YYYY-MM-DD}

## TL;DR
{1–3 sentences. What the session was about, the outcome, and whether continuation is expected. Hard cap — if it grows past 3 sentences it is not a TL;DR.}

## Decisions

### {Decision title}
- **Chose:** {what was decided}
- **Options considered:** {A / B / C — terse}
- **Trade-offs:** {costs accepted, why this over the rest}

## Discussion
- {Valuable threads only — constraints, insights, rejected approaches with reasons.}

## Accomplished
- {Concrete done items.}

## Unfinished / Next Steps
1. {Numbered, only if work remains.}

## Files Changed
- `path/to/file` — one-line note.
```

### Step 3: Print the Continuation Prompt

Always print this after writing the file, regardless of whether work remains:

---

**Session summary saved to `docs/sessions/{filename}`.**

To continue this work in a new chat or after `/compact`, paste:

```
Read @docs/sessions/{filename} and continue from where we left off — {one-sentence next action from "Unfinished / Next Steps", or "review the journal and confirm direction" if the session is complete}
```

---

## When to Use

- User wants a journal of what happened ("summarize the session", "journal this", "session summary")
- Session is getting long and needs preservation before `/compact` ("prepare for compact", "save session", "compact")
- Switching to a different task in the same session
- User invokes `/session-summary` (or the legacy `/prepare-compact` alias)

## Rules

- TL;DR is mandatory; cap is hard at ~3 sentences.
- A decision needs **trade-offs**. No trade-offs → demote to *Accomplished*.
- Discussion is for *valuable* context only. Empty → omit the section.
- Use today's actual date inside the file. Never put dates in the filename.
- Suffix on collision (`-2`, `-3`, …). Never overwrite.
- Don't run `/compact` yourself — that's for the user.
