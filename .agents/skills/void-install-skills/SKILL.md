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
jq -r '.version' package.json
jq -r '.version' .claude-plugin/plugin.json
jq -r '.plugins[0].version' .claude-plugin/marketplace.json
jq -r '.plugins[0].version' .omp-plugin/marketplace.json
jq -r '.version' .codex-plugin/plugin.json
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

If `claude` is available, refresh the local marketplace and plugin:

```bash
claude plugin marketplace list
claude plugin marketplace remove void-grimoire-dev
claude plugin marketplace add /absolute/path/to/void-grimoire
claude plugin install void-grimoire@void-grimoire-dev
claude plugin list
```

Run `marketplace remove` only when `marketplace list` shows the existing entry. The current CLI removes the installed marketplace plugin with that marketplace, so do not run a separate uninstall afterward. `claude plugin list` must show `void-grimoire@void-grimoire-dev` with the intended version.

### 5. Install into Pi

If `pi` is available:

```bash
pi install ./ -l --approve
pi list --approve
```

Use project-local install (`-l`) for development unless the user explicitly asks for a global Pi install. `--approve` is required when Pi says the project is not trusted; do not use a `git:file://` URL for a local directory. `pi list --approve` must show this repository under project packages.

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
| Claude Code | `plugin list` shows the intended version |
| Pi | `pi install` output and `pi list --approve` show the local repository |
| OMP | `plugin list` and `discover` show intended version |
| Codex | `codex plugin add` output, or exact CLI blocker |

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| OMP install uses stale remote code | Marketplace still points at GitHub or cache | Remove and re-add `void-grimoire-dev` from `./` |
| OMP reports `package.json not found` | Installed through npm plugin lane | Use marketplace install, not direct path install |
| Claude Code install is stale | Marketplace or cached plugin still points at an old source | Remove and re-add the listed local marketplace, then install the plugin |
| Codex rejects `--force` | Codex plugin CLI changed or lacks that flag | Read `codex plugin --help` and use supported update/remove flow |
| Version mismatch after install | Manifests were not updated consistently | Fix manifests, then reinstall again |

## Output contract

Return:

- intended version;
- changed skill paths that triggered reinstall;
- target status for Pi, OMP, Claude Code, Codex, and skills.sh;
- exact skipped targets and blockers;
- verification output proving installed version where available.
