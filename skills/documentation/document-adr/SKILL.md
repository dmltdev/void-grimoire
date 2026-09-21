---
name: document-adr
description: Use when recording an accepted or proposed hard-to-reverse architecture, API, persistence, rollout, boundary, or tooling decision as an Architecture Decision Record.
---

# Document ADR

Record a durable decision with its context, alternatives, and consequences so future engineers do not need to re-decide it.

## Core contract

An ADR records a decision, not an accomplishment, research finding, or implementation plan. Use the target repository's established ADR convention when it exists. Do not invent a decision, rejected alternative, consequence, owner, status, or source link.

| Decision state | Required status |
| --- | --- |
| User or repository evidence explicitly accepts the decision | Local accepted status, or `Accepted` when no local vocabulary exists. |
| The decision is still being evaluated or the user asks for a draft | Local proposed status, or `Proposed` when no local vocabulary exists. |
| Existing ADR has been replaced | Follow the local supersession convention; do not edit history away. |

## Boundaries

- Do not use for generic documentation, a project summary, an idea note, a design proposal, or a plan.
- Do not create an ADR for discovered facts, routine implementation details, or reversible choices.
- Do not modify a prior ADR unless the user asks to update or supersede it.
- Do not create a second ADR naming scheme when the repository already has one.

## Workflow

1. Identify the target repository, decision, evidence of status, decision drivers, real alternatives, and expected consequences. Use supplied facts and repository evidence before asking.
2. Inspect ADR conventions in this order: configured ADR tooling, `docs/adr/`, `docs/adrs/`, `docs/decisions/`, then two or three existing ADRs. Reuse their location, filename, number, title, headings, and status vocabulary.
3. If no convention exists, create `docs/decisions/NNNN-kebab-case-title.md`, beginning at `0001`. Use this shape:

   ```markdown
   # ADR-NNNN: <decision title>

   ## Status
   Proposed | Accepted

   ## Date
   YYYY-MM-DD

   ## Context
   <decision drivers and constraints>

   ## Decision
   <the choice and why it fits the context>

   ## Alternatives Considered
   ### <alternative>
   <real benefit, drawback, and rejection reason>

   ## Consequences
   <positive, negative, migration, operational, or ownership effects>
   ```

4. Preserve only supported content. Omit an alternative rather than fabricate one; state that no alternatives were documented only when that is itself evidence.
5. Write the ADR. For an accepted decision, state the accepted choice directly. For an unresolved decision, preserve the uncertainty under the local proposed status.
6. Re-read the artifact and verify its path, convention, status, decision rationale, alternatives, consequences, and links.

## Output contract

After writing, return:

```markdown
**ADR saved.**
- Path: `<path>`.
- Status: `<status>`.
- Decision: <one sentence>.
- Alternatives: <named alternatives, or "none documented">.
- Verification: <convention and content checks observed>.
```

## Verification gate

- The ADR uses the target repository's known convention, or the documented default when none exists.
- Its number, filename, title, and status match that convention.
- Context, decision, alternatives, and consequences contain only supported facts.
- The status matches evidence of acceptance or uncertainty.
- Links resolve when included.
- The completed ADR was re-read.

## Red flags

| Failure | Correct action |
| --- | --- |
| Treating a completed implementation as a decision. | Record it in a recap or changelog, not an ADR. |
| Marking an undecided choice as accepted. | Use the local proposed status. |
| Using a generic template before reading local ADRs. | Reuse the existing convention first. |
| Listing plausible alternatives not actually considered. | Omit them or state the evidence gap. |
| Rewriting a historical ADR after the decision changed. | Write a new ADR that supersedes it. |
