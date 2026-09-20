---
name: failure-memory-compiler
description: Use when learning from failures, converting memory into tests/gates, preventing repeated agent mistakes, boss decks, corrections, verifier failures, PR comments, session-friction logs, bad agent outputs, or anti-regression checks.
---

# failure-memory-compiler

Turn failure evidence into operational memory. Operational memory changes future behavior through invariants, verifier prompts, tests, review gates, or dispatch constraints. Archival notes only preserve context; executable quality gates block, warn, or route future work.

## When to use

| Trigger | Use this skill |
|---|---|
| User corrects an agent after a wrong answer, bad edit, or missed constraint | Yes |
| Verifier fails a worker output | Yes |
| PR comment identifies a recurring review issue | Yes |
| Session-friction or agent-instruction history shows a pattern | Yes |
| Agent repeats a known mistake across tasks | Yes |
| User asks for a boss deck, failure deck, lessons learned, memory-to-test conversion, or gate design | Yes |
| One-off journal, handoff, status recap, or narrative RCA with no future gate | No |

## Core distinction

| Type | Purpose | Valid storage | Promotion rule |
|---|---|---|---|
| Archival note | Records what happened | session summary, friction corpus, PR notes, issue comment | Keep archival unless it names a repeatable future failure |
| Operational memory / executable quality gate | Prevents repeat failure | skill rule, AGENTS/CLAUDE rule, verifier prompt, test, CI gate, checklist, dispatch contract | Promote only with evidence and an enforceable gate |

Do not call a note "memory" unless it changes a future decision, check, prompt, or test.

## Atlas pillar routing

| Pillar | Compile memory into | Example gate |
|---|---|---|
| DOCS | Skill rule, AGENTS/CLAUDE rule, runbook section, PR template note | Reviewer checks required output fields before merge |
| CODE | Source fix, type/API invariant, static check, runtime guard | Bad input cannot silently fall through |
| TESTS | Unit, integration, e2e, regression, fixture, verifier scenario | Negative example fails; positive example passes |
| MEMORY | Boss deck card, session-friction reflection, agent-instruction rule, dispatch constraint | Future verifier receives the failure card before judging work |

Pick one primary pillar. Add a secondary pillar only when the failure crosses a boundary, e.g. a PR comment (`DOCS`) proves a missing regression test (`TESTS`).

## Required inputs

| Input | Required | Notes |
|---|---:|---|
| Failure evidence | Yes | Correction text, verifier output, PR comment, bad output snippet, or friction event |
| Expected behavior | Yes | What should have happened instead |
| Scope | Yes | Project, skill, agent, file family, command, workflow, or task type |
| Trigger | Yes | Future situation where this memory must load or gate |
| Negative example | Yes | Smallest observed wrong behavior |
| Positive example | Yes | Smallest acceptable behavior |
| Invariant | Yes | Observable always-rule derived from the failure |
| Gate condition | Yes | Exact check that fails the negative example and passes the positive example |
| Expiry | Yes | Date, release, clean-run threshold, or permanent reason |
| False-positive handling | Yes | Observable exception and handling path |
| Recurrence signal | Yes | Repeated event, high-impact miss, or explicit user request to prevent recurrence |
| Existing gate surface | Preferred | Tests, verifier, review checklist, prompt contract, lint, CI, skill, runbook |
| Owner | Preferred | Person, agent, or team that revisits the gate |

Stop and ask one question only if the expected behavior or scope is unknowable from evidence.

## Boss deck concept

A boss deck is a small set of canonical failure cards used to train verifiers and agents against the project's hardest recurring mistakes.

| Card field | Meaning |
|---|---|
| Boss name | Short memorable failure class, e.g. `Scope Substituter`, `Fake Verifier`, `Silent Fallback` |
| Tell | Observable symptom in output or behavior |
| Failure move | What the agent did wrong |
| Counter-move | Required future behavior |
| Gate | Test, verifier check, prompt clause, or review rule that catches it |
| False positive escape | Evidence that proves this is not the boss |
| Expiry | Condition or date when the card is reviewed or retired |

Boss decks are not lore. They are compact adversarial fixtures for verifier prompts, review checklists, and regression tests.

## Memory-to-invariant schema

Use this shape for each compiled memory:

```yaml
id: FM-YYYYMMDD-short-slug
source:
  type: correction | verifier_failure | pr_comment | session_friction | bad_agent_output | boss_deck
  reference: <link, file path, issue, PR, transcript id, or local note>
trigger:
  when_to_apply: <observable future situation that loads this memory>
  do_not_apply_when: <boundary that prevents overreach>
failure:
  negative_example: <smallest observed wrong output or behavior>
  why_it_failed: <one sentence>
expected:
  positive_example: <smallest acceptable output or behavior>
  invariant: <must always hold, stated as an observable rule>
gate:
  surface: test | verifier_prompt | code_review | dispatch_contract | skill_rule | ci | manual_check
  condition: <exact check that fails bad behavior and passes good behavior>
  owner: <person, agent, team, or unknown>
  expiry: <date, release, after N clean runs, or never-with-reason>
false_positive:
  allowed_when: <observable exception>
  handling: <downgrade, skip with citation, ask user, or keep failing>
status: proposed | active | archived
```

