---
name: proof-before-plan
domain: workflow
description: Use when a developer wants AI help planning or implementing code without losing ownership, comprehension, TDD discipline, or decision control; especially when asking for concise implementation details, tradeoffs, proof targets, or user-consulted planning before code.
depends-on: ["test-driven-development"]
chains-to: null
suggests: ["grill-me-fast", "grill-with-docs", "ideal-example-clone", "refactor-transaction", "invariant-hunter"]
---

# Proof Before Plan

Preserve developer agency by naming the proof target before planning implementation. TDD is the spine; concise reasoning is the handrail.

## Core Contract

Before planning code, state the proof target:
- failing test
- repro
- invariant
- acceptance check
- manual evidence, only when automation is impossible

Then give a compact route:
1. **Proof** - what must fail first and why it proves the behavior.
2. **Route** - likely files/symbols, minimal change path, no broad cleanup.
3. **Decisions** - only real tradeoffs, with chosen default and reverse condition.
4. **Grill gate** - pause only for load-bearing user decisions.
5. **TDD loop** - RED -> GREEN -> REFACTOR -> evidence recap.

## Companion Skills

Use these before planning when their trigger is present:
- `ideal-example-clone` - user names a reference implementation, says "do it like this", or a proven local pattern should set architecture, tests, or conventions.
- `refactor-transaction` - route includes rename, move, extraction, migration, public API cutover, caller migration, or shim/alias/re-export pressure.

## Grill Gates

Ask the user before code when the answer changes architecture, public API, domain meaning, data semantics, security posture, or how much code the human wants to write.

Use:
- `grill-me-fast` for implementation choices, collaboration mode, and agency level.
- `grill-with-docs` for domain terms, glossary conflicts, docs updates, and ADR-worthy decisions.

Do not ask when tools, docs, tests, or code can answer. Look it up and continue.

## Output Shape

```markdown
**Proof:** <failing test/repro/invariant/acceptance check>
**Route:** <3-6 concrete steps, smallest verified path>
**Companion:** <ideal-example-clone/refactor-transaction/etc., or "none">
**Decisions:** <only if real; default + why + reverse if>
**Grill gate:** <question, or "none">
**Next turn:** <what the developer or agent does first>
```

Keep it short enough that the developer can retype, challenge, or take over.

## TDD Discipline

If production code already exists without a failing proof target, do not bless tests-after as equivalent.

Default response:
- keep it only as throwaway exploration
- write the failing test against intended behavior
- re-implement or reshape from the test
- preserve code only after the test exposes it as correct design, not because of sunk cost

## Rationalization Table

| Excuse | Reality |
|---|---|
| "I already wrote most of it" | That is exploration unless a failing proof target led it. |
| "Just add tests after" | Tests-after verify memory of code; TDD discovers required behavior. |
| "Don't slow me down" | One proof target is the shortcut; debugging unproven code is slower. |
| "The user wants concise" | Concise means no ceremony, not no proof. |
| "I'll ask the user" | Ask only for load-bearing choices tools cannot answer. |
| "I'll explain every detail" | Explain only decisions and tradeoffs that affect future control. |

## Red Flags

Stop and reset the route when you notice:
- plan starts with files before proof
- implementation starts before RED
- tests are added after existing code as validation theater
- user is asked for repo facts
- tradeoffs section lists obvious non-decisions
- ambiguity touches domain language or public contracts
- AI hides the next concrete developer action

## Example

User: "Plan the auth error-state fix fast. I want to do it myself."

```markdown
**Proof:** failing component/API test: auth failure shows the expected error state and does not stay loading or redirect.
**Route:** reproduce state -> find existing auth error mapping -> add one RED test -> patch only that branch -> run targeted test + repro.
**Companion:** none.
**Decisions:** no auth refactor; reverse if the error state is produced by duplicated mappings in multiple flows.
**Grill gate:** What is broken: missing message, wrong message, stuck loading, or redirect?
**Next turn:** You write the RED test; I can review it before implementation.
```
