# verify-requirements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a `verify-requirements` skill that adversarially reviews external requirements through four lenses (ambiguity, hidden scope, feasibility, contradiction) using sequential subagents, producing a feasibility report and stakeholder question list.

**Architecture:** Single SKILL.md orchestrates intake + 4 sequential subagent dispatches (one per lens) + synthesis. Each subagent has its own prompt template. All markdown, no code.

**Tech Stack:** Markdown skill files, JSON registry updates.

**Spec:** `docs/specs/2026-03-17-verify-requirements-design.md`

---

### Task 1: Create SKILL.md

**Files:**
- Create: `skills/verify-requirements/SKILL.md`

**Step 1: Write frontmatter + skill body**

Create `skills/verify-requirements/SKILL.md` with:

```markdown
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
```

**Step 2: Verify file created**

Run: `cat skills/verify-requirements/SKILL.md | head -5`
Expected: frontmatter with `name: verify-requirements`

**Step 3: Commit**

```bash
git add skills/verify-requirements/SKILL.md
git commit -m "feat(workflow): add verify-requirements skill"
```

---

### Task 2: Create Ambiguity Lens Prompt

**Files:**
- Create: `skills/verify-requirements/ambiguity-lens-prompt.md`

**Step 1: Write the prompt template**

```markdown
# Ambiguity Lens — Subagent Prompt Template

Dispatch this subagent as the first lens in the verify-requirements pipeline.

```
Agent tool (general-purpose):
  description: "Lens 1: Ambiguity review"
  prompt: |
    You are an ambiguity detector reviewing requirements for a software project.

    ## Your Task

    For each requirement below, determine: would 3 developers implement this the same way?

    **Method:** Attempt to write 2+ valid but conflicting interpretations of the requirement. If you can, it's ambiguous.

    ## Requirements

    [PASTE NUMBERED REQUIREMENTS LIST]

    ## Service Map Context

    [PASTE SERVICE MAP SUMMARY — or "No service map available"]

    ## Rating Scale

    - 🟢 GREEN: Only one reasonable interpretation exists
    - 🟡 YELLOW: Multiple interpretations, but one is clearly dominant — note the ambiguity, suggest clarification
    - 🔴 RED: Genuinely ambiguous — blocker, must resolve before design

    ## Output Format

    Return a structured report:

    ### Ambiguity Findings

    | # | Requirement (short) | Rating | Conflicting Interpretations |
    |---|---------------------|--------|-----------------------------|
    | 1 | "User can export..." | 🟡 | (1) CSV download (2) API endpoint — first is more likely |

    ### Evidence

    For each 🟡 and 🔴:
    - **Req #N:** [Quote the requirement]
      - **Interpretation A:** [description]
      - **Interpretation B:** [description]
      - **Why ambiguous:** [what makes both readings valid]
      - **Suggested clarification question:** [what to ask stakeholders]

    ### Summary

    - Total: X 🟢 / Y 🟡 / Z 🔴
    - Top ambiguity blockers: [list reds]
```
```

**Step 2: Commit**

```bash
git add skills/verify-requirements/ambiguity-lens-prompt.md
git commit -m "feat(workflow): add ambiguity lens subagent prompt"
```

---

### Task 3: Create Hidden Scope Lens Prompt

**Files:**
- Create: `skills/verify-requirements/scope-lens-prompt.md`

**Step 1: Write the prompt template**

