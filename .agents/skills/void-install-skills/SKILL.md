---
name: void-install-skills
description: Use when reinstalling Void Grimoire plugin skills into local harnesses after creating, changing, or deleting skills, plugin metadata, manifests, or repo-local agent skill instructions.
---

# Void Install Skills

Reinstall the local Void Grimoire plugin into every supported harness available on this machine.

## Core contract

Before reporting completion for a Void Grimoire skill change:

1. Confirm every plugin or package manifest uses the intended version.
2. Reinstall from this repository, not from the remote marketplace, unless the user explicitly asks for remote install.
3. Target every available local harness: Pi, OMP, Claude Code, and Codex.
4. Report exact install commands run, skipped harnesses, and observed output.

## Scope

Use this skill only for the `void-grimoire` plugin repository. It does not own normal plugin authoring, release publishing, marketplace review, or unrelated harness setup.

## Local reinstall workflow

Run from the repository root.

### 1. Read version sources

```bash
jq -r '.version' .claude-plugin/plugin.json
jq -r '.plugins[0].version' .claude-plugin/marketplace.json
jq -r '.plugins[0].version' .omp-plugin/marketplace.json
```

All values must match. If they do not match, stop and fix the manifests before installing.

### 2. Detect available harnesses

```bash
command -v pi
command -v omp
command -v claude
command -v codex
```

A missing command is a skipped target, not a failed install. Report it as skipped.

### 3. Install into skills.sh targets

If `npx` is available, install the repo-local skills pack:

```bash
npx skills add ./ --skill '*' -y
```

Use `--copy` only when the user asks for copied skills instead of the default install behavior.

### 4. Install into Claude Code

Claude Code plugin installation is slash-command driven. If the current harness can execute Claude Code slash commands, run:

```text
/plugin marketplace add /absolute/path/to/void-grimoire
/plugin install void-grimoire@void-grimoire-dev
```

If slash commands cannot be executed from the current harness, report Claude Code as requiring manual reinstall and provide the two commands above with the absolute path filled in.

### 5. Install into Pi

If `pi` is available:

```bash
pi install ./ -l --approve
```

Use project-local install (`-l`) for development unless the user explicitly asks for a global Pi install. `--approve` is required when Pi says the project is not trusted; do not use a `git:file://` URL for a local directory.

### 6. Install into OMP

If `omp` is available:

```bash
omp plugin marketplace remove void-grimoire-dev
omp plugin marketplace add ./
omp plugin install void-grimoire@void-grimoire-dev --force
omp plugin list
omp plugin discover void-grimoire-dev
```

`omp plugin list` must show `void-grimoire@void-grimoire-dev` with the intended version. `discover` must show the same version.

### 7. Install into Codex

If `codex` is available:

```bash
codex plugin marketplace remove void-grimoire-dev
codex plugin marketplace add /absolute/path/to/void-grimoire
codex plugin remove void-grimoire@void-grimoire-dev
codex plugin add void-grimoire@void-grimoire-dev
codex plugin list
```

`codex plugin list` must show `void-grimoire@void-grimoire-dev` with the intended version. If Codex reports a changed CLI shape, use the current Codex help output to choose the supported update, remove, or force option. Do not invent flags.

## Verification gate

Before saying the reinstall is complete, provide evidence for each available harness:

| Target | Evidence |
|---|---|
| skills.sh | command output from `npx skills add` |
| Claude Code | slash-command output, or explicit manual-blocker note |
| Pi | `pi install` output |
| OMP | `plugin list` and `discover` show intended version |
| Codex | `codex plugin add` output, or exact CLI blocker |

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| OMP install uses stale remote code | Marketplace still points at GitHub or cache | Remove and re-add `void-grimoire-dev` from `./` |
| OMP reports `package.json not found` | Installed through npm plugin lane | Use marketplace install, not direct path install |
| Claude Code commands cannot run | Current harness cannot execute Claude slash commands | Report manual commands with absolute path |
| Codex rejects `--force` | Codex plugin CLI changed or lacks that flag | Read `codex plugin --help` and use supported update/remove flow |
| Version mismatch after install | Manifests were not updated consistently | Fix manifests, then reinstall again |

## Output contract

Return:

- intended version;
- changed skill paths that triggered reinstall;
- target status for Pi, OMP, Claude Code, Codex, and skills.sh;
- exact skipped targets and blockers;
- verification output proving installed version where available.
