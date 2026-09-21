---
name: infer-patterns
description: Use when inspecting a codebase to infer project-local patterns, create repo-named skill packs, or construct AGENTS.md skill-routing instructions from existing code examples.
---

# Infer Patterns

Turn a codebase into a small project-local skill pack plus an `AGENTS.md` router, using existing code as the source of truth.

## Core contract

Do not write generic framework advice. Ship only skills backed by repo evidence: repeated code patterns, explicit docs, or one clearly ideal exemplar the future agent can clone.

Every generated skill must answer:

| Question | Required answer |
|---|---|
| Trigger | Exact user phrases, task types, file paths, or code smells that require loading it. |
| Boundary | Adjacent work it must not steal from other local skills or generic skills. |
| Behavior | What changes after load: examples to inspect, conventions to follow, gates to run. |
| Procedure | Ordered steps grounded in local files and commands. |
| Proof | Verification command, grep/check, test, or review evidence required before done. |

## Workflow

1. Identify the repo root and canonical project stem:
   - read the root directory name, package/workspace names, app names, and README title
   - remove delivery suffixes when the tech supplies the role: `cms-api` + NestJS -> `cms-nestjs`, `cms-web` + Next.js -> `cms-nextjs`
   - keep the exact root stem when removing a suffix would lose meaning
2. Inventory the repo before deciding skills:
   - manifests and lockfiles
   - framework config and build/test commands
   - source tree, route/module boundaries, packages, apps, workers, scripts
   - tests, fixtures, story files, migrations, schema files
   - existing `AGENTS.md`, `CLAUDE.md`, docs, ADRs, and local skill dirs
3. Find candidate patterns:
   - prefer 2+ concrete examples of the same structure
   - accept 1 exemplar only when it is clearly polished, central, and likely to be copied
   - record each exemplar path and the convention it proves
   - treat docs as secondary; if docs conflict with code, stop that skill and report the conflict
4. Choose a narrow skill pack:
   - create skills only for recurring high-value vectors: framework, state management, styling, tests, data access, db transactions, queues/workers, auth, config, observability, deployment
   - target 3-7 skills for a normal repo; fewer is better when evidence is thin
   - do not create a skill for a convention already covered by an installed generic skill unless the repo adds local constraints
5. Name generated skills:
   - format: `<project-stem>-<technology-or-vector>`
   - examples: `cms-nextjs`, `cms-nestjs`, `cms-state-management`, `cms-db-transactions`, `cms-tests`
   - use technology names for dominant app frameworks
   - use vector names for cross-cutting conventions
   - one canonical name only; no aliases or compatibility duplicates
6. Write each project-local skill:
   - use the host skill frontmatter convention if one exists
   - description starts with `Use when` and contains trigger terms only
   - keep the happy path in `SKILL.md`
   - include exemplar files and commands as concrete anchors
   - move bulky command catalogs or long example matrices into `references/` only when reused
7. Construct or update `AGENTS.md`:
   - preserve human-written repo rules unless contradicted by verified code
   - add a short skill router table: task signal -> skill to load -> evidence source
   - make loading rules mandatory: "Use this generated skill when ..."
   - keep root instructions repo-wide; add nested `AGENTS.md` only when a subtree has different commands or conventions
   - verify every path and command named in `AGENTS.md` exists
8. Verify and report only observed facts.

## Decision rules

| Situation | Move |
|---|---|
| No project-local skill convention exists | Use the agent's supported project-local skill dir; otherwise ask for the install target before writing. |
| Existing AGENTS.md is long | Patch a concise skill-router section instead of rewriting the whole file. |
| Existing AGENTS.md is absent | Create the smallest root `AGENTS.md` that routes local skills and names key commands. |
| Pattern has no exemplar | Do not create a skill; record it as an open candidate. |
| Two vectors share the same triggers | Merge them until the boundary is obvious from task signals. |
| Framework app and vector both apply | Load the framework skill first, then the vector skill. |
| User asks for all patterns | Still ship only evidence-backed skills; report rejected candidates. |

## Output contract

Report exactly:

- repo root and project stem
- generated skills with triggers and exemplar paths
- `AGENTS.md` path and router entries added or changed
- rejected candidates and why
- files changed
- verification commands/scenarios and observed results
- conflicts or open questions

## Verification gate

Before completion, prove:

1. Frontmatter parses for every generated skill.
2. Skill directory name, frontmatter name, and `AGENTS.md` references match exactly.
3. Every exemplar path and command named in a skill or `AGENTS.md` exists.
4. No placeholder markers, fake commands, or guessed install paths remain.
5. At least one pressure scenario routes to the intended local skill without requiring the user to name it.
6. If scripts are generated, run the representative script.

## Pressure scenarios

Use scenarios that tempt generic behavior:

1. "Add a new API endpoint like the existing billing endpoint" -> should load the repo framework skill and point to the exemplar endpoint before editing.
2. "Fix flaky component tests" -> should load the repo tests skill and inspect existing fixtures/test utilities before changing assertions.
3. "Add a DB transaction around this workflow" -> should load the repo db transaction skill and clone the local transaction helper pattern.

## Common mistakes

| Mistake | Correction |
|---|---|
| Naming skills `nextjs` or `tests` without project context | Prefix with the project stem: `cms-nextjs`, `cms-tests`. |
| Inferring patterns from ecosystem memory | Require local exemplars or explicit docs. |
| Creating many tiny skills | Merge until each skill has a distinct trigger and proof gate. |
| Writing AGENTS.md prose without routing rules | Add task-signal -> skill-name -> evidence entries. |
| Claiming agents will auto-load skills from hope | Make `AGENTS.md` contain explicit mandatory load rules. |
| Copying `ideal-example-clone` instead of aligning with it | Generated skills should tell agents which local examples to clone and how to verify parity. |