```markdown
# Hidden Scope Lens — Subagent Prompt Template

Dispatch this subagent as the second lens in the verify-requirements pipeline.

```
Agent tool (general-purpose):
  description: "Lens 2: Hidden scope review"
  prompt: |
    You are a scope analyst reviewing requirements for a software project.

    ## Your Task

    For each requirement, trace the full dependency chain: which services, APIs, schemas, migrations, and external integrations are touched? Compare actual scope against what the requirement implies.

    **Use ambiguity findings from Lens 1 to focus:** where ambiguity was flagged, explore BOTH interpretations' scope to show the cost difference.

    ## Requirements

    [PASTE NUMBERED REQUIREMENTS LIST]

    ## Service Map

    [PASTE SERVICE MAP — or "No service map available, explore codebase directly"]

    ## Lens 1 (Ambiguity) Findings

    [PASTE LENS 1 OUTPUT]

    ## Exploration Rules

    - Follow dependency chains up to 3 levels deep
    - If you can't determine scope within 3 levels, flag as 🟡 "needs deeper investigation"
    - Read actual code: handlers, routes, data models, migrations
    - Note every service, API, schema, and migration touched

    ## Rating Scale

    - 🟢 GREEN: Scope matches what the requirement implies
    - 🟡 YELLOW: Scope is 2-3x what a reasonable reader would assume
    - 🔴 RED: Wildly underestimated — crosses multiple system boundaries unexpectedly

    ## Output Format

    ### Scope Findings

    | # | Requirement (short) | Rating | Services Touched | APIs | Schemas/Migrations | Depth |
    |---|---------------------|--------|-----------------|------|-------------------|-------|
    | 1 | "User can export..." | 🟡 | auth, export, storage | 3 | 1 migration | 2 |

    ### Evidence

    For each 🟡 and 🔴:
    - **Req #N:** [Quote the requirement]
      - **Implied scope:** [what a reader would assume]
      - **Actual scope:** [what the dependency chain reveals]
      - **Dependency chain:** service A → service B → service C
      - **Code paths checked:** [list files/routes examined]
      - **Hidden cost:** [what's not obvious from the requirement]

    ### Summary

    - Total: X 🟢 / Y 🟡 / Z 🔴
    - Top scope surprises: [list most underestimated]
    - Total services touched across all requirements: [count]
```
```

**Step 2: Commit**

```bash
git add skills/verify-requirements/scope-lens-prompt.md
git commit -m "feat(workflow): add hidden scope lens subagent prompt"
```

---

### Task 4: Create Feasibility Lens Prompt

**Files:**
- Create: `skills/verify-requirements/feasibility-lens-prompt.md`

**Step 1: Write the prompt template**

```markdown
# Feasibility Lens — Subagent Prompt Template

Dispatch this subagent as the third lens in the verify-requirements pipeline.

```
Agent tool (general-purpose):
  description: "Lens 3: Feasibility review"
  prompt: |
    You are a feasibility assessor reviewing requirements for a software project.

    ## Your Task

    For each capability a requirement assumes: does it exist in the codebase, or must it be built?

    **Use scope findings from Lens 2 to focus:** the dependency chains tell you which code paths to check. Don't re-trace what Lens 2 already mapped — use its findings as your starting point.

    ## Requirements

    [PASTE NUMBERED REQUIREMENTS LIST]

    ## Service Map

    [PASTE SERVICE MAP — or "No service map available"]

    ## Lens 1 (Ambiguity) Findings

    [PASTE LENS 1 OUTPUT]

    ## Lens 2 (Hidden Scope) Findings

    [PASTE LENS 2 OUTPUT]

    ## Exploration Rules

    - Check service map for existing endpoints/services first
    - Where service map is insufficient, explore codebase: read handlers, check API routes, trace data flow
    - Follow the 3-level depth cap from Lens 2 — don't go deeper
    - For each capability, determine: does it exist, need extension, or is it net-new?

    ## Rating Scale

    - 🟢 GREEN (exists): Capability is already built and working
    - 🟡 YELLOW (partial): Exists but needs extension — estimate what's missing
    - 🔴 RED (net-new): Must be built from scratch

    ## Output Format

    ### Feasibility Findings

    | # | Requirement (short) | Rating | Capabilities Needed | Status per Capability |
    |---|---------------------|--------|--------------------|-----------------------|
    | 1 | "User can export..." | 🟡 | export engine, PDF renderer | export: exists, PDF: net-new |

    ### Evidence

    For each 🟡 and 🔴:
    - **Req #N:** [Quote the requirement]
      - **Capability:** [name]
      - **Status:** exists / partial / net-new
      - **Code checked:** [files, endpoints, services examined]
      - **What exists:** [current state]
      - **What's missing:** [gaps to fill]
      - **Complexity class:** trivial / moderate / significant / major rework

    ### Summary

    - Total: X 🟢 / Y 🟡 / Z 🔴
    - Net-new capabilities needed: [list]
    - Highest-cost items: [list with complexity class]
```
```

**Step 2: Commit**

```bash
git add skills/verify-requirements/feasibility-lens-prompt.md
git commit -m "feat(workflow): add feasibility lens subagent prompt"
```

---

### Task 5: Create Contradiction Lens Prompt

**Files:**
- Create: `skills/verify-requirements/contradiction-lens-prompt.md`

**Step 1: Write the prompt template**

```markdown
# Contradiction Lens — Subagent Prompt Template

Dispatch this subagent as the fourth (final) lens in the verify-requirements pipeline.

```
Agent tool (general-purpose):
  description: "Lens 4: Contradiction review"
  prompt: |
    You are a contradiction detector reviewing requirements for a software project.

    ## Your Task

    Check for conflicts at two levels:
    1. **Between requirements:** Do any requirements in this set contradict each other?
    2. **Against existing behavior:** Does any requirement demand changing behavior that other features depend on?

    **Use all prior lens findings** to inform your analysis — ambiguity creates contradiction risk, scope overlaps create collision risk, and feasibility gaps may force tradeoffs that create contradictions.

    ## Requirements

    [PASTE NUMBERED REQUIREMENTS LIST]

    ## Service Map

    [PASTE SERVICE MAP — or "No service map available"]

    ## Lens 1 (Ambiguity) Findings

    [PASTE LENS 1 OUTPUT]

    ## Lens 2 (Hidden Scope) Findings

    [PASTE LENS 2 OUTPUT]

    ## Lens 3 (Feasibility) Findings

    [PASTE LENS 3 OUTPUT]

    ## Exploration Rules

    - Cross-reference every requirement pair for conflicts
    - Check if requirements demand changing existing behavior (read current handlers, business logic)
    - Follow the 3-level depth cap — don't go deeper
    - Pay special attention to requirements that touch overlapping services (from Lens 2 scope data)

    ## Rating Scale

    - 🟢 GREEN: No conflicts found
    - 🟡 YELLOW: Soft tension — requirements pull in different directions but can coexist with care
    - 🔴 RED: Hard contradiction — requirements cannot both be true, or requirement breaks existing behavior

    ## Output Format

    ### Contradiction Findings

    | # | Requirement (short) | Rating | Conflicts With | Type |
    |---|---------------------|--------|---------------|------|
    | 3 | "All exports public" | 🔴 | Req #7 "role-based access" | req-vs-req |
    | 5 | "New auth flow" | 🟡 | existing SSO integration | req-vs-system |

    ### Evidence

    For each 🟡 and 🔴:
    - **Conflict:** Req #N vs [Req #M / existing behavior]
      - **Type:** req-vs-req / req-vs-system
      - **Req #N says:** [quote]
      - **Req #M / system says:** [quote or describe current behavior]
      - **Why they conflict:** [specific incompatibility]
      - **Code checked:** [files, behavior examined]
      - **Resolution options:** [how stakeholders might resolve this]

    ### Summary

    - Total: X 🟢 / Y 🟡 / Z 🔴
    - Hard contradictions (must resolve): [list]
    - Soft tensions (design carefully): [list]
```
```

**Step 2: Commit**

```bash
git add skills/verify-requirements/contradiction-lens-prompt.md
git commit -m "feat(workflow): add contradiction lens subagent prompt"
```

---

### Task 6: Update Registry

**Files:**
- Modify: `skills/registry.json`

**Step 1: Add skill and triggers to workflow domain**

In `skills/registry.json`, update the `workflow` domain:
- Add `"verify-requirements"` to the `skills` array (first position, since it runs before brainstorm)
- Add trigger keywords to `triggers`: `"requirements"`, `"spec"`, `"PRD"`, `"ticket"`, `"feasibility"`, `"validate"`

Updated workflow entry:
```json
"workflow": {
  "description": "Development pipeline — brainstorm, plan, execute, verify",
  "triggers": ["brainstorm", "plan", "implement", "execute", "verify", "ship", "compact", "session", "summary", "requirements", "spec", "PRD", "ticket", "feasibility", "validate"],
  "skills": ["verify-requirements", "brainstorm", "write-plan", "execute-plan", "develop-with-subagents", "dispatch-parallel-agents", "verify-before-completion", "prepare-compact"],
  "docs": []
}
```

**Step 2: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('skills/registry.json'))"`
Expected: no output (valid JSON)

