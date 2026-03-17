---
name: route-request
domain: void-grimoire
description: Use when determining which domain skills apply to a user request — matches against registry triggers and returns applicable skills
depends-on: []
chains-to: null
suggests: []
---

# Domain Routing

Match a user request against the domain registry to identify applicable skills.

## Process

1. **Read the registry** — `registry.json` is loaded at session start. Each domain has trigger keywords.

2. **Match domains** — Compare the user's request against each domain's triggers. A domain matches if ANY of its trigger keywords appear in or are semantically relevant to the request. Be generous — it's better to match an extra domain than to miss one.

3. **Collect skills** — For each matched domain, gather all skills from that domain's `skills` array.

4. **Filter by relevance** — From the collected skills, identify which specific skills are relevant to the task. Not every skill in a matched domain applies. Read each skill's `description` field to decide.

5. **Return results** — Report matched domains and applicable skills to the caller.

## Matching Rules

- Match on semantic relevance, not just exact keyword match. "add a login page" should match `design` (it's a page) and `dev` (it's a feature) even though "login" isn't a trigger.
- When uncertain, include the domain. False positives (checking an irrelevant skill) are cheap. False negatives (missing a relevant skill) cause real problems.
- The `workflow` domain matches when the task is a new feature, project, or multi-step change. It does NOT match for quick fixes, questions, or single-file edits.
- The `void-grimoire` domain only matches for meta-tasks (creating skills, managing the plugin, remembering rules).

## Output Format

After routing, announce which domains and skills matched:
> "Matched domains: design, dev. Applicable skills: design-frontend, develop-tdd."

Then invoke each applicable skill.