Invariant rules:
- Observable, not aspirational: `verifier must cite command output` beats `be rigorous`.
- Small enough to test or review.
- Names the forbidden failure and the required counter-behavior.
- Has an expiry or a reason it is permanent.

## Workflow

1. **Collect evidence**
   - Preserve the smallest wrong snippet.
   - Capture the user's correction or verifier reason verbatim when available.
   - Record where it came from.

2. **Classify the failure**
   - `knowledge gap`: agent did not know a rule.
   - `discipline gap`: agent knew but skipped it under pressure.
   - `contract gap`: prompt or output shape omitted a required field.
   - `gate gap`: no test/verifier/review step could catch it.
   - `false-positive gap`: gate exists but catches valid work.

3. **Decide archive vs gate**

| Question | If yes | If no |
|---|---|---|
| Can this recur? | Continue | Archive only |
| Is the expected behavior clear? | Continue | Ask one question or archive with unknown |
| Can a future check observe it? | Create operational memory | Archive as context |
| Is it worth blocking or warning on? | Make a gate | Archive as context/training candidate |

Create a boss deck card only when it has an observable tell, counter-move, gate surface, false-positive escape, and expiry. Otherwise keep it archival; do not install lore as a boss.

4. **Compile the invariant**
   - Write one invariant.
   - Add one negative example and one positive example.
   - Attach one gate condition.
   - Add expiry and false-positive handling.

5. **Choose the gate surface**

| Failure shape | Best gate |
|---|---|
| Deterministic code behavior | Unit/integration test |
| Agent output quality | Verifier prompt or review checklist |
| Repeated orchestration slop | Boss deck card injected into verifier prompts |
| Missing dispatch constraint | Dispatch contract clause |
| Repo-wide human/agent convention | AGENTS/CLAUDE rule or skill rule |
| Security/safety issue | CI, review gate, or mandatory verifier check |

6. **Install narrowly**
   - Put the gate at the smallest surface that sees the failure.
   - Avoid global rules for local mistakes.
   - Do not create duplicate gates if an existing one can be tightened.

7. **Validate the compiled memory**
   - Test mentally or with the actual verifier/test if available: bad example fails, positive example passes.
   - Check the false-positive escape is observable.
   - Remove any field that cannot affect future behavior unless it belongs in the archival source.

If the decision is archival-only, use this shape instead:

```markdown
# Failure Memory Decision

## Source
- Type:
- Reference:
- Scope:

## Decision
- Operational gate: none
- Archive reason: <non-recurring | unclear expected behavior | unobservable | not worth blocking/warning>
- Storage target: <session summary | friction corpus | PR note | none>
- Revisit trigger: <what future evidence would promote this>
```

## Output contract

Return or write entries in this order:

```markdown
# Failure Memory Compile

## Source
- Type:
- Reference:
- Scope:

## Trigger
- When to apply:
- Do not apply when:

## Negative Example
<smallest wrong snippet or behavior>

## Positive Example
<smallest acceptable snippet or behavior>

## Invariant
<observable always-rule>

## Gate
- Surface:
- Gate condition:
- Owner:
- Expiry:

## False Positive Handling
- Allowed when:
- Handling:

## Install Plan
- Target file/prompt/test/check:
- Change:
- Verification:
```

For boss decks, output one card per boss using the boss deck fields. Keep cards short enough to paste into verifier prompts.

## Stop / refusal cases

| Case | Action |
|---|---|
| No concrete failure evidence | Refuse to compile; ask for evidence or archive nothing |
| Expected behavior is unknowable | Ask one question; do not invent the rule |
| Gate would encode a personal preference as a blocker | Archive or make non-blocking guidance |
| Gate cannot be observed | Rewrite as observable or keep archival |
| False positives cannot be bounded | Make it warning-only or do not install |
| Memory would expose secrets, private data, or credentials | Redact before storing; never preserve raw secret values |
| Existing gate already covers it | Update the existing gate only if evidence shows it missed |
| Issue is fixed by code, not process memory | Fix code first; compile memory only if recurrence risk remains |

## Common mistakes

| Mistake | Fix |
|---|---|
| Writing a lesson learned with no gate | Add invariant + gate, or mark archival only |
| Keeping a giant transcript snippet | Keep the smallest negative example |
| Making the invariant moralistic | Convert to observable behavior |
| Blocking on vague pattern matches | Add false-positive escape or downgrade to warning |
| Creating global rules from one local miss | Scope to the workflow where evidence occurred |
| Forgetting expiry | Add review date, clean-run threshold, or permanent reason |
| Omitting the trigger | Name the future situation that loads this memory |
| Confusing boss deck with storytelling | Keep only tell, move, counter-move, gate |
| Encoding only the negative example | Add positive example so agents know the right shape |
| Treating PR comments as archival by default | Promote repeated or high-impact comments into gates |
| Letting memory bypass source fixes | Fix the underlying bug, then add memory only for recurrence prevention |
