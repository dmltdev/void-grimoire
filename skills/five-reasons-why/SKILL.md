---
name: five-reasons-why
description: Use when learning, researching, investigating, or deciding requires a concise causal chain; when a causal relationship or underlying reason is unclear; or when the user asks why, five whys, root cause, underlying reason, or a deeper explanation.
---

# Five Reasons Why

Trace one question through as many as five supported causal links, from the visible result to the simplest useful reason.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | A user needs a deeper explanation, causal map, Five Whys analysis, or underlying reason. |
| Boundary | This maps causality. It does not replace reproduction, debugging, a postmortem, broad research, or an architecture decision record. |
| Behavior | Replace a plausible story with a short chain in which every cause directly explains the prior effect. |
| Procedure | Define the question, inspect available evidence, trace each link, stop at the evidence boundary, then verify the chain backward. |
| Proof | Every link is supported, non-circular, and necessary to the explanation; uncertainty and branches stay visible. |

## Invariant

Five is a search depth, not a quota. Stop before five when the simplest useful reason is reached or evidence ends. Never invent a link to complete the count.

## Workflow

1. State the exact phenomenon or decision to explain. Replace vague prompts such as "Why is this bad?" with an observable question.
2. Use available code, logs, docs, sources, and prior findings before asking the user. Separate observed facts from inference.
3. Write the first direct cause. It must explain the phenomenon, not rename it.
4. Ask why that cause exists. Add one cause per level, with each new level explaining the line immediately above it.
5. Before keeping a link, check both directions: the cause can produce the effect, and removing the cause would weaken this chain.
6. Stop at five levels, a stable mechanism or constraint, or the first unsupported link. Name the missing evidence when the chain stops on uncertainty.
7. Read the chain backward from the base reason. Each line must lead to the one above without a logical jump.

## Decision rules

| Situation | Move |
|---|---|
| Learning or technical explanation | Trace the established mechanism to its simplest constraint. |
| Investigation or incident | Use observed evidence first. Mark hypotheses as inferred; do not promote them to root cause. |
| Research question | Cite or name the source basis when the causal link is not common project context. |
| Decision rationale | Trace goal and constraints to the choice. Call the endpoint a base reason, not a root cause. |
| Multiple material causes | State the branch. Run a separate short chain for each supported branch instead of forcing one root. |
| Human error appears | Ask which process, control, interface, or condition made the error possible. Keep personal intent only when evidence supports it. |

## Output contract

```markdown
Question: <exact why question>

1. <effect> because <direct cause>. <basis when needed>
2. <prior cause> because <deeper cause>. <basis when needed>
3. ...

Base reason: <deepest supported mechanism, constraint, or process cause; use `Not established` when no causal link is supported>
Evidence gap: <next evidence needed; required when the base reason is not established or the chain stops on uncertainty>
```

Use up to five numbered links. Keep each link to one causal claim. Prefix every inferred link with `Inference:`. When a chain mixes evidence types, prefix every link with `Observed:`, `Sourced:`, or `Inference:`. When no causal link is supported, omit the numbered list and write `Base reason: Not established` plus `Evidence gap:`. Write branch headings as `Branch A: <name>`. Use commas, semicolons, colons, parentheses, or hyphens instead of em dashes.

## Example

Question: Why must an at-least-once message handler be idempotent?

1. The handler must tolerate duplicate processing because the queue can redeliver the same unacknowledged message.
2. The queue redelivers because it cannot know processing succeeded until it receives the acknowledgement.
3. The acknowledgement can be missing because the worker can crash after the side effect but before acknowledging the message.
4. That failure window exists because the side effect and acknowledgement are separate operations.
5. They are separate because the worker and queue do not share one atomic transaction.

Base reason: Independent systems cannot atomically commit the side effect and acknowledgement without extra coordination.

## Common mistakes

| Mistake | Correct move |
|---|---|
| Filling all five lines with guesses. | Stop at the last supported link and name the evidence gap. |
| Restating the prior line with new words. | Name a mechanism that could produce the prior effect. |
| Jumping from symptom to "bad process." | Include the missing intermediate mechanism. |
| Treating one branch as the only cause. | Show separate supported branches. |
| Ending with "human error." | Trace the condition or control that allowed it. |

## Verification gate

- The question names one clear phenomenon or decision.
- Each numbered line directly explains the line above it.
- Every inferred link is labeled; mixed chains label every link as `Observed`, `Sourced`, or `Inference`.
- The chain stops before speculation, even when fewer than five links remain.
- The base reason is the deepest supported explanation, not merely the fifth sentence.
