---
name: peer-communication
description: Use when drafting or rewriting a Slack or Teams message, PR description, review reply, issue comment, status update, handoff, prompt, error, or other written communication for a capable peer.
---

# Peer Communication

Write what this peer needs, in the form their channel expects.

## Core contract

| Question | Required answer |
| --- | --- |
| Trigger | Drafting or rewriting chat, PR, review, issue, status, handoff, prompt, error, or instruction text. |
| Boundary | Not long-source summaries, marketing, brand imitation, legal prose, or unsupplied facts. Use `brief` for long sources. |
| Behavior | Match channel and recipient; remove scaffolding without losing meaning. |
| Procedure | Infer context, extract message, choose shape, draft, check. |
| Proof | Channel-fit, faithful text with no em dash, decoration, or unsupported claim. |

## Workflow

1. Infer channel, recipient, and purpose. User instructions win; otherwise use neutral peer prose.
2. Keep the point and support. Preserve qualifiers, numbers, dates, terms, quotes, code, and uncertainty.
3. Choose a shape. Follow a supplied template.
4. Lead with the answer, decision, current state, or action. Each later sentence must add information.
5. Remove setup, repetition, decoration, and invented certainty. Return final text unless asked otherwise.

## Channel shapes

| Context | Register | Default shape |
| --- | --- | --- |
| Chat, Slack, Teams | Informal peer | One direct paragraph; a second only for a material condition, decision, or ask. |
| PR description | Formal technical peer | Outcome first; bullets for independent scope or risk. Use only observed verification facts; if required but absent, say so. |
| Review reply or issue | Match thread tone | Answer or decision first, then rationale or evidence. |
| Status or handoff | Neutral operational | Current state, blocker or decision, next action. Bullets only for independent facts. |
| Error, prompt, instruction | Formal operational | Short active sentences with actor, condition, and action. |

## Writing rules

- Use sentence case. Start sentences in lowercase only when the user explicitly asks.
- Use Markdown or a flat list only when the channel renders it and it improves scanning.
- Do not use em dashes. Use a period, comma, colon, semicolon, parentheses, or different structure.
- Do not add an empty greeting, question restatement, beginner explanation, praise, apology, offer to continue, or staged opening.
- Do not invent facts, results, ratings, names, numbers, dates, citations, or confidence. Keep exact terms, quotes, and code unless asked to change them.

## Red flags

- A short PR gained template headings or unsupported verification.
- Chat turned stiff, a direct reply became a lesson, or a material condition was lost.

## Verification gate

- The opening gives the recipient the point or action.
- Material facts and uncertainty remain supported.
- The register and structure fit the channel.
- No sentence merely repeats, and no em dash, decorative label, assistant chatter, or unsupported claim remains.
