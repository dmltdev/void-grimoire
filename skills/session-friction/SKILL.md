---
name: session-friction
domain: workflow
description: Use at session end to log correction events — where the agent got it wrong and the user had to correct it — into the skill's own append-only friction corpus. Each event binds to the skill/tool that was invoked, or to "none" when a skill should have triggered but didn't. Use when the user wants to capture AI usage friction for later review, wraps up a session with visible correction loops, or invokes /session-friction. Do NOT use mid-session, for general retrospectives, or for handoff/journaling — those are babysitter-orchestrator and session-summary respectively.
depends-on: []
chains-to: null
suggests: []
---

# Session Friction Log

Append correction events from this session to the skill's own corpus. Notify the user when patterns cluster. The corpus lives inside this skill's install directory, NOT inside any project repo.

**Announce at start:** "Logging session friction to the skill's own corpus."

## Step 1 — Detect Correction Events

Walk the conversation. A correction event is any exchange where ONE of these is true:

- User said "no", "not like that", "actually", "wrong", or reverted your change.
- User restated a requirement you had already been given.
- User invoked a skill manually that should have auto-triggered from their prompt.
- User had to supply context (file path, error text, constraint) you should have asked for.
- User accepted output, then re-opened it later in the session to fix it.

A legitimate pivot — new requirement, scope change, exploration step — is NOT a correction. Skip it.

If zero correction events: write nothing. Tell the user "no friction observed this session" and stop.

## Step 2 — Classify Each Event

For each event extract:

| Field | Values |
|-------|--------|
| `bound_to` | exact skill name, exact tool name, or `none` (a skill should have triggered but didn't, or no skill exists for the task) |
| `cause` | `vague_prompt` \| `missing_skill` \| `broken_skill_trigger` \| `broken_skill_content` \| `accepted_bad_output` |
| `summary` | one line, what the user corrected |

Cause definitions:
- `vague_prompt` — prompt lacked detail; correction would have been avoided with a better prompt.
- `missing_skill` — no skill exists for this kind of task; agent brute-prompted.
- `broken_skill_trigger` — relevant skill exists but didn't auto-load from the prompt.
- `broken_skill_content` — relevant skill loaded but its workflow missed the case.
- `accepted_bad_output` — agent accepted earlier wrong output instead of pushing back.

## Step 3 — Resolve Corpus Path

The corpus is `{this skill's install directory}/data/friction.md`. Resolve it from the base directory provided in the session-start context for this skill. Create `data/` if missing.

This is intentional: the corpus follows the skill install scope.
- Global install => one cross-project corpus (recommended; patterns about a skill are skill-properties, not project-properties).
- Project-scoped install => project-local corpus.

NEVER write the corpus into the active project repo, into `~/Documents`, or into any path other than the skill's own `data/` directory.

## Step 4 — Append Observations

For each event, generate a 6-char hex ID and append a line in this format:

```
[a3f9c1] 2026-06-10 14:32 bound_to=lookup-docs cause=broken_skill_content
  Skill missed inline JSDoc; user pointed at file manually.
[b7e2d4] 2026-06-10 14:51 bound_to=none cause=missing_skill
  User wanted a structured diff review; no skill exists; brute-prompted instead.
```

Date is `YYYY-MM-DD HH:MM` in the user's local time. IDs must be unique within the file — regenerate if collision.

Append only. Never edit existing lines.

## Step 5 — Promote Stable Reflections

After appending, scan the whole corpus and count observations per `bound_to` slot since the file started (NOT since last ack — reflections are stable claims, not incremental).

For any slot with **≥5 observations** that does NOT yet have a reflection line, write a reflection at the top of the file under the `## Reflections` heading. Format:

```
[REF-9c2a1d] bound_to=lookup-docs n=6 dominant_cause=broken_skill_content
  Pattern: lookup-docs consistently fails to surface inline JSDoc when the docs sit beside the implementation.
```

Reflection ID prefix is `REF-` plus 6 hex. The one-line claim is yours to write — make it specific and actionable (what the skill misses, what's missing entirely). If the dominant cause is `missing_skill`, the claim should name the missing capability.

Reflections are also append-only. If a slot already has a reflection but new observations diverge, append a SECOND reflection rather than editing — newer reflections win on conflict, same rule as pi-observational-memory.

## Step 6 — Notify on Threshold

After appending, scan observations since the last `<!-- acked: YYYY-MM-DD -->` footer marker (or from file start if none). Notify the user if EITHER trigger fires:

- Any `bound_to` slot has **≥3 observations** since last ack.
- Total observations since last ack ≥ **10**.

Notification format:

> Friction corpus has accumulated patterns since last review:
> - `lookup-docs`: 4 events (causes: broken_skill_content×3, broken_skill_trigger×1)
> - `none`: 3 events suggesting a missing skill for structured diff review
>
> Full corpus: `{absolute corpus path}`. Reply "ack" to mark reviewed.

If the user replies "ack" in the same turn or a follow-up, append `<!-- acked: YYYY-MM-DD -->` as the final line of the file. Do NOT auto-ack.

## File Shape

```markdown
# Session Friction Corpus

## Reflections
[REF-9c2a1d] bound_to=lookup-docs n=6 dominant_cause=broken_skill_content
  Pattern: lookup-docs consistently fails to surface inline JSDoc when the docs sit beside the implementation.

## Observations
[a3f9c1] 2026-06-10 14:32 bound_to=lookup-docs cause=broken_skill_content
  Skill missed inline JSDoc; user pointed at file manually.
[b7e2d4] 2026-06-10 14:51 bound_to=none cause=missing_skill
  User wanted a structured diff review; no skill exists; brute-prompted instead.

<!-- acked: 2026-06-05 -->
```

If the file does not yet exist, create it with the two headings and no entries, then append.

## Rules

- Evidence-only. If you didn't observe the correction in this session's transcript, don't log it.
- One event per correction. Don't split into sub-events or merge across distinct corrections.
- Append-only. Ack markers and reflections are the only growth modes. Never rewrite history.
- Corpus path is always inside the skill's own install directory. Never the project repo.
- If `bound_to=none` count grows, that's a missing-skill signal — call it out explicitly in the notification, not buried in the list.
- Do NOT confuse this with `session-summary` (handoff/journal) or `session-usage-summary` (per-session generic critique). This skill produces no per-session report — only corpus growth and threshold notifications.
