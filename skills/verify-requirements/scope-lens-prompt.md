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
