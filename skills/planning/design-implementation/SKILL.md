---
name: design-implementation
description: Use when the user asks to design or plan a repository-backed implementation before code, compare implementation approaches, propose architecture, or prepare an approval-gated technical plan; especially for multi-file changes, refactors, migrations, public API/schema/config changes, jobs, data-flow changes, or prompts like "design the implementation", "implementation plan", "technical design", "plan before coding", or "wait for approval".
depends-on: ["lookup-docs"]
chains-to: null
suggests: ["ideal-example-clone", "refactor-transaction"]
---

# Design Implementation

Produce a repo-grounded technical design. Do not edit code from this skill alone.

## Contract

The default deliverable is an approval packet, not implementation.

Allowed before the packet:
- read docs, code, config, tests, schemas, examples, and issue/spec context
- run non-mutating inspection commands
- map callsites, data flow, cron/jobs, config keys, public APIs, and tests

Forbidden before explicit post-packet approval:
- file edits, writes, deletes, branch changes, commits, migrations, generators, or formatters
- implementation disguised as scaffolding
- compatibility shims or narrowed scope unless the packet recommends them and the user approves

If the user asks for design and implementation in one prompt, design first and wait.

## Design Process

1. Ground the repo. Read the local docs first, then the smallest code/test slices that prove the current shape.
2. State the current problem as a design pressure, not a task list.
3. Compare real approaches. Include the boring baseline and at least one rejected alternative when the choice is non-obvious.
4. Pick one recommendation. Name the tradeoff and the condition that would reverse it.
5. Design the cutover. Include modules/files/symbols, caller migration, deleted obsolete paths, data/state ownership, config/health/job keys, and external contracts.
6. Design verification before implementation. Include tests, smoke checks, failure cases, and behavior that must not regress.
7. End with an explicit approval wait: `I will not modify code until explicit approval.`

Use `ideal-example-clone` when a local exemplar should define the shape. Use `refactor-transaction` when the design includes a move, rename, extraction, migration, public API cutover, or shim pressure.

## Output Shape

For default or bigger changes:

```markdown
**Verdict:** <recommended approach in one line>

## Current problem
<repo-grounded design pressure and evidence>

## Approaches
1. <approach> - pros, cons, risk
2. <approach> - pros, cons, risk

## Recommended design
<target architecture, ownership, data flow, APIs, state, jobs/config/health, cutover rules>

## File impact
- Create: <paths>
- Change: <paths/symbols>
- Delete: <obsolete paths/symbols>
- Preserve: <contracts that must not change>

## Verification design
- <focused tests>
- <smoke/build/typecheck/runtime checks>
- <negative/concurrency/failure cases when relevant>

## Reverse / unknowns
Reverse if: <conditions>
Unknowns: <facts still external to repo/tools>

I will not modify code until explicit approval.
```

For tiny changes, use a compact version with the same facts: verdict, impact, verification, reverse/unknowns, and approval wait.

## Red Flags

Stop and redesign if:
- the packet lists files before explaining the design pressure
- the recommendation preserves duplicate systems without an explicit operational reason
- a public contract changes without caller/test/docs impact
- verification only says "run tests" without naming the behavior under proof
- the packet asks the user for facts visible in the repo
- the agent starts editing before approval
