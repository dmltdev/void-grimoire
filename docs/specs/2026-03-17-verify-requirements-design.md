# verify-requirements — Design Spec

**Date:** 2026-03-17
**Domain:** workflow
**Status:** Draft

## 1. Purpose

Standalone skill for adversarial review of external requirements (Jira tickets, Confluence pages, PRDs, spec docs, pasted text). Validates requirements against the codebase and service map before design begins. Produces a feasibility report and a prioritized stakeholder question list.

**Core framing:** Every requirement is ambiguous until disambiguated, simple until the dependency chain proves it, and feasible until the codebase says otherwise.

## 2. Skill Identity

```yaml
name: verify-requirements
domain: workflow
description: Use when receiving external requirements, specs, PRDs, or tickets that need validation before design — checks feasibility against codebase, surfaces ambiguity, hidden scope, and contradictions
depends-on: []
chains-to: null
suggests: [brainstorm, map-services]
```

**Registry triggers:** `requirements`, `spec`, `PRD`, `ticket`, `feasibility`, `verify`, `validate`

**Chain position:** Before brainstorm, but independent. Can run standalone (report only) or chain to brainstorm for design.

## 3. Input Handling

Accepts requirements in any common text format.

**Input methods (priority order):**
1. **URL** — Jira/Confluence link fetched via Atlassian MCP tools
2. **Pasted text** — requirements pasted directly into conversation
3. **File path** — local document or markdown file

**Parsing step:** Extract a normalized list of discrete requirements — each one a single testable statement. Compound requirements ("X and also Y when Z") get split. The user confirms the extracted list before review begins — if they reject or amend, the skill incorporates their edits conversationally and re-presents. If the skill can't cleanly split a requirement, that's already an ambiguity finding.

## 4. Four Adversarial Lenses

Each requirement is stress-tested through four lenses sequentially. Every rating must include evidence — no unsupported judgments.

### Lens 1 — Ambiguity

**Question:** Would 3 devs implement this the same way?

- Attempt to write 2+ valid but conflicting interpretations
- 🟢 Only one reasonable interpretation
- 🟡 Multiple interpretations, one clearly dominant
- 🔴 Genuinely ambiguous — blocker, must resolve before design

### Lens 2 — Hidden Scope

**Question:** What's the full dependency chain?

- Load service map (`.void-grimoire/service-map.json`) if available
- Trace requirement through services, APIs, schemas, migrations, external integrations
- 🟢 Scope matches what the requirement implies
- 🟡 Scope is 2-3x what a reasonable reader would assume
- 🔴 Wildly underestimated or crosses multiple system boundaries unexpectedly

### Lens 3 — Feasibility

**Question:** Does the required capability exist, or must it be built?

- Check service map for existing endpoints/services
- Explore codebase on-the-fly where service map is insufficient (read handlers, check API routes, trace data flow)
- Rate each capability: **exists** (🟢) / **partial — needs extension** (🟡) / **net-new — must be built** (🔴)

### Lens 4 — Contradiction

**Question:** Does this conflict with other requirements or existing behavior?

- Cross-reference against all other requirements in the set
- Cross-reference against current system behavior — does it demand changing behavior other features depend on?
- 🟢 No conflicts / 🟡 Soft tension / 🔴 Hard contradiction

## 5. Execution Model

Sequential subagent chain with main agent orchestration. Each lens runs in its own subagent, receiving only the requirements list plus prior lens findings.

### Flow

1. **Intake** (main agent) — fetch/receive requirements, extract discrete list, user confirms
2. **Load context** (main agent) — read service map if available (skill works without it — scope/feasibility analysis degrades gracefully to codebase-only exploration), identify relevant codebase areas
3. **Lens 1: Ambiguity** (subagent) — receives requirements list + service map summary. Returns per-requirement ambiguity ratings + conflicting interpretations.
4. **Lens 2: Hidden Scope** (subagent) — receives requirements + Lens 1 findings. Ambiguity flags direct where to dig deeper. Returns dependency chains traced.
5. **Lens 3: Feasibility** (subagent) — receives requirements + Lens 1-2 findings. Scope findings direct which code paths to check. Returns exists/partial/net-new ratings with evidence.
6. **Lens 4: Contradiction** (subagent) — receives requirements + Lens 1-3 findings. Needs full picture. Returns conflicts found.
7. **Synthesis** (main agent) — compiles all lens results into feasibility report + stakeholder questions
8. **Write + present** (main agent) — saves output, shows summary, offers next step

### Why Sequential, Not Parallel

Each lens's findings sharpen the next. Ambiguity flags tell scope where to dig. Scope findings tell feasibility which code paths matter. Contradiction needs everything. Parallel execution means each lens works blind — more tokens exploring redundantly, worse results.

### Token Budget

Each subagent receives only what it needs (requirements + prior lens findings as structured data), not the full conversation history. The main agent never holds raw codebase exploration — only compact structured findings that come back.

### Exploration Depth

Per requirement, follow the dependency chain up to 3 levels deep. This cap applies to all lenses — scope tracing, feasibility code exploration, and contradiction checks alike. If any lens can't determine its rating within that depth, flag as 🟡 with "needs deeper investigation" rather than ratholing.

## 6. Output Format

Written to `.void-grimoire/history/<initiative>/requirements-review.md`. The `<initiative>` name is derived from the source (Jira ticket key, doc title) or prompted from the user if no clear name exists.

### Part A — Feasibility Report

**Summary section (top):**
- Total requirements count
- Breakdown: X 🟢 / Y 🟡 / Z 🔴
- Top blockers (reds) listed upfront
- Complexity class per yellow/red: trivial / moderate / significant / major rework

**Per-requirement table:**

| # | Requirement | Ambiguity | Scope | Feasibility | Contradiction | Verdict |
|---|------------|-----------|-------|-------------|---------------|---------|
| 1 | "User can export..." | 🟢 | 🟡 | 🟢 | 🟢 | 🟡 |

**Evidence blocks:** Each yellow/red gets an evidence block below the table — what was found, which code paths were checked, conflicting interpretations identified. Green items get no commentary.

### Part B — Stakeholder Question List

Grouped by theme, prioritized by blocker severity:

```
### Blockers (must resolve before design)
1. [Ambiguity] "Export" in req #3 — does this mean CSV download or API endpoint?
   Two valid readings. → Ask: product owner

2. [Scope] Req #7 touches auth, billing, and notifications —
   was cross-service impact accounted for? → Ask: tech lead + product

### Clarifications (should resolve before design)
...

### Nice to confirm (low risk if assumed)
...
```

Each question traces back to which lens surfaced it and which requirement triggered it.

## 7. Post-Review Flow

After presenting the summary, offer:

> "Want to take this to stakeholders first, or proceed to brainstorm?"

- If stakeholders first → skill ends, user takes the report
- If brainstorm → suggests invoking brainstorm skill with the verified requirements as input
