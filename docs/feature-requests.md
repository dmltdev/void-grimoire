# Feature Requests

---

## FR-001: Guardian Mode — Enforce Thinking Before Acting

**Status:** Draft
**Priority:** High
**Date:** 2026-03-14

### Intent

The grimoire should enforce that the model *understands why* before implementing. For large changes, multi-file features, or refactors, the model must self-verify its understanding of the problem space and flag potential risks or design issues before writing code.

If the user tries to skip critical steps (brainstorming, planning, risk assessment), the grimoire should either:
1. **Inform** — tell the user they're skipping important steps and what risks that carries
2. **Gate** — require explicit acknowledgment to proceed (e.g., a `YOLO` keyword or `workflow:yolo` skill invocation)

### Problem

Currently, the three-gate flow checks rules, docs, and routing — but it doesn't prevent the model from diving into implementation without understanding *why* a change is being made. A user can say "refactor the auth module" and the model will comply without questioning whether the refactor makes architectural sense.

### Desired Behavior

- For changes that span multiple files, touch core abstractions, or involve refactoring: the model should **self-verify** its understanding of the motivation, impact, and risks
- If the model detects potential design issues or risks, it **must inform the user immediately** — before any code is written
- The user doesn't have to explicitly explain "why" — the model should infer it from context and ask if uncertain
- If the user wants to skip the guardian check, they must acknowledge it explicitly

### Risks & Concerns

**Blocking / productivity degradation:**
- Guardian checks on every change would be exhausting and counterproductive
- False positives (flagging simple changes as risky) would train the user to ignore warnings
- The threshold for "what counts as a big change" is fuzzy and context-dependent

**Possible mitigations:**
- Threshold heuristics: only trigger for changes touching 3+ files, or involving architectural patterns (dependency changes, interface changes, data model changes)
- Severity levels: `info` (just a note) vs `warn` (should acknowledge) vs `block` (must acknowledge or YOLO)
- Learning: track when the user overrides warnings — if they YOLO frequently for a certain type of check, reduce its severity
- Per-project config: some projects are experimental (low guardian), some are production (high guardian)

**YOLO escape hatch:**
- `workflow:yolo` skill or `YOLO` keyword lets the user explicitly bypass guardian checks
- Should log that guardian was bypassed (for self-learning — "user YOLOs refactors in this project")
- YOLO scope: per-action (this one change) vs per-session (don't bother me this session)

### Open Questions

1. What's the right threshold for triggering guardian mode? File count? Complexity heuristic? Semantic analysis of the change?
2. Should guardian mode be on by default or opt-in per project?
3. Should repeated YOLOs for the same category auto-reduce guardian sensitivity (self-learning), or is that dangerous?
4. How to distinguish "the user knows what they're doing and wants speed" from "the user doesn't realize they're about to break something"?
5. Should the model also self-verify on *deletions* (removing code, dropping features, removing dependencies)?

---

## FR-002: Debug Log Access

**Status:** Approved (part of centralized config spec)
**Priority:** Medium
**Date:** 2026-03-15

### Intent

AI should have query access to project logs during debugging. Configured per-project via `config.features.logAccess` with tool name and usage instructions. Supports MCP tools (Sentry, Axiom) or local CLI tools.

### Design

See `docs/specs/2026-03-15-centralized-config-and-features-design.md`

---

## FR-003: Decision History

**Status:** Approved (part of centralized config spec)
**Priority:** Medium
**Date:** 2026-03-15

### Intent

Make existing artifacts (brainstorms, plans, implementations) discoverable across sessions. Artifacts stored in `.void-grimoire/history/<initiative>/` grouped by initiative. Value: context recovery after `/compact`, prevents re-litigating rejected approaches.

### Design

See `docs/specs/2026-03-15-centralized-config-and-features-design.md`

---

## FR-004: Centralized Project Config (`.void-grimoire/`)

**Status:** Approved
**Priority:** High
**Date:** 2026-03-15

### Intent

Unified per-project directory for all plugin state: config, rules, decision history, service map. Replaces scattered locations (root `rules/`, root `.service-map.json`, `docs/specs/`, CLAUDE.md HTML comments). Initialized via `claude:init` skill. Loaded in Gate 1.

### Design

See `docs/specs/2026-03-15-centralized-config-and-features-design.md`
