# Quality Tiers — SKILL.md Additions

> Spec for extending void-grimoire with quality-level awareness.
> Each section below is a patch to be inserted into the corresponding skill's SKILL.md.

---

## Design Decisions

- **Tier is explicit, not auto-detected.** No keyword scanning. User must request a tier.
- **Pipeline structure is unchanged.** All brainstorm steps (clarifying questions, approaches, spec, review, approval) run at every tier. All write-plan steps run at every tier. The tier controls *what* gets designed/planned/built — not *how* the pipeline operates.
- **Code follows repo conventions at every tier.** Even poc code uses project standards and patterns.
- **Default is production.** Identical to current behavior. Users see no change unless they explicitly request a tier.
- **Onboarding.** When brainstorm runs with no explicit tier, it mentions quality tiers exist at the end of its first response.
- **No changes to registry.json or route-request.** Tier detection was removed — these files stay untouched.
- **Single source of truth.** All tier behavior is defined in brainstorm's Quality Level section. Downstream skills reference it — no duplicated tables.

---

## 1. `brainstorm/SKILL.md` — Addition

Insert as the FIRST section after the frontmatter, before existing content:

```markdown
## Quality Level

This skill supports five quality tiers that control implementation depth.
The tier is set **explicitly by the user** — it is never auto-detected from keywords.
If no quality level is specified, default to **production**.

**Onboarding:** When no tier is explicitly set, include a brief mention at the end
of your first response:

> "By the way — this brainstorm is running at **production** quality level. Other tiers
> are available: `poc`, `mvp`, `polished-mvp`, `post-production`. Let me know if you'd
> like to switch."

**The tier definitions below override the checklist and process flow where they
conflict. Skip steps that the tier marks as not applicable.**

### What the tier controls

The tier does NOT skip brainstorming or planning steps. It controls the
**implementation concerns** that the spec, plan, execution, verification, and
branching should address. This table is the single source of truth — all
downstream skills (`write-plan`, `execute-plan`, `verify-before-completion`,
`finish-branch`) reference it.

| Concern         | poc                          | mvp                              | polished-mvp                      | production (default)     | post-production              |
|-----------------|------------------------------|----------------------------------|-----------------------------------|--------------------------|------------------------------|
| Data            | Mock/stub by default         | Real data, basic                 | Real data                         | Real data                | Real data                    |
| Error handling  | Basic — wrap all async/throwable calls in try/catch. No granular recovery, no custom error types. | Critical paths + all async. Basic recovery (retry, fallback). | All external calls. Proper recovery strategies. | Comprehensive (current). | Fill gaps from audit.        |
| Scalability     | Don't consider               | Don't consider                   | Consider, don't optimize          | Designed for             | Verify                       |
| Observability   | Skip                         | Skip                             | Basic logging                     | Full                     | Verify/add                   |
| Auth/Security   | Skip                         | Basic if needed                  | Proper                            | Full                     | Audit + fix                  |
| Tests           | None required                | Happy path only                  | Happy path + key edge cases       | Full TDD                 | Add missing coverage         |
| Non-essential infra | Skip (middleware, healthchecks, etc.) | Skip              | Include if straightforward        | Full                     | Verify/add                   |
| Linting         | Run but don't block          | Run but don't block on warnings  | Must pass                         | Must pass (current)      | Must pass + fix warnings in touched files |
| Verification    | Does it run? Happy path once. | Tests pass + builds.            | Tests + build + lint clean.       | Full verify + spec compliance. | Full verify + remediation checklist + regression. |
| Branch/PR       | Conventional commit with `(poc)` scope. No PR required. | PR with minimal description. Self-merge OK. | PR with description. Self-review before merge. | Current behavior. Full PR + review. | PR(s) per risk group. Full review. References remediation spec. |

### Tier Definitions

#### `poc` — Proof of Concept

Goal: Validate whether an idea is feasible. Speed over correctness.

- The brainstorm process runs normally — clarifying questions, approaches, spec, review.
- The **spec content** focuses on proving the concept: what we're testing,
  approach, key assumptions, known shortcuts.
- Default to **mock/stub data** unless the user explicitly requires real data
  or the feasibility question depends on real data.
- Skip non-essential infrastructure (middleware, logging, observability, healthchecks).
- Pure app logic that aims to fulfil the concept and prove it's possible.
- Write `quality-level: poc` in the spec frontmatter.

#### `mvp` — Minimum Viable Product

Goal: Shortest path to a working feature that delivers value.

- The brainstorm process runs normally.
- The **spec content** focuses on delivering value: what we're building,
  what's explicitly out of scope, known tradeoffs.
- Basic error handling on critical paths. No gold-plating.
- Write `quality-level: mvp` in the spec frontmatter.

#### `polished-mvp` — Polished MVP

Goal: Ship-quality work without full production ceremony.

- The brainstorm process runs normally.
- The **spec content** covers UX, edge cases that would embarrass the team,
  proper error handling on external calls.
- Write `quality-level: polished-mvp` in the spec frontmatter.

#### `production` — Production Quality (DEFAULT)

Goal: Production-grade work for real users.

- **This is the existing brainstorm flow, unchanged.**
- Full spec with all sections: architecture, components, data flow,
  error handling, testing approach, scalability, observability, security.
- Write `quality-level: production` in the spec frontmatter.

#### `post-production` — Post-Production Polish

Goal: Harden, audit, and improve what already exists.

- **Do NOT brainstorm new features.** This tier is about existing code.
- Start with an **audit phase**: read the relevant code/feature, identify:
  - Missing error handling
  - Missing tests or weak test coverage
  - Accessibility gaps (if frontend)
  - Performance concerns
  - Security surface
  - Code that deviates from project conventions (check `rules/`)
- Present findings as a **remediation spec** written to disk. Structure:
  - What exists today (brief)
  - Issues found (prioritized: critical → nice-to-have)
  - Proposed fixes (per issue)
  - What's explicitly out of scope for this pass
- Write `quality-level: post-production` in the spec frontmatter.
- Evaluate `suggests` only for hardening-related skills
  (`harden-design`, `audit-design`, `develop-tdd`).

### Quality Level in Spec Output

Every spec MUST include the quality level in its frontmatter.
Downstream skills (`write-plan`, `execute-plan`, `verify-before-completion`,
`finish-branch`) read this field and refer to the tier table above.

```
---
quality-level: {tier}
title: {spec title}
date: {YYYY-MM-DD}
---
```
```

