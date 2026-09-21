# Skill plugin management design

**Date:** 2026-09-21
**Status:** Approved

## 1. Purpose

Define how agents create and manage Dmytro-owned skill plugins.

The design has three parts:

1. One owner-level skill for cross-plugin policy.
2. One plugin-local onboarding and lifecycle skill in each owned plugin.
3. One separate plugin-local installation skill in each owned plugin.

This design covers Pi, OMP, Claude Code, and Codex.

## 2. Problem

The owned plugin repositories use similar package surfaces. Their repository details are not identical.

A generic agent can make these errors:

- It can invent a registry, changelog, script, or support directory.
- It can update one manifest and leave other versions stale.
- It can use npm linking instead of the supported harness commands.
- It can treat packaging validation as installation proof.
- It can publish to the wrong host or use public visibility by default.
- It can add aliases during a rename and leave two canonical names.
- It can copy one plugin's structure into a plugin with different needs.

The solution must enforce shared owner policy without replacing plugin-local truth.

## 3. Evidence

### 3.1 Local repositories

Void Grimoire uses these sources:

- `AGENTS.md`
- `README.md`
- `package.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.omp-plugin/marketplace.json`
- `.codex-plugin/plugin.json`
- `skills/registry.json`
- `.agents/skills/void-install-skills/SKILL.md`

The Aven, content-extraction, and dmltdev plugins also use five version-bearing manifests. They do not all use a skill registry. Each has a plugin-local installer.

The installers share these rules:

- Use the local checkout by default.
- Detect each harness independently.
- Report a missing harness as a skip.
- Keep all manifest versions aligned.
- Report packaging, installation, and activation as different facts.

### 3.2 Baseline pressure test

A fresh model without the proposed skills produced a generic scaffold. It invented these requirements:

- `CHANGELOG.md`
- `registry/skills.json`
- one README for every skill
- one document for every harness
- npm linking
- GitLab package-registry publication
- a central owned-plugin registry

The local repositories do not support those requirements as shared invariants.

### 3.3 External candidates

Three skills.sh candidates informed this design:

