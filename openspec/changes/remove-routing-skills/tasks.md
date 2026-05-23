## 1. Prep

- [~] 1.1 Create branch `chore/remove-routing-skills` off `main` — SKIPPED: repo is not a git working tree at this scope; user will commit from their own clone.
- [x] 1.2 Pre-deletion audit complete. Findings: `use-void-grimoire/` was already removed in a prior cleanup; `route-request/` remains and is targeted by this change. Live refs in `README.md`, `expand-prompt/SKILL.md`, `registry.json`, `LORE.md`, `feature-requests.md`. Historical refs in `docs/plans/` and `docs/specs/` left intact as archival.

## 2. Delete skills

- [x] 2.1 `rm -rf void-grimoire/skills/route-request/` — done
- [~] 2.2 `rm -rf void-grimoire/skills/use-void-grimoire/` — NO-OP: directory was already absent at start of execution.

## 3. Update registry.json

- [x] 3.1 Removed `"route-request"` from `domains.void-grimoire.skills`
- [~] 3.2 NO-OP: `"use-void-grimoire"` was not present in `domains.void-grimoire.skills`
- [x] 3.3 Stripped `triggers` field from all six domain entries
- [x] 3.4 `jq . void-grimoire/skills/registry.json` parses clean

## 4. Fix sibling skills that referenced the removed pair

- [x] 4.1 Sibling skill audit complete; only `expand-prompt` referenced `route-request`
- [x] 4.2 Checked `expand-prompt` (had refs, fixed), `learn-correction`, `verify-requirements`, `lookup-docs`, `map-services`, `write-skill`, `init-project` (clean), and others (clean)
- [x] 4.3 `expand-prompt/SKILL.md` frontmatter: `depends-on: [route-request, lookup-docs]` → `[lookup-docs]`. No other skills referenced the removed pair in frontmatter.

## 5. Update documentation

- [x] 5.1 `void-grimoire/README.md`: dropped `route-request` row from domain table, updated skill count (was 13, now 12 — note: original task said "11" but `use-void-grimoire` was already gone before this change started, so net delta is one skill), removed "Registry routing" from the headline description and from the headline-skill bullet, replaced the "`route-request` reads `skills/registry.json`..." paragraph with a "registry is a catalog" paragraph, rephrased "three-gate flow" → "multi-gate flow" in the Architecture section
- [x] 5.2 `AGENTS.MD`, `CLAUDE.md`: grep for trigger phrases returned zero matches; no edits needed
- [~] 5.3 No `void-grimoire/CHANGELOG.md` exists. Removal will be called out in the PR body.

## 6. Version bump

- [x] 6.1 `void-grimoire/.claude-plugin/plugin.json` `2.0.0` → `2.0.1` (also dropped "registry routing" from description)
- [x] 6.2 `void-grimoire/.claude-plugin/marketplace.json` plugin entry `2.0.0` → `2.0.1` (same description update)

## 7. Verify

- [x] 7.1 `openspec validate remove-routing-skills` → "Change 'remove-routing-skills' is valid"
- [x] 7.2 Live-surface grep → zero matches
- [x] 7.3 `jq '.domains | to_entries | map(select(.value.triggers))' registry.json` → `[]`
- [x] 7.4 Every surviving SKILL.md starts with `---` (YAML frontmatter delimiter) — passed
- [x] 7.5 `ls -d void-grimoire/skills/*/ | wc -l` → 12 (note: task said 11, see 5.1 explanation)

## 8. Ship

- [ ] 8.1 Commit with conventional-commit message (`chore(skills): remove routing meta-skills`) — DEFERRED: working dir is not a git repo at this scope; user to commit from their clone.
- [ ] 8.2 Open PR; reference `openspec/changes/remove-routing-skills/` artifacts in PR body; note that `import-ecc-content` will be re-validated against this baseline next — DEFERRED: depends on 8.1
- [ ] 8.3 After merge: `openspec archive remove-routing-skills` to move the accepted spec under `openspec/specs/skill-loading-model/` — DEFERRED: depends on 8.1

## 9. Follow-up handoff

- [ ] 9.1 Re-run `openspec validate import-ecc-content` against the post-removal baseline; confirm Open Question 1 in that change's design.md is now moot and update the design.md inline note — DEFERRED until after 8.3
- [ ] 9.2 Confirm `import-ecc-content`'s tasks.md step 4 (registry update) no longer needs to touch `triggers` arrays — DEFERRED until after 8.3
