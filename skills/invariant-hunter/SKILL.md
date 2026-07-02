---
name: invariant-hunter
description: Use when test design must start from domain invariants, domain docs, glossary/context-map, typed schemas, source examples, edge cases, silent failures, or docs-to-tests traceability
---

# Invariant Hunter

Turn documented domain truth into behavior test obligations. The bridge is: DOCS => invariants => edge cases => narrow tests.

<HARD-GATE>
Every obligation MUST test observable behavior: returned value, state transition, persisted record, emitted event, response, or explicit error. A mock interaction, private helper call, snapshot, or default value assertion is not coverage for an invariant.
</HARD-GATE>

## Atlas Pillar Contract

| Pillar | Role in the hunt |
|---|---|
| DOCS | Source of current domain promises: domain docs, glossary, context map. ADRs/specs/examples are rationale, input, or candidate evidence until paired with current docs/code/tests. |
| CODE | Evidence of current behavior: schemas, guards, branches, adapters, fallbacks |
| TESTS | Executable obligations that lock the invariant at the narrowest useful boundary |
| MEMORY | Prior incidents, regressions, user corrections, and silent-failure lessons |

The output must preserve traceability across pillars. An invariant without evidence is a question, not a test obligation.

## When to Use

Use this skill when the task mentions any of:
- test design, test plan, regression tests, edge cases, examples, fixtures
- domain invariants, business rules, glossary terms, context-map boundaries
- silent failures, swallowed errors, invalid states, missing negative cases
- docs-to-tests, specs-to-tests, requirements-to-tests when the source is accepted, current, or confirmed by code/tests
- preserving behavior during refactor, migration, or cleanup

Do not use it for:
- snapshot-only UI polish checks
- plumbing tests that only assert mocks were called
- implementation-detail coverage with no domain behavior
- code paths whose required behavior is unknown and not documented anywhere

## Required Inputs

| Input | Required | Use |
|---|---:|---|
| Domain docs | Yes when present | Extract vocabulary, promises, state rules, forbidden outcomes |
| Glossary | Yes when present | Normalize terms and prevent synonym drift |
| Context map | Yes when present | Find ownership boundaries and cross-context contracts |
| Typed schemas | Yes when present | Extract shape, range, nullability, defaults, parse/error rules |
| Source examples | Yes when docs are thin | Propose candidate behavior; confirm with current docs, code, or tests before locking |
| Existing tests | Yes when present | Find covered invariants, gaps, and test style |
| Bug/report/change request | Yes | Anchor the hunt to the behavior at risk |

If docs and code disagree, report the disagreement as an invariant conflict. Do not silently pick the easier source.

## Evidence authority

| Source | Treat as |
|---|---|
| Domain docs, glossary, context map | Domain promises when current and not contradicted by code/tests. |
| Typed schemas and boundary validators | Executable contract evidence. |
| Existing behavior tests | Executable behavior evidence. |
| Source examples | Implementation evidence; confirm with current docs, code, or tests before making it a domain promise. |
| ADRs | Decision rationale only; not a behavior promise unless paired with current docs/code/tests. |
| Specs, plans, brainstorms, tickets | Requirement input only; do not lock as invariant until accepted and evidenced by code/docs/tests. |

If source authority is unclear, report a candidate invariant instead of creating a locking test.

## Workflow

| Step | Action | Output |
|---:|---|---|
| 1 | Name the domain surface and affected context | Scope statement |
| 2 | Read only relevant docs, schemas, examples, and tests | Evidence list |
| 3 | Extract candidate invariants as testable statements | Invariant table |
| 4 | Classify each invariant form | Test strategy |
| 5 | Generate edge cases from boundaries and forbidden states | Edge-case list |
| 6 | Select the narrowest behavior test per obligation | Test obligations |
| 7 | Reject mock-heavy or plumbing-only tests | Cleaner test plan |
| 8 | Mark traceability: DOCS/CODE/TESTS/MEMORY | Final report |

## Invariant Forms

| Form | Pattern | Test obligation |
|---|---|---|
| Identity | X is the same entity across Y | Same id/key retains meaning across calls, storage, display |
| Ownership | Context A owns term/state X | Other contexts cannot mutate or reinterpret X |
| State transition | X may move A => B only when C | Valid transition passes; invalid transition fails loudly |
| Mutual exclusion | X and Y cannot both be true | Conflicting inputs produce rejection, not partial success |
| Required pair | X requires Y | Missing pair fails at boundary with useful error |
| Range/bounds | X is min/max/finite/non-empty | Boundary values and just-outside values are tested |
| Temporal | X must happen before/after Y | Out-of-order operations fail or defer explicitly |
| Idempotency | Repeating X has same effect | Duplicate call does not duplicate domain outcome |
| Conservation | Total/count/status remains consistent | Derived values match source after mutation |
| Authorization | Actor X may do Y only under Z | Unauthorized path fails without side effects |
| Failure visibility | Invalid X must be reported | No swallowed error, default success, or ambiguous null |
| Schema semantics | Field X means Y, not just type Z | Parse/validation test asserts business meaning |

Write invariants as behavior, not structure:
- Good: "A closed invoice cannot accept a new payment."
- Bad: "InvoiceService calls validateStatus()."

