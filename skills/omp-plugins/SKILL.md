---
name: omp-plugins
domain: tools
description: Use when installing, updating, or debugging void-grimoire or other marketplace plugins in omp, especially local dev installs, stale marketplace catalogs, missing package.json errors, or version cache mismatches.
depends-on: [using-omp]
chains-to: null
suggests: []
---

# omp plugins

## Overview

omp has two plugin lanes:

- npm plugins: `~/.omp/plugins/package.json` + `node_modules/`
- marketplace plugins: `~/.omp/plugins/installed_plugins.json` + `cache/plugins/`

Void Grimoire is a marketplace plugin, not an npm plugin. Treat npm-style entries for `void-grimoire` as stale cleanup, not the source of truth.

## Quick reference

| Goal | Command |
|---|---|
| Check omp exists | `command -v omp && omp --version` |
| List installed plugins | `omp plugin list` |
| List marketplaces | `omp plugin marketplace list` |
| Discover catalog versions | `omp plugin discover void-grimoire-dev` |
| Repoint dev marketplace to local repo | From repo root: `omp plugin marketplace remove void-grimoire-dev && omp plugin marketplace add ./.` |
| Install/update local dev plugin | `omp plugin install void-grimoire@void-grimoire-dev --force` |
| Health check | `omp plugin doctor` |

Use `omp plugin list`, not `omp list`; `omp list` can hang in some versions.
Run local marketplace commands from the plugin repo root.

## Local void-grimoire update

1. Confirm the desired version in `.claude-plugin/plugin.json`.
2. Keep `.claude-plugin/marketplace.json` for Claude-compatible remote installs.
3. Add or update `.omp-plugin/marketplace.json` for omp-local installs:

```json
{
  "name": "void-grimoire-dev",
  "plugins": [
    {
      "name": "void-grimoire",
      "version": "X.Y.Z",
      "source": "./"
    }
  ]
}
```

Why: `omp plugin install .` expects `package.json`; this repo is a Claude-style plugin. A local marketplace catalog with `source: "./"` lets omp copy the repo as a marketplace plugin.

4. From the plugin repo root, repoint the marketplace if it still targets stale GitHub state:

```bash
omp plugin marketplace remove void-grimoire-dev
omp plugin marketplace add ./.
```

5. Install the exact marketplace plugin:

```bash
omp plugin install void-grimoire@void-grimoire-dev --force
```

6. Verify:

```bash
omp plugin list
omp plugin discover void-grimoire-dev
omp plugin doctor
```

Expected facts:

- `omp plugin list` shows `void-grimoire@void-grimoire-dev (X.Y.Z) (user)`
- `omp plugin discover void-grimoire-dev` shows the same `X.Y.Z`
- `omp plugin doctor` has `0 warnings, 0 errors`

## Cache cleanup

omp copies a local marketplace source with `fs.cp`, not gitignore semantics. After local installs, prune known local-state dirs from the installed cache:

```bash
CACHE="$HOME/.omp/plugins/cache/plugins/void-grimoire-dev___void-grimoire___X.Y.Z"
rm -rf "$CACHE/.crew" "$CACHE/.lean-ctx" "$CACHE/openspec" "$CACHE/docs/plans" "$CACHE/docs/sessions"
```

Only delete inside the versioned plugin cache path.

## Version bump checklist

Update every version-bearing plugin manifest:

- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.omp-plugin/marketplace.json`

Then search for the old version under `.claude-plugin`, `.omp-plugin`, `README.md`, and `skills`; expected result is zero matches.

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| `omp plugin install .` fails with `package.json not found` | Local path install uses npm-plugin lane | Use local marketplace + `source: "./"` |
| `discover` shows old version | Marketplace still points at stale remote cache | Remove and re-add marketplace from `./.` |
| `upgrade --dry-run` says old version | Dry-run prints planned update without changing local catalog source | Repoint marketplace, then install with `--force` |
| `doctor` reports `plugin:void-grimoire Missing package.json` | Stale npm dependency entry | Run `omp plugin uninstall void-grimoire`, or remove it from `~/.omp/plugins/package.json` |
| Installed cache includes `.crew` / `.lean-ctx` | Local copy ignores gitignore | Prune only inside versioned cache |
