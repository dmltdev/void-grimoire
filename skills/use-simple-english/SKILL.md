---
name: use-simple-english
description: Use when the user asks for simple English, plain language, easier wording, less jargon, a clearer explanation, or easier-to-read assistant chat responses.
---

# Use Simple English

Make assistant chat easy to understand without making the reader sound inexperienced or changing technical meaning.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | The user asks for simple English, plain language, less jargon, easier wording, or a clearer chat response. |
| Boundary | Assistant-to-user chat only. It does not replace artifact formats such as `engineering-recap`, `peer-communication`, or `brief`. |
| Behavior | Put the useful answer first, use familiar words, and preserve technical precision. |
| Procedure | Identify the needed result, choose the response shape, write plainly, then check meaning and actionability. |
| Proof | The reply is easier to read, keeps every material fact, and follows the user's requested format and length. |

## Invariant

Simplify the language, not the meaning. Preserve exact commands, paths, identifiers, errors, numbers, code, quotes, conditions, and uncertainty.

## Workflow

1. Identify what the reader needs from this reply: an answer, explanation, decision, procedure, or next action.
2. When no active format skill controls the opening, put that result in the first sentence. If the cause is unknown, say so before giving likely causes.
3. Use familiar words and one main idea per sentence. Keep a necessary technical term and explain it once when the reader may not know it.
4. Apply the matching response shape below. Keep any format required by another active skill.
5. Read the reply once. Confirm that every fact remains supported and that the reader knows the result or next action.

## Response shapes

| User need | Shape |
|---|---|
| Direct answer | Answer first; add the reason only when it changes understanding. |
| Explanation | State the mechanism, then its result. Define unfamiliar jargon near its first use. |
| One next action | End with `Next: <exactly one action>`. Keep later actions for a later turn. |
| Procedure or plan | Use a numbered list with one bounded action per step. |
| Uncertain diagnosis | State what is unknown, what the evidence supports, and the next check. |
| Required template | Keep the template and simplify only its prose. |

## Writing rules

- Use concrete subjects and verbs. Name the actor when it matters.
- Prefer common words, short sentences, and natural contractions.
- Repeat the exact technical term when precision matters. Do not rotate synonyms.
- Match the user's requested depth and length. Add detail only when it changes the answer or action.
- Treat the reader as a capable peer. Explain the unfamiliar term, not the whole field.
- Return the answer itself. A one-reply request does not change later replies; persistent mode requires an explicit request.

## Example

User: `Production returns 502 after the auth middleware change. Give me the cause and one next action.`

Reply:

```text
I cannot name the exact cause without production logs. A 502 means the service in front of the app did not get a valid response, so the new middleware probably crashed, timed out, or blocked the request.

Next: Check the production app logs for the first error after the deploy.
```

## Common mistakes

| Mistake | Correct move |
|---|---|
| Replacing technical terms with vague everyday words. | Keep the exact term and explain it once. |
| Dropping a condition to shorten the reply. | Keep the condition; split the sentence instead. |
| Turning simple English into childlike or fragment-heavy speech. | Use normal sentences for a capable peer. |
| Giving a full plan when the user asks for one action. | Give exactly one next action. |
| Replacing another skill's output structure. | Keep that structure and simplify its field contents. |

## Red flags

- An acronym or internal term appears before the reader can understand it.
- The rewrite changes a command, identifier, number, condition, or uncertainty.
- The reply sounds like a tutorial when the user asked for a direct answer.
- `Next:` contains more than one action.

## Verification gate

- When no active format skill controls the opening, the first sentence gives the answer, result, or honest uncertainty.
- Each sentence has one main idea.
- Necessary jargon is either already appropriate for the reader or explained once.
- Exact technical text and every material qualifier remain unchanged.
- The response shape matches the user's request and any active format skill.
