---
name: verify-and-correct
domain: concilium
description: Use when you need to prove a change actually works — runs an evidence-gated adversarial verifier, then one bounded fix round, then escalates. Catches incorrect work that passes ordinary review.
depends-on: [convene-concilium]
chains-to: null
suggests: []
user-invokable: true
args:
  - name: scope
    description: What to verify — a path/glob, "staged", or "worktree". Defaults to the staged diff.
    required: false
  - name: full
    description: Force the static concilium fan-out regardless of diff size. Default auto (size OR sensitivity).
    required: false
---

# Verify and Correct

Prove a change works by **running it**, not by judging it. This is the answer to "incorrect work that passes review": an LLM reading LLM-written code shares its blind spots, but a failing test it actually ran cannot be rationalized away.

**Announce at start:** "Verifying <scope> with evidence."

The cycle is **bounded**: verify => at most one fix round => re-verify once => PASS or escalate. It does **not** loop until green. If one round does not fix it, you stop and hand the evidence to the human.

## Step 1 — Gather evidence

Dispatch `adversarial-verifier` as a subagent (its own context, separate from whoever wrote the code). It runs tests/app/lint/typecheck, probes edge cases, and returns a PASS/BLOCKED verdict **with cited command output**.

Additionally fan out `convene-concilium` (the four static lenses) when the change warrants it:

- **Auto (default):** convene when the diff is large (**> ~40 changed lines or touches > 1 file**) OR touches **sensitive surface** (auth, input handling, payments, migrations) regardless of size.
- **Below that bar:** verifier only — a 3-line fix is covered by "tests pass, here's the output."
- `full` arg forces the fan-out. The threshold is a config knob: read `diffThreshold` / `sensitivePaths` from `.void-grimoire/config.json` if present, else use the defaults above.

## Step 2 — Verdict

Merge into one evidence-backed verdict using `skills/convene-concilium/quality-dimensions.md` for tiers + the >80% gate:

- **PASS** — full evidence, probes green, no blocking findings.
- **BLOCKED** — any CRITICAL finding, or evidence could not be gathered (never PASS without execution).

## Step 3 — One fix round (only if BLOCKED)

Address **every** blocking finding in a single round.

- **Default (interactive):** fix on the **main thread** so the operator sees the change land.
- **Autonomous only:** if `verify-and-correct` is running inside an autonomous/subagent pipeline with no human watching, run the fix in a **fresh subagent** for extra independence from the verifier.

## Step 4 — Re-verify once

Re-dispatch `adversarial-verifier` over the fixed change. Exactly once.

## Step 5 — Resolve

- Re-verification PASSes => report PASS with the final evidence.
- Still BLOCKED => **escalate to the human**: present the remaining findings and their evidence and stop. Do **not** start another fix round. The human decides whether to re-invoke.

## Why bounded

Unbounded "iterate until the rubric passes" hides non-convergence and burns tokens. One evidence-gated round catches the common case; persistent failure is a signal a human should see, not a loop to grind on. (The full autonomous loop is a deliberate future capability, not this skill.)
