## Context

void-grimoire shipped v2.0.0 as a pruned 13-skill additive library. The refactor removed the `.void-grimoire/` config tree, the `hooks/` auto-injection, and most domain-specific skill bloat — but kept two meta-skills as residue:

- **`use-void-grimoire`**: declares the "three-gate flow" and instructs the model to run gates before any code change. Gate 3 invokes `route-request`.
- **`route-request`**: parses the user's message against `registry.json` triggers and returns matched-domain skills.

In practice, Claude Code's harness already loads skill descriptions and surfaces them automatically; `route-request` re-implements that mechanism in plugin space and adds latency + token overhead at every entry point. `use-void-grimoire`'s "three-gate flow" likewise re-implements native model behaviour as explicit procedure. Net: redundant indirection.

The user adopted openspec for spec-driven work mid-flight, which sharpens the contrast — openspec covers structured workflow; `use-void-grimoire`'s gates duplicate it more vaguely.

## Goals / Non-Goals

**Goals:**
- Delete both skills cleanly.
- Leave the surviving plugin self-consistent (no dangling references, no orphaned config).
- Preserve `registry.json` as a documentation catalog (domain → skills mapping) even after `triggers` arrays are stripped.
- Keep this change atomic and reversible.
- Unblock `import-ecc-content` to ship against a cleaner baseline.

**Non-Goals:**
- Restructuring any other skill.
- Re-introducing alternative routing mechanisms (no replacement; native CC loading is the replacement).
- Touching the in-flight `import-ecc-content` change's existing artifacts (it will be re-applied against the post-removal baseline).
- Removing learned-corrections functionality (`learn-correction` stays).

## Decisions

### D1: Hard delete, not deprecation

These skills are plugin-internal. There's no SemVer-style external API to deprecate against. A soft-deprecation phase (mark as deprecated, keep for one release) adds noise without benefit — Claude Code consumers either invoke them by name or don't.

**Resolution:** Hard delete both skill directories. Patch version bump (`2.0.1`).

**Alternative considered:** Mark skills as deprecated in description for one release, then delete. Rejected — no downstream consumers depend on these skills' existence; deprecation phase wastes a release.

### D2: Keep `registry.json`, strip `triggers`

`registry.json` was originally the input to `route-request`. Without that consumer, the `triggers` arrays have zero readers. But the `skills` arrays remain useful as a domain → skills catalog for documentation (README references it, AGENTS.MD references it).

**Resolution:** Keep `registry.json`. Strip `triggers` arrays from every domain entry. Keep `description` + `skills` arrays.

**Alternative considered:** Delete `registry.json` entirely. Rejected — README and AGENTS.MD render the domain table from this structure; keeping it preserves the source of truth and is cheap.

**Alternative considered:** Keep `triggers` arrays as informal documentation. Rejected — dead fields rot. Future maintainers will assume they're wired to something.

### D3: Patch version, not minor

Strictly internal cleanup with no consumer-facing capability change. SemVer patch.

**Resolution:** `2.0.0` → `2.0.1`. The `import-ecc-content` change will subsequently bump to `2.1.0` (its additive content is a minor bump).

### D4: This change ships and merges BEFORE `import-ecc-content`

The two changes are independent in file scope (`import-ecc-content` adds files; this change deletes files), but `import-ecc-content`'s artifacts were authored before this decision was taken. Re-applying `import-ecc-content` against the post-removal baseline avoids merge weirdness in `registry.json` and removes the now-moot Open Question 1 (patterns-domain triggers).

**Resolution:** Sequence: scaffold + apply this change → archive → re-validate `import-ecc-content` → apply.

**Alternative considered:** Apply both simultaneously in one PR. Rejected — mixes deletion and addition concerns, harder to review and revert.

### D5: No spec files needed

This change has zero new or modified capabilities. The proposal's Capabilities section lists `(none)` for both. openspec's schema accepts a proposal with no capabilities and therefore no spec files. The `specs/` artifact in this change is intentionally empty.

**Resolution:** Skip writing any spec files. If `openspec validate` flags it, fall back to a placeholder marker or schema config.

**Alternative considered:** Write a "noop" spec stub. Rejected — pollutes accepted-specs tree post-archive with content that says nothing.

## Risks / Trade-offs

- **[Risk]** A sibling skill references `route-request` or `use-void-grimoire` internally (e.g., in `chains-to` or body text) and breaks silently after deletion. → **Mitigation:** Pre-deletion grep across `void-grimoire/skills/**/*.md`; rewrite or remove any matches before the deletion commit.
- **[Risk]** `openspec validate` may require at least one spec file even when no capabilities exist. → **Mitigation:** If validation fails, add a minimal placeholder spec file under a `no-capability-change` capability name with a single requirement explaining the change is structural-only. Prefer the empty path if the schema allows it.
- **[Risk]** Documentation references (README, AGENTS.MD) lag the deletion and ship contradictory copy. → **Mitigation:** Doc updates are part of the same change; verification step in tasks.md grep-checks for stale references.
- **[Trade-off]** Stripping `triggers` arrays removes a possible future routing hook. → Accepted; if a future change wants routing, it can re-introduce the field. YAGNI for now.

## Migration Plan

Not applicable. Internal deletion. Rollback = `git revert`.

## Open Questions

1. Does `openspec validate` accept zero spec files when the proposal lists zero capabilities? Will be discovered at validation time. Fallback documented above.
2. Should the patch-release notes / CHANGELOG entry call out the removal explicitly so any external consumer who depended on these skills knows? Lean yes — short note in `void-grimoire/CHANGELOG.md` (if it exists) or PR body, otherwise PR body only.
