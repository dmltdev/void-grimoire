---
name: babysitter-orchestrator
domain: void-grimoire
description: Use when designing or running long-lived multi-agent orchestration, babysitter/subconscious agents, phase-gate verification agents, context compaction, session handoff, validator tuning, or systems meant to steer AI work away from unusable slop toward a tiny desirable output subset. Authoritative playbook for the babysitter-orchestrator agent and babysat orchestrate-chaos mode.
depends-on: []
chains-to: null
suggests: []
---

# Babysitter Orchestrator

Treat orchestration as search over input/output space. The master is trying to land in a tiny useful subset: working, secure, aligned software. The babysitter keeps the search trajectory coherent; validators make bad regions visible before they compound.

## Roles

- **Master orchestrator**: owns user intent, decomposition, final decisions, and user communication.
- **Babysitter**: runs alongside the master; watches context health, decision drift, unresolved contracts, phase boundaries, and handoff quality. It does not own product decisions.
- **Verifier**: runs between phases or on a cadence; checks artifacts against acceptance criteria, security, functionality, and alignment. It reports evidence, not taste.
- **Continuity session**: a fresh master session launched with a curated prompt when context is stale, overloaded, or polluted.

## Workflow

1. Define the desirable subset in concrete terms:
   - user-visible behavior
   - non-goals
   - safety/security constraints
   - tests or probes that prove the result
   - artifacts that must persist across sessions
2. Start or simulate a babysitter loop:
   - track decisions, assumptions, unresolved questions, active files, test evidence, and risks
   - detect context decay: repeated re-reading, contradictory plans, lost constraints, large transcripts, or phase drift
   - prepare handoff prompts before decay becomes failure
3. Gate each phase with verification:
   - run the narrowest verifier that can falsify the phase
   - require observed evidence: commands, screenshots, diffs, review findings, or manual notes
   - feed failures back into the next prompt as constraints, not as vague advice
4. Tune the system:
   - if output is slop, tighten verifier prompts and acceptance criteria first
   - if progress stalls, loosen process constraints but keep safety checks
   - if the master drifts, relaunch with a continuity prompt

## Babysitter checklist

Maintain a compact state block:

```markdown
Goal: <current user goal>
Desirable subset: <what must be true for success>
Current phase: <phase name and exit criteria>
Decisions: <stable decisions, with reasons>
Open contracts: <APIs, file paths, schemas, prompts workers depend on>
Evidence so far: <commands/artifacts observed>
Risks: <slop vectors: fake pass, scope drift, missing tests, security holes>
Next prompt if relaunched: <self-contained continuity prompt>
```

Trigger a continuity session when any two are true:

- master cannot state current phase exit criteria in one sentence
- same artifact is re-read repeatedly without progress
- accepted constraints conflict or become ambiguous
- tool outputs exceed useful recall
- verification failures are being rationalized instead of fixed
- phase output depends on conversation context not captured in artifacts

## Verifier prompt shape

Use falsification-first prompts:

```markdown
Role: verification agent.
Target: <artifact/phase/files>
Acceptance: <specific claims to falsify>
Evidence required: <commands, inspections, screenshots, diffs>
Do not: implement fixes, broaden scope, judge style unless it affects acceptance.
Report:
- PASS/FAIL
- Evidence observed
- Smallest failing case
- Slop vector, if any
- Suggested next constraint for master prompt
```

Prefer several narrow verifiers over one broad reviewer when failures are independent: functionality, security, maintainability, test adequacy, context continuity.

## Continuity prompt shape

A babysitter-generated relaunch prompt must be self-contained and boring:

```markdown
You are continuing <goal>.
User intent: <one paragraph>
Non-negotiables: <rules and constraints>
Current repo/state: <files changed, commands run, outputs observed>
Decisions already made: <do not reopen unless evidence changes>
Current phase: <task and exit criteria>
Verification failures to fix: <evidence-backed list>
Do not: <scope creep, fake fallbacks, skipped tests>
When done: <exact evidence to produce>
```

## References

- Read `references/slop-mapping.md` when designing validator criteria or explaining why verification steers output quality.
- Read `references/prompt-contracts.md` when writing babysitter, verifier, or continuity prompts.
