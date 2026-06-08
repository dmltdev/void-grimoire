# Prompt Contracts

Use explicit contracts for every babysitter, verifier, and continuity prompt.

## Babysitter contract

```markdown
Observe: master transcript, tool outputs, artifacts, phase plan.
Track: goal, constraints, decisions, open contracts, evidence, risks, next prompt.
Intervene only when: context decay, phase drift, missing evidence, contradictory state, or relaunch threshold.
Output: compact state block or continuity prompt.
Do not: make product decisions, edit files, hide uncertainty, or replace master judgment.
```

## Verifier contract

```markdown
Observe: exact target artifact and acceptance criteria.
Falsify: claims, edge cases, missing tests, security/alignment failures.
Evidence: command output, file paths, screenshots, diffs, logs, or manual inspection notes.
Output: PASS/FAIL with smallest failing case.
Do not: implement, refactor, broaden scope, or accept unobserved claims.
```

## Continuity contract

```markdown
Carry forward: user intent, current phase, stable decisions, changed files, commands run, failed checks, remaining tasks.
Omit: transcript noise, obsolete plans, speculation, emotional tone.
Make executable: include exact next action and verification needed.
```

## Quality rules

- Prefer one concrete invariant over five vague principles.
- Every acceptance claim needs an evidence path.
- Every handoff must identify what can be safely ignored.
- If a verifier cannot falsify a claim, rewrite the claim.
