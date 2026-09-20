---
name: document-ideas
description: Use when creating, refining, or documenting an idea in a repository's docs/ideas Markdown files; trigger phrases include "document this idea", "capture an idea", "write an idea note", and "refine this idea note".
---

# Document Ideas

Create a durable idea note that matches the repository's existing `docs/ideas/` practice and the idea's maturity.

## Core contract

| Question | Required answer |
| --- | --- |
| Trigger | The user asks to capture, document, write, or refine an idea note. |
| Boundary | Do not turn the note into a spec, plan, issue, or implementation. Do not scan or modify another repository unless the user names it as a reference. |
| Behavior | Read local idea notes first. Choose the smallest useful shape. Preserve source material and supported facts. |
| Authority | Create a new note. Refine an existing note only when the user explicitly asks. |
| Proof | Re-read the saved note. Confirm its path, shape, title, source fidelity, and open questions. |

## Workflow

1. Identify the topic, requested outcome, maturity, and source material. Use repository files and supplied facts before asking the user for information.
2. Locate the current repository's `docs/ideas/` directory. If it does not exist, create it only when the user asked to save an idea note in the current repository.
3. Read two to five nearby idea notes. Reuse their title, filename, heading, and tone conventions. If the user asks to imitate a named external note or repository, read only that reference.
4. Select the note shape from the decision table. Omit every section that has no supported content.
5. Choose a topic filename by default. Add a date prefix only when the date identifies a research result, decision, or imported artifact.
6. Write the note. Start with one `#` title. Do not add YAML frontmatter unless the local notes use it.
7. For an explicit repair, preserve the title, facts, quotations, code, links, and source metadata. Add, move, or simplify sections only where it improves the note. Remove material only when the user asks.
8. Re-read the completed note. Return the path, selected shape, and remaining open questions.

## Note shapes

| Observable condition | Required shape |
| --- | --- |
| Short or deferred thought | `# Idea`, then `## Statement`. Add a status only when the user supplied one. |
| Product or technical direction | `## Problem`, `## Direction` or `## Idea`, and `## Open questions` when a decision remains. Add `## Desired outcome` when a measurable or clear result exists. |
| Future skill or workflow | `## Purpose`, `## Target users`, `## Trigger`, `## Boundary`, `## Core output`, and `## Verification`. Add decision rules only when they affect future behavior. Include a baseline failure only when an actual baseline exposed it. |
| Research, transcript, or conversation import | Preserve the source metadata and source text. Add a concise `## Direction` or `## Decision` only when the user requests synthesis. |

## Decision rules

- The note is an idea when it preserves a direction, open decision, or future option. It is not an implementation plan.
- A concise idea does not need proposal sections. A future skill needs an explicit trigger, boundary, output, and verification because another agent will execute it.
- Local practice controls wording and detail. The decision table only prevents missing load-bearing sections.
- Keep exact names, numbers, dates, code, quoted text, links, and source metadata. Do not invent evidence, status, an owner, an outcome, or an open question.
- If a note contains an import, keep the import readable. Do not rewrite it into generic prose to make the file uniform.

## Output contract

After writing or refining a note, return:

```markdown
**Idea note saved.**
- Path: `docs/ideas/<filename>.md`.
- Shape: <selected row from the decision table>.
- Open questions: <questions that remain, or "none">.
```

## Verification gate

Before reporting the note:

- The file is in the intended repository's `docs/ideas/` directory.
- The title and filename describe the same topic.
- The selected shape fits the idea's maturity and source type.
- No empty headings, placeholder text, or invented facts remain.
- An explicit repair preserved source material unless the user requested its removal.
- The completed file was re-read.

## Red flags

| Failure under pressure | Correct action |
| --- | --- |
| Inventing a generic template before reading local notes | Read local notes. Use the smallest matching shape. |
| Turning a one-sentence thought into a full proposal | Use `# Idea` and `## Statement`. |
| Treating a future skill like an ordinary thought | Add trigger, boundary, output, and verification. |
| Rewriting an imported conversation into artificial prose | Preserve source metadata and source text. |
| Cleaning up an existing note without permission | Refine only after an explicit user request. |
| Scanning desktop repositories to find a style | Read only the current repository, unless the user names another reference. |
