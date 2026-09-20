---
name: refactor-transaction
description: Use when performing refactors, migrations, clean cutovers, API/module renames, moves, extractions, caller migrations, or when considering shims, aliases, re-exports, compatibility layers, or deprecated paths.
---

# refactor-transaction

Execute refactors as one transaction: discover every dependency, migrate every caller, prove behavior, then delete the old path. A partial cutover is a bug, not progress.

## When to use

| Use case | Examples |
|---|---|
| Rename | Exported symbol, public type, hook, service, command, route helper. |
| Move | Module path, package boundary, feature folder, adapter, test utility. |
| Extract | Shared API from inline logic, module from feature code, package from app code. |
| Migrate | Caller import path, config key, event/topic name, CLI flag, docs example. |
| Clean cutover | Replace old canonical path with one new canonical path in one transaction. |
| Compatibility pressure | Request mentions shim, alias, re-export, deprecated path, bridge, fallback, or staged rollout. |

Do not use for behavior redesigns. If behavior must change, separate the behavior change from the refactor transaction.

## Required inputs

| Input | Required | If missing |
|---|---:|---|
| Target symbol/module/path | Yes | Stop and identify it from code or ask one question. |
| Desired new name/location/API | Yes | Stop; do not invent public API names silently. |
| Compatibility requirement | Yes | Default to no shim/alias/re-export/deprecated path. Ask only if product/runtime compatibility is unknowable. |
| Verification surface | Yes | Derive from touched tests, package scripts, docs, and call graph. |
| Docs/memory locations | If affected | Update only after code proof. |

## Operation rules

| Operation | Safe cutover rule |
|---|---|
| Rename exported API | LSP rename/preview or references first; migrate all imports/calls; delete old export name. |
| Move module | Add new file at destination, migrate imports, delete old file and barrel export, then verify path resolution. |
| Extract module/API | Extract without behavior change, wire callers to extracted API, delete duplicated inline logic. |
| Split package boundary | Update package exports/imports/types together; verify downstream workspace callers. |
| Replace config/key/route/CLI flag | Migrate readers, writers, fixtures, and all tests that reference the old contract before verification; postpone docs/memory until proof; no fallback key unless approved. |

## Transaction invariants

| Invariant | Rule |
|---|---|
| One canonical API | After cutover, exactly one public path/name remains unless explicit approval says otherwise. |
| Full caller migration | All code callers, tests, fixtures, generated type references, and scripts use the new path/name before verification. |
| No stealth compatibility | No alias, shim, re-export, wrapper, deprecated bridge, fallback import, or duplicate module unless explicitly approved. |
| LSP before exported changes | Before changing an exported symbol or module boundary, use LSP references or equivalent symbol-aware lookup. Text search is secondary. |
| Delete old paths | Remove obsolete files, exports, fixtures, docs snippets, stale comments, and old tests after migration is proven. |
| Proof before docs/memory | Update DOCS and MEMORY only after the CODE and TESTS cutover is smoke-tested. |

## Reference discovery protocol

| Target kind | Required lookup |
|---|---|
| Exported function/class/type/const | LSP references/rename preview first; AST/text search second. |
| Module/file path | Import graph/search for static imports, dynamic imports, config strings, barrel exports, docs snippets. |
| Package public API | Entry points, package exports, generated declarations, downstream workspace imports, examples. |
| Route/CLI/event/topic name | Router/command registry, tests, docs, scripts, fixtures, telemetry names if they are contract-bearing. |

Do not edit an exported symbol until this lookup has a complete migration list or a stop case.

## Compatibility exceptions

| If explicit approval allows dual paths | Then record |
|---|---|
| Temporary alias/shim/re-export | Owner, deletion trigger, expiry date or release, verification for both paths. |
| External contract must remain | Which consumers require it and why a clean cutover is unsafe now. |
| Staged rollout | Stage boundaries, rollback rule, and final deletion step. |

Compatibility mode is not the default. Without this record, remove the old path.

## Workflow

