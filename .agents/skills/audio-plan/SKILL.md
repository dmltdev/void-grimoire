---
name: audio-plan
domain: workflow
description: Turn an existing well-written implementation plan into a concise Markdown script for text-to-speech. Use when the user asks for an audio plan, spoken plan, TTS-ready plan summary, or invokes /audio-plan.
depends-on: []
chains-to: null
suggests: ["using-elevenlabs-tts", "audio-recap"]
---

# Audio Plan

Create a TTS-ready `.md` file that explains an existing plan out loud.

The listener may be a non-native English speaker. Optimize for clear spoken understanding, not visual scanning.

## Input Contract

Preferred input: a path to an existing Markdown plan.

If no plan exists yet:
1. Use the harness's available planning workflow, or ask the user for a plan if the harness has no planning support.
2. Create or obtain the plan first.
3. Then run this skill on that plan.

Do not implement the plan from this skill. This skill only writes the audio script.

## Output Location

Write the output beside the source plan as `<plan-name>.audio-plan.md`.
Example: `docs/plans/add-auth.md` -> `docs/plans/add-auth.audio-plan.md`.
If the file exists, suffix with the next integer, like `add-auth.audio-plan-2.md`.
Never overwrite.

## Writing Rules

- Use B2 English.
- Use short sentences.
- Use simple words when possible.
- Explain important jargon once.
- Avoid idioms, jokes, metaphors, and dense technical phrasing.
- Prefer spoken prose over visual Markdown.
- Use headings and short paragraphs.
- Use tiny checklists only when sequence matters.
- Do not use tables.
- Do not use code blocks unless the exact command or prompt must be spoken/copied.
- Mention file paths only when they help orientation.
- Keep the script about 450-1,000 words, roughly 3-7 minutes spoken.

## Content Shape

```markdown
# Audio Plan: {Plan Title}

## Short version
{2-4 sentences explaining the goal and outcome.}

## Why this matters
{Plain-language context.}

## What will change
{Main changes, grouped by user-visible behavior or system area.}

## How the work flows
{Ordered explanation of the plan. Speak the dependency chain.}

## Risks and checks
{Real risks, edge cases, and how the plan verifies them.}

## What to do next
{Concrete next action.}
```

Omit empty sections. Keep the story linear.

## Final Handoff

After writing the file, always print:

```text
Audio plan saved to <path>.

To create spoken audio, paste:
Read @<path> and use /using-elevenlabs-tts to create spoken audio from it.
```

Use the exact generated path.
