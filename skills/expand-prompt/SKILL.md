---
name: expand-prompt
domain: void-grimoire
description: Use when a user request is terse or ambiguous — expands it with domain context, docs, and learned rules before proceeding
depends-on: [route-request, lookup-docs]
chains-to: null
suggests: []
user-invokable: true
args:
  - name: prompt
    description: The terse prompt to expand (or uses the last user message if omitted)
    required: false
---

# Prompt Expansion

Take a terse user request and flesh it out with domain context, documentation, and any learned rules before acting on it.

## When to Use

- User gives a short, ambiguous request ("add dark mode", "fix the auth bug")
- User explicitly invokes `/expand-prompt`
- Agent is unsure what the user wants and needs to disambiguate before acting

## Process

1. **Identify domains** — Run `route-request` (dependency) to match the request against registry triggers.

2. **Gather context:**
   - Read project AGENTS.md / CLAUDE.md for learned rules and conventions
   - Run `lookup-docs` (dependency) for relevant documentation
   - Check recent git history for related changes

3. **Expand the prompt** into a structured intent:
   ```
   Original: "<user's terse prompt>"

   Expanded:
   - Domains: [matched domains]
   - Applicable skills: [skills from routing]
   - Relevant docs: [findings from lookup-docs]
   - Learned rules: [applicable rules]
   - Decomposed sub-tasks:
     1. [sub-task]
     2. [sub-task]
   ```

4. **Present to user** for confirmation. ALWAYS end the expansion with an explicit handoff:
   > "Approve, modify, or reject?"

   Do NOT omit this. Do NOT proceed without it. The user must explicitly approve before anything happens.

5. **On approval** → proceed with the expanded intent.

## Key Constraint

This skill NEVER acts on the expansion. It only produces the expanded intent and hands off. Implementation happens through the normal workflow pipeline.