| Step | Action | Proof needed before next step |
|---:|---|---|
| 1 | Define the transaction: old API, new API, package/module boundary, expected behavior parity, compatibility decision. | Written scope in your notes or response. |
| 2 | Discover references with LSP for exported symbols. Add AST/text search for string paths, config, docs, tests, dynamic imports, and generated artifacts. | Reference list covers CODE, TESTS, DOCS, MEMORY. |
| 3 | Classify each reference: migrate, delete, preserve as external contract, or stop case. | No unknown references remain. |
| 4 | Change the definition first only when callers can be migrated immediately in the same turn. Otherwise prepare callers first. | No broken intermediate handoff. |
| 5 | Migrate every code and test caller to the new API/path. Preserve behavior; do not combine with unrelated cleanup. | All discovered code/test callers updated. |
| 6 | Remove old exports/files/routes/types and stale comments. Do not leave compatibility crumbs. | Search/LSP finds no old canonical API usage except intentional historical docs. |
| 7 | Run the narrowest meaningful verification that exercises changed callers and public behavior. | Observed output, not assumption. |
| 8 | Fix failures at the source. Re-run the failing verification until it passes or a stop case is hit. | Passing observed output. |
| 9 | After proof, update docs, examples, and memory references to match the new canonical API. | No stale instructional reference remains. |
| 10 | Report changed surface, verification run, deleted paths, and any explicitly approved compatibility exception. | Output contract below. |

## Atlas pillar checklist

| Pillar | Cutover requirement |
|---|---|
| CODE | New API is canonical; old API removed; all callers migrated. |
| TESTS | Tests assert behavior through the new API; old API tests deleted or rewritten. |
| DOCS | Docs/examples mention only the new API after code proof. |
| MEMORY | Project memory/rules are updated only if the refactor changes future agent behavior. |

## Output contract

Return this shape when the refactor is done:

```markdown
**Refactor transaction complete.**
- Cutover: <old> => <new>
- Migrated: <caller groups>
- Deleted: <old paths/exports>
- Compatibility: none | explicitly approved <details>
- Verification: <commands/scenarios run + observed result>
- Follow-up: none | <blocked external work only>
```

If stopped:

```markdown
**Stopped before cutover.**
- Stop case: <condition>
- Evidence: <what lookup/proof found>
- Needed decision/input: <one concrete item>
```

## Stop / refusal cases

| Stop when | Why |
|---|---|
| Public API compatibility is required but not approved. | A shim changes the contract and maintenance burden. |
| LSP/reference lookup is unavailable for an exported symbol and the blast radius is not otherwise bounded. | Text search alone can miss semantic callers. |
| Dynamic runtime references cannot be enumerated or tested. | A clean cutover cannot be proven. |
| The refactor needs generated files/schemas but generation cannot run. | Manual edits risk drift. |
| Verification fails outside the refactor scope. | Report exact failure; do not hide it with a shim. |
| User asks to keep old and new names without owning the compatibility cost. | Require explicit approval for dual paths. |

## Common mistakes

| Mistake | Correct move |
|---|---|
| Rename definition, then rely on compiler errors to find callers. | Use LSP references before changing exported symbols. |
| Leave `export { New as Old }` to be safe. | Delete old export unless explicit compatibility approval exists. |
| Keep old file importing and re-exporting new file. | Move callers, then delete old file. |
| Update docs first because it is easy. | Prove code works first; docs/memory follow proof. |
| Search only source files. | Include tests, fixtures, scripts, configs, docs examples, generated refs, and memory/rules. |
| Mix refactor with behavior cleanup. | Preserve behavior; file separate work for behavior changes. |
| Treat one passing test as full proof. | Verify the changed public behavior and representative migrated callers. |
| Leave stale comments mentioning old names. | Delete or rewrite stale comments during final cleanup. |

## Red flags

Stop and re-check scope if you catch yourself saying:

- "Temporary alias."
- "We'll delete the old path later."
- "Compiler will find it."
- "Only tests/docs still use the old name."
- "This import path probably is not used."
- "Keeping both is safer."

All of these indicate an incomplete transaction unless the user explicitly approved compatibility mode.
