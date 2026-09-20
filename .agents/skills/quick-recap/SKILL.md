---
name: quick-recap
description: Use when adding or following the red/yellow/green final status block convention for agent responses, AGENTS.md, CLAUDE.md, or plugin output rules.
---

# Quick Recap

Make every completed unit of work end with one visible status line.

## Core contract

The final line of a response must tell the user whether the requested unit is finished, pending a specific non-routine follow-up, or blocked on user input.

| Question | Required answer |
|---|---|
| Trigger | User asks for quick recap, final status, red/yellow/green status, response status indicators, or install/update of this convention in `AGENTS.md` / `CLAUDE.md`. |
| Boundary | Does not replace full summaries, test evidence, PR descriptions, session journals, or changelogs. It only adds the final status line. |
| Behavior | Adds exactly one terminal status line and no content after it. |
| Procedure | Pick the state from observed work, write a concise sentence under 100 chars, put it last. |
| Proof | The final response or edited instructions visibly end with the required status shape. |

## Status line contract

Use exactly one of these states:

```md
🟢 Actual concise status sentence
🟡 Actual concise status sentence naming pending item
🔴 Actual concise status sentence naming required user input
```

Rules:

- Use `🟢` when the requested unit is finished.
- Use `🟡` when non-routine follow-up remains; name the pending item.
- Use `🔴` only when blocked on user input; name the missing input.
- Keep the full line under 100 characters.
- Put the line at the very end of the response.
- Add no spacer, heading, markdown rule, footnote, or content after it.

## Workflow

1. Determine whether the current response completes a unit of work.
2. If it does not complete a unit, do not force a status line unless project instructions require every response to have one.
3. If it completes a unit, choose the state:
   - Finished and verified enough for the ask => `🟢`.
   - Work done but one named non-routine external step remains => `🟡`.
   - Cannot continue without a user-provided decision, secret, credential, file, or approval => `🔴`.
4. Write one concrete sentence from the user's perspective.
5. Make it the final line.

## Installer behavior

When installing this convention into a project:

1. Prefer the managed `AGENTS.md` or `CLAUDE.md` instruction block unless the user opts out.
2. Keep the block focused on output shape only.
3. Do not add workflow gates, reporting templates, or unrelated agent behavior.
4. Verify the target instruction file now contains the exact status state rules.

## Examples

Finished:

```md
🟢 Updated quick recap docs with output examples
```

Pending external follow-up:

```md
🟡 Webhook code updated; set PROVIDER_WEBHOOK_SECRET before live testing
```

Blocked:

```md
🔴 Need the production API key to continue
```

## Common mistakes

| Mistake | Correct move |
|---|---|
| Ending with `Status: complete`. | Use the emoji state line. |
| Adding a summary after the status line. | Move the summary before it. |
| Marking `🟢` when an external setup step remains. | Use `🟡` and name the step. |
| Saying "blocked" for a failed command you can still investigate. | Keep working; use `🔴` only for missing user input. |
| Installing broad agent behavior with this skill. | Install only the status-line convention. |

## Verification gate

Before claiming the convention is installed or followed, check:

- The response or target instruction ends with exactly one status line.
- The status line uses `🟢`, `🟡`, or `🔴`.
- The line is under 100 characters.
- Nothing appears after the status line.
- Any `🟡` or `🔴` line names the pending item or missing input.
