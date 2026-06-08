# Slop Mapping

Use this frame when the system produces plausible but unusable work.

## Model

Input space is huge. Output space is larger. The useful target is tiny:

- works end-to-end
- matches user intent
- preserves context across phases
- survives adversarial verification
- avoids security, data-loss, and silent-failure traps
- leaves maintainable artifacts

Everything outside that subset is slop, even if it compiles or sounds good.

## Slop vectors

- **Fake pass**: verifier checks a narrow command that does not cover the claim.
- **Context loss**: session forgets decisions, constraints, or file state.
- **Scope substitution**: solves an easier problem than the user asked.
- **Prompt rot**: workers receive incomplete prompts and invent missing contracts.
- **Verifier softness**: reviewer gives opinions instead of falsifying claims.
- **Artifact drift**: implementation, tests, docs, and handoff disagree.
- **Security blind spot**: output works only by weakening auth, validation, or isolation.

## Tuning loop

1. Name the slop vector.
2. Convert it into a falsifiable criterion.
3. Add evidence required to prove or disprove it.
4. Put the criterion into the next verifier prompt.
5. Put the verifier finding into the next master or continuity prompt.

Do not fix slop by adding generic process. Fix the specific validator gap that let it through.
