---
name: grill-me-fast
domain: workflow
description: Fast grilling session for plans and designs. Batches related questions, provides recommended defaults up front, and uses disagreement-driven follow-ups to preserve pressure without one-question-at-a-time latency.
depends-on: []
chains-to: null
suggests: ["grill-me", "grill-with-docs", "using-adhd"]
---

<what-to-do>

Stress-test the user's plan or design quickly without turning it into a passive checklist.

Default mode: **batched grilling**.

1. Explore first. If a question can be answered by reading the codebase or docs, answer it yourself instead of asking.
2. Build a decision map: identify the plan's main branches, dependencies, hidden assumptions, and irreversible choices.
3. Ask questions in batches of 1-5, grouped by dependency and topic.
4. For every question, include your recommended answer and the reason for that default.
5. Wait for the user to answer the whole batch before continuing.
6. After each batch, update the decision map and choose the next smallest useful batch.
7. Stop when every load-bearing branch is resolved or the remaining questions are low-risk defaults the user has accepted.

Never ask unrelated questions in the same batch. Never exceed five questions. If one answer can invalidate the rest of the batch, ask only that question.

</what-to-do>

<batch-shape>

Use this shape for each batch:

```markdown
## Batch N — <topic>

1. **Question:** <question>
   **Recommended default:** <answer>
   **Why:** <short reason>
   **Reverse if:** <condition that makes another answer better>

2. **Question:** ...

Reply with answers for 1-N. "Accept defaults" is valid.
```

Batch sizing:

- 1 question: irreversible choice, ambiguous root premise, or answer changes the rest of the tree.
- 2-3 questions: related choices with mild coupling.
- 4-5 questions: independent details sharing the same context.

</batch-shape>

<fast-default-slate-mode>

Use this mode when the user asks to move even faster, says they trust defaults, or the plan is mostly conventional.

1. Present a **default slate**: all implementation questions with recommended answers.
2. Mark each item as one of:
   - **Safe default** — conventional; only discuss if the user dislikes it.
   - **Risk default** — acceptable but has a meaningful trade-off.
   - **Needs answer** — no safe default; user must decide.
3. Ask the user to either accept the slate or override specific numbered items.
4. Continue grilling only on **Risk default** overrides and **Needs answer** items.

This preserves grilling by concentrating pressure on disagreements, risky defaults, contradictions, and missing domain decisions.

</fast-default-slate-mode>

<adhd-option>

Use `/adhd` only when the user wants alternative fast-grilling formats or the obvious batching strategy feels wrong.

Prompt shape:

```markdown
Generate fast variants of a plan-grilling workflow. Preserve adversarial pressure and shared understanding. Optimize for fewer round trips without collapsing into a passive questionnaire.
```

Then pick one workflow and run it. Do not silently replace grilling with brainstorming.

</adhd-option>

<docs-aware-mode>

When the user asks for docs-aware grilling, or when the plan uses domain terms that should be captured:

1. Read existing domain docs before asking about terminology.
2. Challenge terms against the glossary and code, as `grill-with-docs` does.
3. Capture resolved terms inline in `CONTEXT.md` only after the user explicitly resolves them.
4. Offer ADRs sparingly: hard to reverse, surprising without context, and a real trade-off.

Do not create docs before a decision exists.

</docs-aware-mode>
