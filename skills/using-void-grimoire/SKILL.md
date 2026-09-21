---
name: using-void-grimoire
description: Use when onboarding to, auditing, or changing the Void Grimoire repository, including its skill catalog, plugin manifests, version, repo-local rules, or supported harness installation.
---

# Using Void Grimoire

Orient work in Void Grimoire before changing it, then route authoring and installation to the skills that own those procedures.

## Core contract

Void Grimoire is an additive utility library for coding agents. It is not a product-delivery framework.

A repository change MUST preserve these invariants:

- Skills load on demand. Do not add a startup hook, mandatory gate flow, or hidden `.void-grimoire/` state.
- Project-owned tests, docs, schemas, issues, and agent instructions remain authoritative.
- Canonical plugin skills live under `skills/<skill-name>/SKILL.md`.
- `skills/registry.json` and the README catalog describe the shipped skill set; they do not control runtime routing.
- `.agents/skills/void-install-skills` owns local reinstallation. `.claude/skills` points to `.agents/skills`.
- One capability has one canonical skill name. Renames and replacements use a clean cutover, without aliases or duplicate registry entries.

## Start here

Before editing, return this orientation packet:

```text
Boundary: utility library, not delivery orchestration
Canonical sources: exact files that own this change
Route: skill-forge, void-install-skills, direct docs/rules edit, or a combination
Version: major, minor, patch, or unchanged, with reason
Catalog impact: registry and README updates required or not required
Stop condition: unresolved product boundary, missing source of truth, or none
```

Base the packet on repository evidence. Do not invent files, registries, generated outputs, or release machinery.

## Source map

| Change | Canonical source | Coupled updates |
|---|---|---|
| Change repository policy or version rules | `AGENTS.md` | Update this skill when its recorded repository rules or version policy change |
| Add, revise, rename, or remove a shipped skill | `skills/<skill-name>/SKILL.md` | `skills/registry.json`, README catalog/count when membership changes, version manifests, local reinstall |
| Change the plugin catalog | `skills/registry.json` | README catalog/count |
| Change user-facing plugin documentation | `README.md`, relevant `docs/` file | Version only when repository policy requires it |
| Change reusable agent guidance | `agents/` or `rules/` | README only when the public inventory changes |
| Change repo-local installation behavior | `.agents/skills/void-install-skills/SKILL.md` | `.claude/skills` follows the symlink; do not edit it separately |
| Change package or plugin metadata | `package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.omp-plugin/marketplace.json`, `.codex-plugin/plugin.json` | Keep all version fields aligned |

Do not manually copy a shipped skill into `.agents/skills` or `.claude/skills`. Those paths are not a second canonical plugin catalog.

## Workflow

### 1. Classify the request

Choose the narrowest matching route:

| Observable request | Required route |
|---|---|
| Create, revise, audit, test, rename, or remove a skill | Invoke `skill-forge` before editing |
| Reinstall after any skill, manifest, or repo-local agent-instruction change | Invoke `void-install-skills` after verification |
| Edit only prose, rules, or agent definitions | Use the source map and repository conventions directly |
| Add delivery phases, acceptance gates, ambient state, or product orchestration | Stop and identify the boundary conflict |

A request can require both `skill-forge` and `void-install-skills`. Do not copy either skill's command catalog into this skill.

### 2. Inspect the owned sources

Read only the files selected by the source map plus two or three strong neighboring examples. Reuse the existing structure and vocabulary. A second registry, generated manifest, per-skill README, changelog, or template is out of scope unless an existing source or explicit user request requires it.

### 3. Apply version policy

| Change scope | Version decision |
|---|---|
| Overhaul-level or breaking plugin change | Major |
| New skill or significant changes across multiple skills | Minor |
| Small change to one skill, README, or similar maintenance | Patch |
| Investigation with no repository change | Unchanged |

When a bump is required, update all five version sources in one change:

- `package.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.omp-plugin/marketplace.json`
- `.codex-plugin/plugin.json`

Do not update one manifest and leave the others stale.

### 4. Keep catalogs coherent

When skill membership changes:

1. Add or remove the canonical name in exactly one domain in `skills/registry.json`.
2. Update the README's total count, domain row, and relevant headline entry.
3. For a rename, remove every old catalog name and old skill directory in the same cutover.
4. Do not retain aliases, forwarding skills, duplicate entries, or compatibility copies unless the user explicitly approves that exception.

A content-only edit to an existing skill does not require a catalog rewrite.

### 5. Verify the source change

Before installation, prove:

- YAML frontmatter parses and the directory name matches `name`.
- `skills/registry.json` contains the canonical name exactly once, and the README domain table contains it exactly once; intentional headline or prose mentions are allowed.
- README count equals the number of registered skills.
- All referenced support files exist.
- No placeholder, stale name, or unintended duplicate remains.
- All five version fields match when a bump was required.
- A fresh pressure scenario demonstrates the changed skill avoids its baseline failure.

Use the repository's existing validation commands. Do not claim packaging or installation from file inspection alone.

### 6. Reinstall the local plugin

After a skill, manifest, or repo-local instruction change, invoke `void-install-skills`. That skill owns target detection, commands, skips, blockers, and per-harness evidence for Pi, OMP, Claude Code, Codex, and skills.sh.

Installed state and live activation are different claims. Report a restart requirement when the current host cannot prove live reload.

## Decision rules

- **User asks for onboarding only:** return the orientation packet and relevant source map; do not modify files.
- **Repository reality conflicts with this map:** stop with the observed file evidence; do not create a parallel convention.
- **A proposed capability belongs to product delivery:** reject it from this plugin or ask for an explicitly approved boundary change.
- **An optional artifact seems helpful:** omit it unless the repository already owns that artifact or the user requested it.
- **Commit, push, publish, or visibility change is not explicit:** do not perform it.

## Output contract

Return fields in this order. Use commas, semicolons, colons, parentheses, or hyphens instead of em dash characters in user-facing output.

```text
Plugin: canonical name and purpose
Boundary: work owned by this plugin and excluded adjacent work
Sources: relevant repository files and catalogs
Route: skills required for the requested change
Version: applicable bump rule and version-bearing files
Proof: required checks and installer evidence, including catalog and activation status when applicable
Stop: none or one concrete conflict
```

## Verification gate

Do not say the change is complete until source validation and the required local reinstall both ran. If a harness is unavailable, report it as skipped. If the current session cannot prove activation, say `restart required`; do not convert installed files into a live-activation claim.

## Red flags

Stop if the work starts to:

- turn Void Grimoire into an SDLC or product-delivery framework;
- add an MCP server, runtime service, npm link workflow, or package publication path without an explicit request;
- create another registry, generated catalog, per-skill README set, or harness-specific instruction tree;
- edit `.claude/skills` separately from `.agents/skills`;
- leave versions inconsistent;
- keep an old skill name as an alias after a clean cutover;
- claim installation or activation without observed command evidence.