**Step 3: Commit**

```bash
git add skills/registry.json
git commit -m "feat(workflow): register verify-requirements in registry"
```

---

### Task 7: Update README.md

**Files:**
- Modify: `README.md`

**Step 1: Update workflow domain row**

In the domains table, update the workflow row to include `verify-requirements`:
```markdown
| **workflow** | verify-requirements, brainstorm, write-plan, execute-plan, develop-with-subagents, dispatch-parallel-agents, verify-before-completion, prepare-compact | End-to-end development lifecycle |
```

**Step 2: Update skill count**

Change `**42 skills**` to `**43 skills**`.

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add verify-requirements to README"
```

---

### Task 8: Update Architecture Spec

**Files:**
- Modify: `docs/specs/2026-03-14-void-grimoire-architecture-design.md`

**Step 1: Update Section 1 (Plugin Structure)**

Add `verify-requirements/` directory to the workflow skills area in the tree, between the `├── prepare-compact/` line and the blank line before dev domain:
```
│       ├── verify-requirements/
```

Update skill count: `**43 skills across 8 domains**` → `**44 skills across 8 domains**` and workflow count from 7 to 8.

**Step 2: Update Section 10 (Skill Frontmatter Reference)**

Add under the workflow domain section, before the `brainstorm` entry:
```yaml
verify-requirements      → depends-on: [], chains-to: null, suggests: [brainstorm, map-services]
```

**Step 3: Update Section 2 (Registry)**

Add `"verify-requirements"` to workflow skills array and new triggers to workflow triggers array (matching Task 6 changes).

**Step 4: Commit**

```bash
git add docs/specs/2026-03-14-void-grimoire-architecture-design.md
git commit -m "docs: add verify-requirements to architecture spec"
```
