---
name: verify-requirements
domain: workflow
description: Use when receiving external requirements, specs, PRDs, or tickets that need validation before design — checks feasibility against codebase, surfaces ambiguity, hidden scope, and contradictions
depends-on: []
chains-to: null
suggests: [brainstorm, map-services]
---

# Verify Requirements

Adversarial review of external requirements. Every requirement is ambiguous until disambiguated, simple until the dependency chain proves it, and feasible until the codebase says otherwise.

<HARD-GATE>
Do NOT proceed to design or implementation. This skill produces a review report only. If the user wants to design after, suggest invoking brainstorm.
</HARD-GATE>

## Process

### 1. Intake

Accept requirements from any source:
- **URL** — Jira/Confluence link via Atlassian MCP tools
- **Pasted text** — requirements in conversation
- **File path** — local document

Extract a normalized list of discrete requirements — each a single testable statement. Split compound requirements ("X and also Y when Z"). Present the list to the user for confirmation before proceeding. If they reject or amend, incorporate edits conversationally and re-present.

If you can't cleanly split a requirement, that's already an ambiguity finding — note it.

### 2. Load Context

Read service map (`.void-grimoire/service-map.json`) if available. The skill works without it — scope and feasibility analysis degrade gracefully to codebase-only exploration. Identify relevant codebase areas for the requirements.

### 3. Lens Dispatch (Sequential Subagents)

Dispatch one subagent per lens, sequentially. Each receives only the requirements list plus prior lens findings — never your session history.

| Order | Lens | Subagent prompt | Receives |
|-------|------|----------------|----------|
| 1 | Ambiguity | `./ambiguity-lens-prompt.md` | Requirements list + service map summary |
| 2 | Hidden Scope | `./scope-lens-prompt.md` | Requirements + Lens 1 findings |
| 3 | Feasibility | `./feasibility-lens-prompt.md` | Requirements + Lens 1-2 findings |
| 4 | Contradiction | `./contradiction-lens-prompt.md` | Requirements + Lens 1-3 findings |

**Why sequential, not parallel:** Each lens's findings sharpen the next. Ambiguity flags tell scope where to dig. Scope findings tell feasibility which code paths matter. Contradiction needs everything.

**Exploration depth:** Per requirement, follow dependency chains up to 3 levels deep. If a lens can't determine its rating within that depth, flag as 🟡 "needs deeper investigation."

### 4. Synthesis

Compile all lens results into two deliverables:

**Part A — Feasibility Report:**
- Summary: total count, X 🟢 / Y 🟡 / Z 🔴, top blockers upfront
- Per-requirement table with all 4 lens ratings + verdict
- Evidence blocks for every yellow/red (what was found, code paths checked). Green = no commentary.
- Complexity class per yellow/red: trivial / moderate / significant / major rework

**Part B — Stakeholder Question List:**
- Grouped by theme, not by requirement
- Prioritized: Blockers → Clarifications → Nice to confirm
- Each question traces to which lens and requirement surfaced it

### 5. Write Output

Save to `.void-grimoire/history/<initiative>/requirements-review.md`. Derive `<initiative>` from source (Jira ticket key, doc title) or ask user if no clear name.

Present the summary table and blocker list in conversation.

### 6. Offer Next Step

> "Want to take this to stakeholders first, or proceed to brainstorm?"

- Stakeholders first → skill ends
- Brainstorm → suggest invoking brainstorm with verified requirements