## Evidence Extraction

| Source | Look for | Convert to invariant |
|---|---|---|
| Domain doc | "must", "only", "never", lifecycle, examples | Rule + forbidden state when current and not contradicted |
| Glossary | term definition, synonym, ownership | Vocabulary contract |
| Context map | upstream/downstream, anti-corruption boundary | Integration contract |
| Schema/type | enum, union, optional, default, branded type | Valid/invalid input classes |
| Source example | branch, guard, error, fallback, comment | Candidate behavior; confirm before promoting to domain invariant |
| Existing test | missing boundary, over-mocked case, asserted calls | Gap or replacement obligation |
| Incident/memory | prior bug, regression, correction | Regression candidate; confirm current desired behavior before locking |

## Test Selection

MUST choose the first test level that proves the behavior without faking the domain:

| Behavior span | Preferred test | Avoid |
|---|---|---|
| Pure rule or value object | Unit behavior test | Testing private helper calls |
| Schema/parser/DTO | Parse/validation table test | Snapshot of schema shape only |
| Use case/service rule | Use-case test with real collaborators when cheap | Mock-only orchestration test |
| Persistence invariant | Repository/integration test | Mocked database success path |
| API boundary | Request/response test | Controller method call with mocked service only |
| Cross-context contract | Contract or integration test | Duplicated assertions in both contexts with no shared behavior |
| Regression/silent failure | Negative behavior test | Test that only asserts logger was called |

A valid obligation names:
1. invariant under test
2. source evidence
3. minimal behavior path
4. positive case
5. negative or boundary case
6. expected failure signal
7. why mocks do not hide the invariant

## Edge-Case Derivation

| Invariant type | Edge cases to generate |
|---|---|
| Required field | missing, null, empty, whitespace, wrong context |
| Numeric/date range | min, max, just below, just above, timezone/order boundary |
| Enum/state | every valid value, unknown value, illegal transition |
| Collection | empty, one, duplicate, conflicting pair, max size |
| Identity | same id different context, different id same label, stale id |
| Permission | owner, non-owner, expired role, elevated role, anonymous |
| Idempotency | duplicate request, retry after partial success, replay with changed input |
| Failure visibility | invalid input, downstream failure, ambiguous fallback, swallowed exception |

For each invariant, choose the smallest edge set that can falsify it. Do not add cases only to increase count.

## Output Contract

Return a compact report:

```markdown
## Invariant Test Obligations

| ID | Invariant | Evidence | Risk | Test obligation | Test level | Cases |
|---|---|---|---|---|---|---|
| INV-001 | ... | DOCS:... / CODE:... | silent failure / boundary / regression | ... | unit/integration/api/contract | positive, boundary, negative |

## Candidate Invariants / Unknown Authority
| Candidate | Source | Missing authority | Next decision |
|---|---|---|---|
| ... | ADR/spec/example/issue/source example | current domain doc / code / test confirmation | ask / document / implement proof first |

## Conflicts
- DOCS says ... but CODE does ... => ask/update before locking test.

## Refusals
- Refused mock-only test for ... because it would not prove ...
```

If implementing tests, create or update only tests tied to listed obligations. Keep each test name in domain language.

Do not implement tests from candidate invariants until authority is resolved or the candidate is proven by current code/docs/tests.

## Stop and Refusal Cases

Stop and ask or report blocked when:
- the invariant depends on a product decision not present in docs, schemas, code, tests, or issue text
- docs conflict with code and both are plausible sources of truth
- the only possible test would assert implementation plumbing, not behavior
- required external system behavior cannot be exercised or bounded locally
- the requested test would encode an insecure, incorrect, or obsolete rule

Refuse these test shapes:
- "assert function X was called" when the observable outcome can be tested
- mocks for the component that owns the invariant
- tests that only mirror default config values
- broad end-to-end tests for a rule provable at a narrower boundary
- snapshots as the only proof of a domain rule
- TODO tests, skipped tests, or placeholder cases

## Common Mistakes

| Mistake | Fix |
|---|---|
| Treating types as full behavior | Add semantic cases: invalid state, boundary, forbidden transition |
| Copying docs into tests verbatim | Convert each sentence into falsifiable behavior |
| Testing collaborators instead of outcomes | Assert domain result, persisted state, response, or error |
| Mocking the owner of the rule | Use the real rule owner; mock only expensive external edges |
| Covering only happy paths | Add at least one negative or boundary case per invariant |
| Ignoring glossary terms | Use canonical terms in test names and fixtures |
| Hiding conflicts | Report DOCS/CODE disagreement before writing locking tests |
| Making one giant test | Split by invariant so failure identifies the broken rule |
| Testing current defaults | Test the rule that makes the default valid, not the literal default |
| Accepting silent fallback | Assert explicit failure, recovery, or documented degraded state |

## Quality Bar

A finished invariant hunt is acceptable only when:
- every proposed test traces to DOCS, CODE, TESTS, or MEMORY evidence
- every high-risk invariant has a positive and negative/boundary obligation
- tests are behavior-focused and narrow
- mocks cannot make the invariant pass falsely
- conflicts and unknowns are explicit
- no skipped, placeholder, or plumbing-only tests are presented as coverage
