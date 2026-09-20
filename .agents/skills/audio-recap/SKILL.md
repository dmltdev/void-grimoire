---
name: audio-recap
domain: workflow
description: Turn changes made by an agent into a concise Markdown script for text-to-speech. Use only when the user explicitly asks for an audio recap, spoken recap, TTS-ready change summary, or invokes /audio-recap.
depends-on: []
chains-to: null
suggests: ["using-elevenlabs-tts", "audio-plan", "visual-recap"]
---

# Audio Recap

Create a TTS-ready `.md` file that explains completed agent work out loud.

Use this only when explicitly invoked. Do not auto-run after every change.

The listener may be a non-native English speaker. Optimize for clear spoken understanding, not visual scanning.

## Input Contract

Use the current session first:
- user request
- decisions made
- files changed
- commands run
- verification observed
- unfinished work

Use git diff or stat when available to ground changed files. Do not require a commit, branch, or pull request.

If the user gives a PR, branch, commit, or diff, recap that target instead.

## Output Location

Write recaps under `docs/audio-recaps/<slug>.audio-recap.md`.
Build `<slug>` from the work title in kebab-case.
If the file exists, suffix with the next integer, like `<slug>.audio-recap-2.md`.
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
- Do not use code blocks unless the exact command or prompt must be copied.
- Mention only key file paths, and speak why they matter.
- Keep the script about 450-1,000 words, roughly 3-7 minutes spoken.

## Truth Rules

- Include only changes that were actually made or observed.
- Include verification only when the command or check was observed.
- If no verification was run, say: "This change was not verified in this session."
- Do not claim performance, security, parity, or integration success unless it was checked.
- Separate finished work from remaining work.

## Content Shape

```markdown
# Audio Recap: {Work Title}

## Short version
{2-4 sentences explaining what changed and current status.}

## What the user asked for
{Plain-language request summary.}

## What changed
{Main changes by feature/system area, not line-by-line.}

## Important files
{Only key files, with why they matter.}

## Verification
{Observed checks and results, or explicit not-verified sentence.}

## Risks and follow-up
{Known risks, limitations, or next steps.}
```

Omit empty sections. Keep the story linear.

## Final Handoff

After writing the file, always print:

```text
Audio recap saved to <path>.

To create spoken audio, paste:
Read @<path> and use /using-elevenlabs-tts to create spoken audio from it.
```

Use the exact generated path.
