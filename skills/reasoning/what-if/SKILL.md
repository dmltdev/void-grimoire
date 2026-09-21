---
name: what-if
description: Use when the user asks what if, what could happen, what would break, or requests a bounded exploration of unlikely scenarios, counterfactuals, failure scenarios, or scenario planning for a decision, design, plan, or system; not for exhaustive test matrices, threat models, premortems, forecasts, root-cause analysis, or implementation.
---

# What If

Test a decision or design against a few possible scenarios that could materially change the action.

## Core contract

| Question | Required answer |
|---|---|
| Trigger | A user asks a what-if question or wants unlikely, edge, failure, or counterfactual scenarios explored. |
| Boundary | This is read-only, bounded scenario analysis. It never edits files or implements the hypothetical. It does not replace a threat model, test matrix, premortem, forecast, or root-cause analysis. |
| Behavior | Surface the smallest set of distinct, possible scenarios that could change the decision; reject impossible or irrelevant scenarios. |
| Procedure | Fix the question and constraints, generate candidates, filter them, analyze the survivors, then choose a response for each. |
| Proof | Every kept scenario names why it is possible, what changes, how it would be detected, and whether to mitigate, monitor, accept, or discard it. |

## Invariant

Unlikely is not the same as impossible. Keep a low-probability scenario when its impact could change the decision. Discard a scenario when it violates known constraints, duplicates another scenario, or cannot change any action.

Do not invent numeric probabilities. Use `supported`, `possible but remote`, or `unknown` and state the basis.

If the request asks for an exhaustive inventory, test matrix, threat model, premortem, forecast, or root-cause analysis, stop applying this skill and route to that analysis instead of silently capping it.

## Hard output limits

- Analyze only the scenario the user named when the request contains one specific scenario.
- Otherwise keep three scenarios by default and five at most.
- Never print the discarded candidate list, an exhaustive risk catalogue, or a generic checklist.
- If more than five candidates survive, combine related mechanisms or keep only those that change different decisions.

## Workflow

1. State the exact decision, design, plan, or system under pressure.
2. List the known constraints. Mark unsupported premises as assumptions.
3. Generate candidates across different failure mechanisms, not many variants of one mechanism.
4. Filter each candidate with four questions:
   - Is it possible under the known constraints?
   - Is it distinct from the other candidates?
   - Would its consequence be material?
   - Could it change a decision, safeguard, signal, or response?
5. If the user named one scenario, analyze only that scenario. Otherwise keep three scenarios by default. Use one or two when only those survive; use up to five only when each adds a different decision.
6. Include one possible but remote scenario when the user asks for unlikely cases and it has material impact.
7. For each kept scenario, name the trigger, consequence, earliest useful signal, and response.
8. End with the decision: what to change now, what to monitor, what to accept, and what to discard.

## Decision rules

| Situation | Move |
|---|---|
| Plausible and high impact | Mitigate now or change the design. |
| Possible but remote and high impact | Add a cheap safeguard, tripwire, or recovery path; avoid expensive prevention without evidence. |
| Plausible but low impact | Accept it or handle it through ordinary operations. |
| Probability is unknown | Name the missing evidence; prefer a reversible decision or a cheap probe. |
| Violates a known constraint | Discard it in one line with the constraint. |
| Cannot change any action | Omit it. Scenario volume is not thoroughness. |
| The request also asks for implementation | Complete scenario analysis without mutations. Implementation requires a later, separate request. |

## Output contract

```markdown
Question: <decision or system under pressure>
Known constraints: <facts that bound the analysis>
Assumptions: <unsupported premises, or `None`>

### Scenario 1: <specific event>
Plausibility: <supported | possible but remote | unknown> - <basis>
Trigger: <condition that makes the event occur>
Consequence: <material effect>
Signal: <earliest useful observation>
Response: <mitigate now | monitor | accept | discard> - <specific action or reason>


Decision:
- Change now: <bounded change, or `None`>
- Monitor: <tripwire or signal, or `None`>
- Accept: <residual scenario, or `None`>
- Discard: <impossible or irrelevant scenario and reason, or `None`>
```

Keep the answer proportional and use the output contract. Do not add a checklist or exhaustive catalogue after the decision.

Repeat the scenario block only when multiple scenarios survive. A named hypothetical emits exactly one block. Use commas, semicolons, colons, parentheses, or hyphens instead of em dashes.

## Example

Question: What if a mutable collection changes while a client follows a cursor?
Known constraints: Results sort by descending creation time and unique ID; clients may request later pages after inserts or deletes.
Assumptions: The API promises a fixed traversal boundary, not a historical snapshot.

### Scenario 1: New records arrive before the cursor boundary
Plausibility: supported - the collection accepts concurrent inserts.
Trigger: A record is created after the first page is returned.
Consequence: The client sees a result set that changes during traversal.
Signal: Integration checks observe records created after traversal start in later pages.
Response: mitigate now - include an initial high-water mark in the cursor and every later query.

### Scenario 2: The cursor record is deleted
Plausibility: supported - records can be deleted between requests.
Trigger: The last returned record is deleted before the next request.
Consequence: A cursor that depends on loading that record fails or skips data.
Signal: The next-page request cannot resolve the stored record ID.
Response: mitigate now - encode the ordering values in the signed cursor; do not require the record to exist.

Decision:
- Change now: Bind cursors to an initial high-water mark and complete ordering values.
- Monitor: Cursor rejection rate by reason.
- Accept: Pages can shrink when records are deleted.
- Discard: Perfect live consistency, because it conflicts with the stable-traversal contract.

## Common mistakes

| Mistake | Correct move |
|---|---|
| Producing twenty generic risks. | Keep only distinct scenarios that change a decision. |
| Dismissing a remote scenario because it is rare. | Compare material impact and cost of a safeguard. |
| Treating a theoretical possibility as actionable. | Check constraints and whether any response would change. |
| Assigning made-up percentages. | Use qualitative plausibility and state the basis. |
| Mixing scenarios with causes or test cases. | Keep one event and one consequence per scenario. |
| Implementing the hypothetical in the same request. | Finish the analysis without mutations; wait for a later, separate implementation request. |

## Verification gate

- The question and known constraints are explicit.
- Unsupported premises are labeled as assumptions.
- The kept scenarios use different mechanisms and each can change a decision.
- At least one possible but remote scenario is considered when unlikely cases were requested.
- Impossible, duplicate, and actionless scenarios are discarded rather than expanded.
- No numeric probability appears without evidence.
- Every kept scenario includes plausibility basis, trigger, consequence, signal, and response.
- The final decision separates change now, monitor, accept, and discard.
- The answer uses no em dash characters.
- No files, repository state, or external systems were changed.
