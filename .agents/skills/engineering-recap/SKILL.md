---
name: engineering-recap
description: Use when reporting completed engineering work, change handoffs, implementation recaps, or verification summaries that must separate the problem, decision, evidence, and remaining action.
---

# Engineering Recap

Report a completed engineering change so the reader can scan why it mattered, what changed, what proved it, and what remains.

## Core contract

Use this skill only when the user needs a work recap, handoff, delivery summary, or completed-change report. State facts in four labeled fields, in this order:

```markdown
Problem: <the user goal, defect, risk, or requested change>
Decision: <the implemented choice and its relevant trade-off>
Check: <commands, tests, runtime evidence, or explicit unverified boundary>
Next: <required remaining action, or `None`>
```

Output only these four fields. If `quick-recap` also applies, its one status line may follow `Next`; otherwise add no title, bullets, footer, or extra verification prose.

## Boundaries

- Do not use for a general source summary, PRD, meeting note, or business brief; use `brief` instead.
- Do not add recommendations, architecture alternatives, tests, or follow-up work not supported by the observed work.
- Do not replace `quick-recap`; when both apply, put its status line after this four-field recap.

## Workflow

1. Identify the user-facing problem from the request or observed change.
2. State the concrete decision and only the trade-off that affected it.
3. Report the narrowest observed check. Separate what passed from what was not exercised.
4. Name the next required action. Write `Next: None` only when no action remains.
5. Verify every label appears once, in order, with evidence rather than intention.

## Example

```markdown
Problem: Agents needed current repository structure without external telemetry.
Decision: Indexed each repository locally and configured the shared CodeGraph MCP server.
Check: Pi and OMP connected to CodeGraph; the backend index reported up to date.
Next: Restart existing agent sessions to load the new MCP configuration.
```

## Common mistakes

| Mistake | Correct move |
|---|---|
| Turning `Check` into an assertion of success. | Name the exact command or observed runtime result. |
| Inventing a problem after a routine request. | State the requested change plainly. |
| Omitting `Next` because all work is done. | Write `Next: None`. |
| Using this for a document summary. | Use `brief`, which preserves source facts without adding delivery categories. |

## Verification gate

- `Problem`, `Decision`, `Check`, and `Next` appear exactly once and in order.
- `Check` distinguishes observed proof from unverified work.
- `Next` is either an actual required action or `None`.
- No fact, recommendation, or follow-up was invented.
