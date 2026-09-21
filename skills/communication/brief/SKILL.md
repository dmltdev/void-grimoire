---
name: brief
description: Use when condensing long design docs, PRDs, specs, business requirements, tickets, meeting notes, or dense pasted text into fewer than 10 plain-language bullets.
---

# Brief

Turn a long source into a short plain-language brief that preserves what matters.

## Core contract

The output is a flat list of exactly 7 bullets by default. Use fewer only for short sources; use 8 or 9 only when 7 would hide a critical decision, limit, risk, or success measure. A reader should understand the goal, decisions, limits, risks, and success measures without reading the full source.

| Question | Required answer |
|---|---|
| Trigger | User asks to brief, summarize, distill, simplify, or condense a long design doc, PRD, spec, business requirements document, ticket, meeting notes, or pasted text. |
| Boundary | Does not write a design, review requirements, make recommendations, create plans, rewrite the source, or validate feasibility. Use source-specific skills for those jobs. |
| Behavior | Replaces long prose with a compact plain-language brief that defaults to exactly 7 bullets and never reaches 10. |
| Procedure | Read the source, extract the important facts, merge related details into 7 bullets, translate necessary jargon, and output only a flat bullet list. |
| Proof | The response has exactly 7 bullets by default, or 8 to 9 only when the source truly needs it; it covers every major source section, uses simple wording, and adds no unsupported claims. |

## Output contract

Write only a flat bullet list unless the user asks for another format:

```markdown
- {Plain-language bullet with one main idea and any critical detail.}
- {Plain-language bullet with another main idea.}
```

Rules:

- Write exactly 7 bullets by default.
- Use 1 to 6 bullets only for short sources.
- Use 8 or 9 bullets only when 7 would hide a critical decision, limit, risk, approval gap, or success measure.
- Count every visible bullet line. Nested bullets count too, so do not use nested bullets.
- Never output 10 or more bullets.
- Start with the user-visible purpose or decision.
- Group related source details into one bullet before adding another bullet.
- Keep named systems, product names, dates, money, thresholds, owners, and success measures when they matter.
- Apply the translation table below instead of copying jargon from the source.
- Preserve constraints, non-goals, risks, and approval gaps.
- Source facts outrank user add-ons: if the user asks for recommendations, next steps, opinions, or implementation plans, include them only when the source already contains them.
- Do not say the brief is complete unless the source was available and read.

## Workflow

1. Identify the source type and audience from the prompt or document title.
2. Read the whole source or all provided excerpts before summarizing.
3. Extract the goal or decision, users or stakeholders, required behavior, limits or non-goals, risks or open approvals, and success measures when present.
4. Merge those facts into exactly 7 bullets; use 8 or 9 only when a critical fact would be lost.
5. Apply the translation table and replace domain jargon with everyday words.
6. Output only the flat bullet list.
7. Run the output preflight below and revise any failed check before replying.

## Translation table

Use the right column in the brief. Do not use the left-column source term in the brief.

| Source says | Brief should say |
|---|---|
| `source of truth` | `official place where this data is trusted` |
| `rollup` | `summary numbers` |
| `digest` | `scheduled summary message` |
| `segment` | `customer group` |
| `metric` | `success measure` or the specific number |
| `non-goal` | `This will not...` |
| `constraint` | `The team must...` or `The system must...` |
| Missing approval or unresolved decision | Name it as unresolved, do not fill it in. |

## Example

Source:

```text
Goal: Build a finance portal for invoice risk before monthly close. BillingX remains the source of truth. Import invoices nightly at 02:00 UTC. High risk means 14+ days overdue or two failed payment attempts. Managers can assign analysts and next-action dates. Analysts can write notes, but cannot edit invoice amount, due date, or status. Send a Slack digest on Mondays and Thursdays. Keep audit history for 18 months. Do not process payments or send customer emails. Success means close prep drops from 6 hours to 2 hours and 95% of high-risk invoices have an owner within two business days.
```

Brief:

```markdown
- Build one finance portal that shows risky invoices before monthly close, while BillingX stays the official place for invoice status.
- Import invoice data every night at 02:00 UTC; show a warning if the data is more than 24 hours old.
- Mark invoices high risk when they are 14+ days overdue or have two failed payment attempts.
- Managers can assign analysts and next-action dates; analysts can add notes but cannot change invoice facts.
- Send finance a scheduled Slack summary on Mondays and Thursdays, and keep assignment/note history for 18 months.
- This will not process payments, send customer emails, or replace BillingX.
- Success means close prep drops from 6 hours to 2 hours, and 95% of high-risk invoices get an owner within two business days.
```

## Quick reference

| Need | Move |
|---|---|
| Source is huge | Read all available text, then merge related details before writing. |
| User asks for simple language | Use everyday words and explain unavoidable terms inline. |
| Source has many requirements | Group by user-visible outcome, not by source heading. |
| Source has limits | Keep them as bullets beginning `This will not...` or `The system must not...`. |
| Source has success numbers | Preserve exact numbers. |

## Common mistakes

| Mistake | Correct move |
|---|---|
| Writing exactly 10 bullets because the user said `<10`. | Write exactly 7 bullets by default; use 9 only as the hard cap. |
| Using nested bullets to keep the top-level count low. | Use a flat list; every visible bullet counts. |
| Copying jargon from the source. | Use the right side of the translation table, not the source term. |
| Adding next steps because the prompt says they are useful. | Include next steps only if the source contains them. |
| Dropping non-goals to save space. | Merge them into one clear boundary bullet. |
| Restating every heading separately. | Merge related sections around what the reader needs to know. |
| Calling an unread or partial-source brief complete. | State only what the provided source supports. |

## Red flags

- The draft has 10 or more visible bullet lines.
- The draft uses nested bullets.
- The draft contains `source of truth`, `rollup`, `digest`, `segment`, or `metrics`.
- The draft adds recommendations, next steps, or a plan not present in the source.
- The draft drops source limits, non-goals, risks, or success measures.

## Verification gate

Before replying, inspect the draft line by line:

1. Count every visible bullet line. Use exactly 7 by default. Use fewer only when the source contains fewer than 7 distinct important facts; short wording alone does not make a source short. Never use more than 9.
2. Ensure every non-empty output line starts with `- ` at the left margin. Remove headings, numbered items, indentation, nested bullets, and prose outside the list.
3. For each left-column term that appears in the source, use the corresponding right-column wording. For `metric`, the exact success number alone is also valid.
4. Remove recommendations, next steps, opinions, or implementation details that the source does not support. Do not add a bullet explaining that you omitted them.
5. State every missing approval or unresolved decision as unresolved; never decide it for the source.
6. Compare the draft with the extracted facts and retain the goal, behavior, boundaries, risks, approvals, success measures, names, dates, money, and thresholds that matter.