---

## 2–5. Downstream Skills — Addition

For each of the following skills, insert after the frontmatter, before existing content:
- `write-plan/SKILL.md`
- `execute-plan/SKILL.md`
- `verify-before-completion/SKILL.md`
- `finish-branch/SKILL.md`

Insert this identical block:

```markdown
## Quality Level

Read `quality-level` from the spec or plan. If not present, assume `production`.
Refer to the brainstorm skill's **Quality Level** section for the full tier table
and definitions. Apply the row for this skill's concern area (e.g., Verification
for verify-before-completion, Branch/PR for finish-branch).

Write `quality-level: {tier}` in any artifact this skill produces (plans, etc.)
so downstream skills can read it.
```

---

## Summary of Changes

| File                                | Change type     |
|-------------------------------------|-----------------|
| `skills/brainstorm/SKILL.md`        | Add quality-level section with consolidated tier table (10 concern rows × 5 tiers) + 5 tier definitions + onboarding prompt |
| `skills/write-plan/SKILL.md`        | Add short quality-level reference (4 lines) |
| `skills/execute-plan/SKILL.md`      | Add short quality-level reference (4 lines) |
| `skills/verify-before-completion/SKILL.md` | Add short quality-level reference (4 lines) |
| `skills/finish-branch/SKILL.md`     | Add short quality-level reference (4 lines) |

**No changes to:** `registry.json`, `route-request/SKILL.md`, `develop-with-subagents/SKILL.md`

**No new skills. No new files. No global state.**
The quality level flows: user explicitly sets tier → brainstorm writes it into spec frontmatter → plan frontmatter → execution → verification → branch.
Each artifact carries the tier forward. Default is `production` — identical to current behavior.
