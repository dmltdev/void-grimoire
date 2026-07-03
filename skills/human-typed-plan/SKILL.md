---
name: human-typed-plan
domain: workflow
description: Use when a developer wants AI help with a feature, bugfix, refactor, or implementation approach while keeping human ownership of code, typing, decisions, and understanding; especially requests to plan, explain logic, compare approaches, or provide implementation steps for the developer to write.
depends-on: ["test-driven-development"]
chains-to: null
suggests: ["grill-me-fast", "grill-with-docs", "ideal-example-clone", "refactor-transaction", "invariant-hunter"]
---

# Human Typed Plan

Preserve developer agency. The AI evaluates options, names the proof, explains the logic, and hands the human a plan they can type themselves.

## Default Contract

Default deliverable: a human implementation packet, not code changes.

Do not edit files, write files, run mutating commands, or start implementation from this skill alone.

If the user invokes this skill and says "finish", "add", "fix", "wire", "implement", "let's do it", or similar implementation language, interpret the ask as: plan the human implementation.

Only switch to agent implementation when the user explicitly says one of:
- "implement it for me"
- "make the changes"
- "edit the files"
- "you code it"

Read/search commands are allowed to ground the packet. Stop after the packet unless a load-bearing question blocks it.

## Core Contract

Before planning code, state the proof target:
- failing test
- repro
- invariant
- acceptance check
- manual evidence, only when automation is impossible

Then give a compact route:
1. **Proof** - what must fail first and why it proves the behavior.
2. **Logic map** - how the main pieces connect: caller -> data/state -> decision point -> output/side effect.
3. **Route** - likely files/symbols, minimal change path, no broad cleanup.
4. **Human steps** - ordered edits the developer can type by hand.
5. **Decisions** - only real tradeoffs, with chosen default and reverse condition.
6. **Grill gate** - pause only for load-bearing user decisions.
7. **Check** - exact targeted command or manual evidence the human should run.

## Companion Skills

Use these before planning when their trigger is present:
- `ideal-example-clone` - user names a reference implementation, says "do it like this", or a proven local pattern should set architecture, tests, or conventions.
- `refactor-transaction` - route includes rename, move, extraction, migration, public API cutover, caller migration, or shim/alias/re-export pressure.

## Grill Gates

Ask the user before the packet only when the answer changes architecture, public API, domain meaning, data semantics, security posture, or how much code the human wants to write.

Use:
- `grill-me-fast` for implementation choices, collaboration mode, and agency level.
- `grill-with-docs` for domain terms, glossary conflicts, docs updates, and ADR-worthy decisions.

Do not ask when tools, docs, tests, or code can answer. Look it up and continue.

## Output Shape

```markdown
**Proof:** <failing test/repro/invariant/acceptance check>
**Logic map:** <caller -> state/data -> branch/invariant -> result>
**Route:** <3-6 concrete steps, smallest verified path>
**Human steps:** <ordered edits the developer can type, with key symbols and why>
**Companion:** <ideal-example-clone/refactor-transaction/etc., or "none">
**Decisions:** <only if real; default + why + reverse if>
**Grill gate:** <question, or "none">
**Check:** <targeted command/manual evidence>
**First typing step:** <first exact test or code edit for the human>
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
| "The user said finish/add/fix" | With this skill loaded, that means plan the human implementation unless they explicitly ask the agent to edit. |
| "I already know the change" | Knowledge belongs in the packet: proof, logic map, route, human steps, check. |
| "I'll just do the RED/GREEN loop myself" | The human is preserving coding skill; hand them the loop unless they asked you to code. |
| "I already wrote most of it" | That is exploration unless a failing proof target led it. |
| "Just add tests after" | Tests-after verify memory of code; TDD discovers required behavior. |
| "Don't slow me down" | One proof target is the shortcut; debugging unproven code is slower. |
| "The user wants concise" | Concise means no ceremony, not no proof or logic map. |
| "I'll ask the user" | Ask only for load-bearing choices tools cannot answer. |
| "I'll explain every detail" | Explain only connections, decisions, and tradeoffs that affect future control. |

## Red Flags

Stop and reset the route when you notice:
- any edit/write/mutating command before explicit implementation permission
- todo list turns the packet into an agent implementation plan
- plan starts with files before proof
- implementation starts before RED
- tests are added after existing code as validation theater
- user is asked for repo facts
- tradeoffs section lists obvious non-decisions
- ambiguity touches domain language or public contracts
- AI hides the next concrete human typing step

## Example

User: "Plan the auth error-state fix fast. I want to do it myself."

```markdown
**Proof:** failing component/API test: auth failure shows the expected error state and does not stay loading or redirect.
**Logic map:** login submit -> auth request -> error mapper branch -> UI error state; loading must clear before render.
**Route:** reproduce state -> find existing auth error mapping -> add one RED test -> patch only that branch -> run targeted test + repro.
**Human steps:** add the RED test first; patch the mapper branch only; avoid auth refactor; run the focused suite.
**Companion:** none.
**Decisions:** no auth refactor; reverse if the error state is produced by duplicated mappings in multiple flows.
**Grill gate:** What is broken: missing message, wrong message, stuck loading, or redirect?
**Check:** targeted component/API test plus one manual failed-login repro.
**First typing step:** write the failing test name and assertion for the broken auth state.
```
