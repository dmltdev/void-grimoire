---
name: unslop
domain: void-grimoire
description: Use when the user invokes /unslop, when a verifier dispatch is about to be sent during a CHAOS or babysat orchestration run, or when the user rejects a worker/aggregated output ("no", "wrong", "redo", "that's slop", or overturning a babysitter PASS). Injects the project-local slop catalog into verifier prompts, and on rejection prompts the user to classify what made the output slop and persists the entry. Project-local memory at `.chaos/slop-examples.md`. Bootstraps from babysitter-orchestrator's slop vectors.
depends-on: ["babysitter-orchestrator"]
chains-to: "learn-correction"
suggests: []
---

# unslop

Inline slop classifier for orchestration runs. Three jobs: inject the catalog into verifiers, classify rejections, persist entries. No HTML, no exploration phase. The orchestration run is the exploration; you just file what gets caught.

## Project-local file

`.chaos/slop-examples.md` at repo root. Same directory as babysat `orchestrate-chaos` state/intervention files. Create lazily.

## Bootstrap (first run only)

If `.chaos/slop-examples.md` does not exist, create it with the slop-vector skeleton from `babysitter-orchestrator/references/slop-mapping.md`. Vectors as H2 headings, no examples yet:

```markdown
# Slop catalog — <repo name>

Project-local record of slop instances caught during orchestration. Each entry is a concrete output snippet plus the vector that classifies it. Inject into verifier prompts via /unslop.

## Fake pass
## Context loss
## Scope substitution
## Prompt rot
## Verifier softness
## Artifact drift
## Security blind spot
## Other (name the vector inline)
```

Do not pre-populate with examples. The catalog earns its weight from real incidents only.

## Job 1: Inject into verifier prompts

When the babysitter (or master) is about to emit a VERIFY dispatch into `.chaos/interventions.md`, read `.chaos/slop-examples.md` and append a `Known slop vectors for this project:` contract block to the verifier prompt. Shape:

```markdown
Known slop vectors for this project (from .chaos/slop-examples.md):
- <vector>: <one-line summary of the canonical example>
- <vector>: <one-line summary>
...
Falsify against these vectors first. If the output matches a known vector, FAIL and cite the entry.
```

If the catalog has no entries under a vector heading, omit that vector from the block. Empty catalog => no block, but the verifier still receives the generic `slop-mapping.md` vectors via the babysitter spec.

## Job 2: Classify rejections

Trigger when the user signals rejection of an orchestration output:

- explicit: "no", "wrong", "redo", "that's slop", "this is garbage"
- implicit: overturning a babysitter PASS, asking the master to rerun a worker, discarding aggregated output

Ask **one** load-bearing question, in this exact shape:

```
What made this slop?
1. Pick a vector: fake pass | context loss | scope substitution | prompt rot | verifier softness | artifact drift | security blind spot | other (name it)
2. Paste the offending snippet (5-30 lines, smallest piece that shows the slop)
3. One sentence: what the right output would have looked like
```

Do not ask follow-ups. If the user gives a vague answer ("it just felt wrong"), record it under `## Other` with their words verbatim — the catalog accepts noise; the verifier-injection step filters it later.

## Job 3: Persist the entry

Append to `.chaos/slop-examples.md` under the matching H2 heading. Entry shape:

```markdown
### <ISO timestamp> — <phase: dispatch | workers | aggregation | signoff>
- **What:** <user's one-sentence summary>
- **Snippet:**
  ```
  <pasted offending output>
  ```
- **Right shape:** <user's one-sentence target>
- **Run:** <herdr session id or "unknown">
```

Chain to `learn-correction` for the persistence write so the entry also benefits from the project's correction-learning pipeline (it may surface a project-wide rule worth promoting to `AGENTS.md`/`CLAUDE.md`). `learn-correction` decides whether to promote; `/unslop` only files the slop instance.

## Hard rules

- Never invent slop. If the user has not rejected anything, do nothing — `/unslop` is reactive.
- Never edit the offending output. You classify; you don't fix.
- Never bootstrap with synthetic examples. An empty catalog is a valid catalog.
- Never make `/unslop` block the orchestration run. Classification is async — file the entry, return control, let the master continue.
- Never inject the catalog block into worker prompts. Catalog goes into *verifier* prompts only. Workers receive their normal contracts.
