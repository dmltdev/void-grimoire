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