- [Plugin Structure](https://www.skills.sh/aiagentskills/skills/plugin-structure) has useful Claude Code layout terms. It does not cover the other harnesses or owner policy.
- [plugin-authoring](https://skills.sh/arcblock/agent-skills/plugin-authoring) diagnoses before action. It depends on Claude-specific commands and reviewer delegation.
- [plugin-syncer](https://www.skills.sh/richfrem/agent-plugins-skills/plugin-syncer) uses an explicit inventory. Its central sync file would create a new authority and move installation knowledge out of each plugin.

The proposed skills reuse the strong ideas without copying those boundaries.

## 4. Decision

Use a two-layer management contract.

### 4.1 Owner-level skill

Add `manage-skill-plugin` to `dmltdev-skills`.

Use it when an agent creates, audits, renames, restructures, or materially changes a Dmytro-owned skill plugin.

It owns shared owner policy:

- private GitLab project creation under `gitlab.com/dmltdev`;
- supported harness surfaces;
- source-of-truth discovery;
- version alignment;
- clean cutovers;
- local operational skill requirements;
- completion evidence.

It does not own individual skill quality. It invokes `skill-forge` for that work.

It does not own installation. It invokes the target plugin's local installer.

### 4.2 Plugin-local skill

Each owned plugin contains one `using-<plugin>` skill.

The skill combines onboarding, repository structure, and lifecycle guidance. It contains only facts about its owning plugin.

For this repository, the name is `using-void-grimoire`.

Each local skill owns:

- plugin purpose and non-goals;
- exact source-of-truth paths;
- supported component layout;
- local skill catalog rules;
- version-bearing files;
- version policy;
- change routing;
- completion evidence.

The local skill routes installation to the separate installer.

### 4.3 Plugin-local installer

Each owned plugin keeps a separate installation skill.

The installer owns state-changing harness operations. It also owns per-target installation evidence.

The onboarding skill must not copy installer commands. This separation prevents stale command copies and false installation claims.

## 5. Shared minimum for a new plugin

A new Dmytro-owned skill plugin must contain:

- `AGENTS.md`;
- `README.md`;
- `package.json` with Pi skill discovery;
- `skills/`;
- `.claude-plugin/plugin.json`;
- `.claude-plugin/marketplace.json`;
- `.omp-plugin/marketplace.json`;
- `.codex-plugin/plugin.json`;
- one `using-<plugin>` skill;
- one plugin-local installer for Pi, OMP, Claude Code, and Codex.

The agent creates a private GitLab project with `glab`. The default namespace is `gitlab.com/dmltdev`.

The agent uses an initial version of `0.1.0` unless the repository has another policy.

The agent adds optional files only when the plugin needs them. Optional files include:

- a skill registry;
- a changelog;
- scripts;
- references;
- assets;
- agents;
- rules;
- per-harness documents.

Public visibility requires an explicit user instruction.

## 6. `manage-skill-plugin` contract

### 6.1 Trigger

Load the skill for these operations on a Dmytro-owned plugin:

- create;
- audit;
- rename;
- restructure;
- add or remove a skill;
- change plugin metadata;
- change visibility;
- prepare a versioned local rollout.

### 6.2 Boundary

The skill must not:

- author an individual skill without `skill-forge`;
- install a plugin without its local installer;
- make a plugin public without explicit approval;
- create optional files without repository evidence;
- create aliases during a rename;
- treat one plugin as the schema for all plugins.

### 6.3 Behavior

After the skill loads, the agent uses the target repository as the source of truth. The agent applies shared owner policy only where the target does not define a stricter rule.

The skill changes plugin work in four ways:

- it makes source discovery mandatory before file creation;
- it separates skill authoring, plugin management, and installation;
- it keeps existing catalogs and versions coherent;
- it requires observed proof before completion.

### 6.4 Procedure

1. Resolve the target repository.
2. Confirm that Dmytro owns the plugin.
3. Classify the requested operation.
4. Read repository instructions and current sources of truth.
5. Read the existing plugin-local `using-<plugin>` and installer skills. Record either skill as missing when the operation must create it.
6. Inspect the five manifest versions and plugin names.
7. Determine which README and registry entries already exist.
8. For a new plugin, create the shared minimum.
9. For an existing plugin, preserve its established optional structure.
10. Invoke `skill-forge` for each new or materially revised skill.
11. Apply a clean cutover for each rename or removal.
12. Apply the owning plugin's version policy.
13. Update every existing source that lists skills or versions.
14. Invoke the plugin-local installer.
15. Report observed packaging, installation, activation, and pressure-test evidence.

### 6.5 Stop cases

Stop before mutation when:

- the target is not Dmytro-owned;
- an equivalent GitLab project already exists and ownership is unclear;
- manifest names or versions disagree before an install;
- required repository facts conflict;
- a public visibility change lacks explicit approval.

An unavailable harness is not a stop case. The installer reports it as a skip.

### 6.6 Output contract

The skill reports:

```text
Plugin: canonical plugin name and repository
Operation: create | audit | rename | restructure | add/remove skill | metadata | visibility | rollout
Sources: repository files read and optional sources absent
Changes: files created, changed, moved, or removed
Version: policy used and aligned manifest version
Visibility: observed GitLab visibility or unchanged
Pi: installed | skipped | blocked | not attempted; evidence
OMP: installed | skipped | blocked | not attempted; evidence
Claude Code: installed | skipped | blocked | not attempted; evidence
Codex: installed | skipped | blocked | not attempted; evidence
Pressure scenario: prompt and observed result
Follow-up: none or one blocked external action
```

## 7. `using-<plugin>` contract

### 7.1 Trigger

Load the local skill when an agent enters the plugin repository or changes its structure, skills, manifests, catalog, or version.

### 7.2 Boundary

The local skill must not:

- replace `skill-forge`;
- replace the plugin installer;
- define cross-plugin owner policy;
- infer optional files from another plugin;
- publish or install by itself.

### 7.3 Behavior

After the skill loads, the agent can identify the plugin's purpose, authoritative files, required companion skills, version policy, and proof gates without using another repository as a template.

The skill routes each change to the correct owner. It does not execute installation or replace generic skill-authoring discipline.

### 7.4 Required content

The local skill contains:

1. one-line purpose;
2. plugin boundary and invariant;
3. exact source-of-truth map;
4. component and skill layout;
5. change routing table;
6. version policy;
7. ordered maintenance workflow;
8. output contract;
9. verification gate;
10. pressure failures.

### 7.5 Change routing

| Change | Required route |
|---|---|
| Create or materially revise a skill | `using-<plugin>` then `skill-forge`, then the local installer |
| Create or restructure a plugin | `manage-skill-plugin`, then `using-<plugin>`, then the local installer |
| Reinstall only | local installer |
| Audit generic skill quality | `skill-forge`; load `using-<plugin>` for local catalog or version effects |

### 7.6 Output contract

The local skill reports:

```text
Plugin: canonical name and purpose
Boundary: work owned by this plugin and excluded adjacent work
Sources: relevant repository files and catalogs
Route: skills required for the requested change
Version: applicable bump rule and version-bearing files
Proof: required checks and installer evidence
Stop: none or one concrete conflict
```

## 8. Version policy

Each plugin keeps its own version policy in `AGENTS.md` and `using-<plugin>`.

Void Grimoire uses this policy:

- major: overhaul-level change;
- minor: a new skill or significant changes across multiple skills;
- patch: a small change to one skill or documentation.

All version-bearing manifests must use the same version before installation.

The manager must not apply Void Grimoire's bump policy to another plugin unless that plugin adopts it.

## 9. Verification

Each new or revised skill must pass these checks:

1. YAML frontmatter parses.
2. Frontmatter contains only the host plugin's accepted keys.
3. The directory and frontmatter names match.
4. README and registry names match when those sources exist.
5. Every referenced file exists.
6. No placeholder, guessed command, fake example, or stale name remains.
7. All version-bearing manifests agree.
8. A fresh agent passes a relevant pressure scenario.
9. The local installer reports every supported harness separately.
10. Packaging, installation, and activation evidence remain separate.

### 9.1 Pressure scenarios

#### Create a new plugin

Prompt: "Create a private skill plugin for browser automation and make it available in Pi, OMP, Claude Code, and Codex."

Expected behavior:

- create or reuse a private GitLab project;
- create the shared minimum;
- do not invent a registry, changelog, package publication, or per-harness documents;
- create both local operational skills;
- verify each harness separately.

#### Add a skill to a registryless plugin

Prompt: "Add a transcript-cleanup skill to this plugin and ship the local update."

Expected behavior:

- use the plugin's current sources of truth;
- do not create `skills/registry.json`;
- apply the local version policy;
- reinstall through the local installer.

#### Rename a Void Grimoire skill

Prompt: "Rename this skill and update the plugin."

Expected behavior:

- remove the old canonical name;
- update `skills/registry.json`;
- update the README table and count;
- update all manifest versions;
- reinstall without an alias;
- report observed evidence.

## 10. Rollout

Use separate versioned transactions.

### 10.1 Canonical owner policy

Add `manage-skill-plugin` to `dmltdev-skills`. Update that plugin's existing sources of truth. Reinstall with `dmltdev-install-skills`.

### 10.2 First local contract

Add `using-void-grimoire` to this repository. Update its registry, README, five manifests, and version. Reinstall with `void-install-skills`.

### 10.3 Owned plugin rollout

Inventory the remaining owned skill plugins. For each plugin:

1. identify its current sources of truth;
2. add one `using-<plugin>` skill;
3. confirm that its installer meets the four-harness contract;
4. update its version and existing catalogs;
5. reinstall and verify it before moving to the next plugin.

Do not copy one generic skill body across all repositories.

## 11. Alternatives

### 11.1 Local-only policy

This option repeats owner policy inside each plugin.

Rejected because owner policy would drift. New plugin creation would have no canonical entry point.

### 11.2 Central monolith in Void Grimoire

This option puts all owner and repository policy in one public utility plugin.

Rejected because private Dmytro-specific policy does not belong in Void Grimoire. A central skill would also guess repository-specific files.

### 11.3 Scaffold generator now

This option adds templates or scripts before rollout.

Rejected because the plugin family does not have one stable optional-file schema. A generator would freeze unsupported assumptions.

Automation can be reconsidered after rollout finds a repeated and stable failure.

## 12. Non-goals

This design does not:

- create a central runtime plugin registry;
- synchronize plugins automatically;
- publish packages to npm or GitLab Package Registry;
- make existing private plugins public;
- replace plugin-local installers;
- replace `skill-forge`;
- require optional files in every plugin;
- define product-delivery workflows.

## 13. Acceptance criteria

The design is complete when:

- `manage-skill-plugin` exists in `dmltdev-skills`;
- `using-void-grimoire` exists in this repository;
- every affected skill answers trigger, boundary, behavior, procedure, and proof;
- every modified plugin has a separate local installer;
- all existing catalogs and version-bearing manifests agree;
- modified plugins are reinstalled into each available harness;
- unavailable harnesses are reported as skips;
- fresh pressure scenarios avoid the baseline failures;
- no plugin gains an unsupported registry, changelog, script, or publication path;
- no public visibility change occurs without explicit approval.
