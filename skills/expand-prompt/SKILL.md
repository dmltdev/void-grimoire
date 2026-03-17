---
name: expand-prompt
domain: void-grimoire
description: Use when a user request is terse or ambiguous — expands it with domain context, docs, and learned rules before proceeding
depends-on: [route-request, lookup-docs]
chains-to: "brainstorm"
suggests: []
user-invokable: true
args:
  - name: prompt
    description: The terse prompt to expand (or uses the last user message if omitted)
    required: false
---

# Prompt Expansion

Take a terse user request and flesh it out with domain context, documentation, and learned rules before handing off to brainstorming.

## When to Use

- User gives a short, ambiguous request ("add dark mode", "fix the auth bug")
- User explicitly invokes `/expand-prompt`
- Agent is unsure what the user wants and needs to expand before brainstorming

## Process

1. **Identify domains** — Run `route-request` (dependency) to match the request against registry triggers.

2. **Gather context:**
   - Read `rules/global.md` + `rules/{matched domains}.md` for learned rules
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
     ...
   - Suggested workflow: brainstorm → write-plan → ...
   ```

4. **Present to user** for confirmation. They can approve, modify, or reject.

5. **On approval** → proceed into `brainstorm` (chains-to) with the expanded context.

## Key Constraint

This skill NEVER acts on the expansion. It only produces the expanded intent and hands off. Implementation happens through the normal workflow pipeline.
