---
name: skill-forge
description: Use when creating, revising, auditing, testing, or installing agent skills, SKILL.md files, slash-command-style workflows, plugin skills, skill-creator alternatives, prompt-quality guidance, or void-grimoire skill additions.
---

# Skill Forge

Create installable agent skills that change behavior under pressure. A skill is not a tutorial, memory note, or vibes document. It is a load-bearing execution contract for a future agent.

## Core contract

Every shipped skill must answer five questions:

| Question | Required answer |
|---|---|
| Trigger | Exactly when another agent must load it. |
| Boundary | What adjacent work it must not steal. |
| Behavior | What the skill changes after it loads. |
| Procedure | What the agent does, in order. |
| Proof | What evidence is required before completion. |

Missing answer => not ready.

## Fast grilling

Do not ask what repo context can answer. Infer reversible defaults and state them.

Ask one batch only when a missing answer changes the core skill:

1. **Skill name and trigger:** recommended default = narrow kebab-case name from the repeated user action.
2. **Primary failure class:** recommended default = the mistake the future agent is most likely to make under pressure.
3. **Install target:** recommended default = current repo's existing skill directory and registry conventions.
4. **Verification:** recommended default = metadata parse + registry/link checks + one pressure scenario.

If the user says "accept defaults" or gives enough context, proceed.

## Workflow

### 1. Prove the gap before writing

Define 2-3 pressure scenarios before editing. Use realistic prompts that tempt the failure.

Run at least one baseline unless the harness forbids subagents/completions or the user explicitly forbids extra model calls:

- No new skill loaded.
- Same user goal.
- Read-only agent or one-shot completion.
- Capture exact failures: invalid metadata, vague trigger, skipped tests, fake verification, bloated prose, missing registry, wrong install path, scope creep.

If a baseline cannot run, state the concrete blocker and still write the scenarios. "Fast" is not a blocker. Do not pretend the skill was tested.

### 2. Read local conventions

Before creating files, inspect this local set:

- 2-3 strongest skills in the same plugin or domain.
- Skill registry or manifest, if present.
- README or install docs that list skills.
- Existing support-file layout: `references/`, `scripts/`, `assets/`.

Clone the local convention. Do not introduce a second convention because a generic guide used different names.

### 3. Choose the narrow contract

Pick one primary failure class:

| Failure class | Correct guidance form |
|---|---|
| Skips mandatory discipline | MUST / NEVER rule + rationalization table + red flags. |
| Wrong output shape | Positive output contract with required fields, in order. |
| Missing required element | Structural slot in the template. |
| Conditional behavior | Decision table keyed to observable predicates. |
| Knowledge lookup gap | Required lookup path + stop case when unavailable. |

Do not use prohibition lists to shape output. Give the exact shape instead.

### 4. Write frontmatter for discovery

Use the host repo's required keys. For void-grimoire, use only:

```yaml
---
name: short-kebab-case
description: Use when creating targeted artifacts from concrete triggers and user phrases.
---
```

Rules:

- `name` matches directory and registry entry.
- Description starts with `Use when`.
- Description is trigger-only. Do not summarize the workflow.
- Include concrete trigger terms from the target skill's domain. For skill-authoring skills, useful terms include `SKILL.md`, plugin, slash command, registry, prompt, verifier, TDD, pressure scenario, package, and install.
- Keep marketing out.

### 5. Write the body as an execution contract

Keep the happy path in `SKILL.md`. Move bulky examples or command catalogs into `references/` only when they are too large and actually reused.

Required body pieces:

- One-line purpose.
- Core contract or invariant.
- Workflow with ordered steps.
- Decision rules for non-obvious branches.
- Output contract.
- Verification gate.
- Common mistakes or red flags tied to observed failures.

Use OMP-quality prompt rules:

- Correctness first, then maintainability for the next agent.
- Boring, concrete instructions beat clever abstractions.
- Never shrink the user's requested deliverable silently.
- Never ship placeholders, implementation notes, fake fallbacks, or unverified claims.
- Prefer clean cutover: one canonical skill name, no aliases or duplicate registry entries unless explicitly approved.
- Use tools and docs to reduce uncertainty before asking.
- Evidence before "done": cite observed validation, not intention.
- Keep user comprehension as a floor: report the trade-off, not just the artifact.

### 6. Install in one clean cutover

For a plugin skill addition, update every source of truth that lists skills:

- `skills/skill-name/SKILL.md`.
- `skills/registry.json`, if used.
- README skill tables/counts, if present.
- Plugin manifests only when version policy requires a release bump.

Delete stale names if replacing a skill. Do not leave compatibility aliases by default.

### 7. Verify

Run the narrowest checks that prove the installed skill is coherent:

| Check | Proof |
|---|---|
| Frontmatter parse | YAML parses and has required keys. |
| Name consistency | Directory, frontmatter, registry, README all use the same name. |
| Link integrity | Referenced support files exist. |
| Placeholder scan | No placeholder markers, fake examples, or install guesses. |
| Pressure scenario | A fresh agent using the skill avoids the baseline failure. |
| Included scripts | Execute representative scripts if the skill ships any. |

Do not claim packaging or marketplace install unless that command actually ran.

## One good example

Bad draft:

```yaml
---
name: better-skills
description: Helps make skills better with best practices.
---
```

Why it fails: vague trigger, no boundary, no proof, no install path.

Good direction:

```yaml
---
name: skill-forge
description: Use when creating, revising, auditing, testing, or installing agent skills, SKILL.md files, plugin skills, prompt-quality guidance, or registry-backed skill additions.
---
```

The body must then require local convention lookup, pressure scenarios, exact output shape, registry/docs updates, and validation evidence.

## Quick reference

| Need | Move |
|---|---|
| User request is vague | Use fast grilling defaults; ask only load-bearing questions. |
| Existing repo has strong skills | Clone structure and quality bar from the best local example. |
| Skill is too broad | Split by trigger or failure class. |
| Skill body is long | Keep happy path; move bulky rare paths to `references/`. |
| Verification is unclear | Define metadata, registry, link, placeholder, and pressure-scenario checks. |
| User asks for speed | Keep RED minimal, not absent. One baseline scenario is still proof. |

## Common mistakes

| Mistake | Correct move |
|---|---|
| Using `summary` when the repo expects `description`. | Match local frontmatter. |
| Description explains workflow. | Make description trigger-only. |
| Writing principles without steps. | Convert each principle into an action, gate, or output field. |
| Asking broad discovery questions first. | Inspect repo conventions, then ask one batch only if needed. |
| Creating support files for ceremony. | Add support files only when they reduce loaded context or provide reusable machinery. |
| Updating `SKILL.md` but not registry/README. | Install in one clean cutover. |
| Claiming tests passed from review alone. | Run validation or state unverified paths plainly. |

## Output contract

When done, return:

```markdown
**Skill installed.**
- Skill: canonical skill name.
- Files: changed files.
- Baseline failures addressed: short list.
- Verification: commands or scenarios run with observed result.
- Trade-off: main design choice.
- Follow-up: none, or blocked external action only.
```

If stopped:

```markdown
**Stopped before install.**
- Stop case: missing decision, convention, or verification surface.
- Evidence: checked source or command result.
- Needed: one concrete input or action.
```
