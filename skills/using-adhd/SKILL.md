---
name: using-adhd
domain: tools
description: Use when invoking the external `adhd` CLI (UditAkhourii/adhd) for parallel divergent brainstorming — N isolated frames, generator/critic split, pruning to top survivors. Covers install check, flag surface (`--frames`, `--ideas`, `--top`), and fallbacks when adhd is unavailable (suggest local brainstorming/research skills, not silent substitution).
depends-on: []
chains-to: null
suggests: []
---

# using-adhd

`adhd` is an external CLI / skill (https://github.com/UditAkhourii/adhd) that fans out N divergent reasoning branches under structurally different cognitive frames, then converges via a separate critic pass. Same conceptual shape as the locally available `adhd` / `brainstorming` skill, but as a standalone tool you can dispatch into a herdr pane.

## Preflight

```bash
command -v adhd >/dev/null && adhd --help 2>&1 | head -20
adhd --version 2>/dev/null
```

If `adhd` is missing, do **not** silently substitute. Tell the user explicitly and offer:

1. Install via:
   ```bash
   npx skills add UditAkhourii/adhd
   # or
   npm install -g adhd-agent
   ```
2. Use a locally available alternative — check loaded skills for one of: `brainstorming`, `adhd` (local), `superpowers:brainstorming`, or any `research`/`analysis` skill in the current session. Name the candidates back to the user; let them pick.
3. Skip divergent thinking and proceed straight to convergent execution (risky — premature convergence is exactly what adhd guards against).

## Invocation

```bash
adhd "design a rate limiter that survives a leader election"
adhd "name this function" --frames 3 --ideas 8 --top 2
```

Common flags (verify against current `adhd --help`):

- `--frames N` — number of structurally different cognitive frames to fan out under.
- `--ideas N` — ideas generated per frame.
- `--top N` — how many survivors to deepen after pruning.

## When to use adhd (vs other tools)

- **adhd**: open-ended brainstorming, API/architecture options, naming, fuzzy-bug hypothesis classes, "give me N ways to". Anything where premature convergence is the failure mode.
- **omp / codex / claude**: convergent execution. Implementing, fixing, refactoring. Do not use these for divergent ideation.
- **Hybrid**: run adhd first, take the top survivor's direction as a constraint, pass it into omp/codex workers for execution.

## Dispatch inside a herdr pane

```bash
herdr pane run "$NEW_PANE" "adhd \"<question>\" --frames 5 --ideas 6 --top 2"
herdr wait agent-status "$NEW_PANE" --status done --timeout 180000
herdr pane read "$NEW_PANE" --source recent --lines 200
```

Treat the pane's final output as input to the next phase. Do not let an omp/codex worker run in parallel against the same question — that defeats the generator/critic separation.

## Notes

- adhd's value is the *isolation* of branches and the *separation* of generator and critic. Do not collapse it into a single linear prompt.
- The local `adhd` / `brainstorming` skill is functionally equivalent for in-process use. Prefer the CLI when you need it as a separate pane in a CHAOS dispatch; prefer the local skill when you are reasoning inline.
