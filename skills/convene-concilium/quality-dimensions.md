# Quality Dimensions — shared review criteria

Single source of truth for the concilium reviewer agents (`dev-in-test`, `dev-in-security`, `dev-in-maintainability`, `dev-in-scalability`), the `convene-concilium` dispatcher, and the `verify-and-correct` cycle. Agents cite this file; they do not redefine criteria inline.

## Severity tiers

| Tier | Meaning | Effect |
|------|---------|--------|
| **CRITICAL** | Correctness defect, security vulnerability, or data loss. Will cause real damage. | **Blocking.** Change is not-ready. |
| **WARN** | Real issue worth fixing, but not damaging on its own. | Advisory. Does not block shipping. |
| **FYI** | Minor / optional / informational. | Advisory. Never block. |

Only CRITICAL blocks. WARN and FYI are advice, never gates. Never present a WARN or FYI as a reason to halt.

## Confidence gate

Report a finding only when you are **>80% confident it is a real issue**. Below that, drop it. A clean review with zero findings is a valid, expected outcome — do not manufacture findings to justify the invocation.

## Pre-report gate

Before writing any finding, answer all four. If any answer is "no" or "unsure", downgrade severity or drop it.

1. **Can I cite the exact file and line?** Vague findings ("somewhere in auth") are not actionable. Drop them.
2. **Can I name the concrete failure mode?** State the input, state, and bad outcome. No trigger named => you are pattern-matching, not reviewing.
3. **Have I read the surrounding context?** Check callers, imports, tests. Many issues are already handled one frame up or guarded by a type.
4. **Is the severity defensible?** A missing JSDoc is never CRITICAL. A single `any` in a test fixture is never CRITICAL. Severity inflation erodes trust faster than a missed finding.

CRITICAL findings MUST include: exact snippet + line, the specific failure scenario (input/state/outcome), and why existing guards (types, validation, framework defaults) do not catch it. If you cannot produce all three, demote or drop.

## Consolidation and skip rules

- **Consolidate** the same issue class across many locations into one entry listing the locations — not N separate findings.
- **Skip** purely stylistic preferences unless they violate a stated project convention (AGENTS.md / CLAUDE.md / lint config).
- **Skip** issues in unchanged code unless they are CRITICAL security.

### Common false positives — skip unless you have codebase-specific evidence

- "Add error handling" on a path already handled by the caller/framework (Express error middleware, React error boundary, upstream `.catch`).
- "Missing input validation" on an internal function whose callers already validate — trace one caller first.
- "Magic number" for well-known constants (HTTP codes, `1024`, `60`, `0`/`-1`, obvious single-use locals).
- "Function too long" for exhaustive switches, config objects, or test tables. Length is not complexity.
- "Missing JSDoc" on self-describing internal helpers.
- "Possible null deref" when a guard or type-narrow is in scope — trace type flow.
- "N+1 query" on fixed-cardinality loops or batched/DataLoader paths.
- "Missing await" on intentionally detached calls (logging, metrics, `void`-prefixed).
- "Should use types" in a JS-only file. Match the project's stack; do not suggest a rewrite.
- Security theater: `Math.random()` for animation/jitter, `eval` in an explicit code-loading surface, SHA/MD5 used for checksums not passwords.

Test before flagging: "Would a senior engineer on this team actually change this in review?" If no, skip.

## Blocking-vs-advisory rule

- Report contains a CRITICAL => verdict **NOT READY**, name the blocking finding(s).
- Report contains only WARN/FYI => verdict **SHIPPABLE with advisory notes**. Do not instruct a halt.
- Report contains nothing above the confidence gate => verdict **APPROVE**, zero rows.

---

# Per-lens checklists

Each reviewer owns ONE lens. Stay in your lane; the dispatcher merges and dedupes across lenses.

## dev-in-test — correctness & tests

- Logic correctness: does the code do what the change intends? Off-by-one, wrong operator, inverted condition.
- Edge cases: empty / null / oversized / malformed input; boundary values; concurrent/repeated invocation.
- **Silent failures**: empty catch blocks, errors swallowed to `null`/`[]`, `.catch(() => [])`, log-and-forget, lost stack traces, missing async error handling, missing timeout/rollback on network/file/db/transactional paths.
- Test presence & quality: is the new behavior tested? Do tests assert outcomes, not just "no throw"? Are edge cases covered or only the happy path?
- Test integrity: tests that can't fail, snapshot-only tests of logic, over-mocking that tests the mock.

## dev-in-security — security

- **Secrets**: hardcoded API keys, passwords, tokens, connection strings. (Skip `.env.example`, clearly-marked test creds, intentionally-public keys.)
- **Injection**: string-concatenated SQL, shell commands with user input, unsafe deserialization. Require parameterized queries / safe APIs.
- **AuthZ/AuthN**: auth checked on every route? Object-level authorization (can user A read user B's record)? Passwords hashed (bcrypt/argon2)? JWT/session validated?
- **Unsafe sinks**: `innerHTML = userInput` (XSS), `fetch(userProvidedUrl)` (SSRF), open redirects.
- **Data exposure**: PII/secrets in logs, errors leaking internals, missing HTTPS/transport security.
- **Dependencies**: known CVEs (`npm audit`), risky new transitive deps.
- Sensitive surfaces to always inspect: auth, API endpoints, DB queries, file uploads, payments, webhooks.

## dev-in-maintainability — readability, types, docs, standards (folded lens)

This single lens covers what would otherwise be four agents (readability + maintainability + code-standards + type-design). Keep findings here unless they are genuinely a different lens.

- **Readability**: naming that reveals intent, control flow you can follow, no needless cleverness, reasonable function scope.
- **Type design**: do types make illegal states unrepresentable? Are invariants encoded and enforced, or are there easy escape hatches (`any`, unchecked casts)? Is internal state encapsulated?
- **Documentation**: is non-obvious *why* explained (not narrating the *what*)? Public API documented? Stale comments removed?
- **Code-standards**: matches project conventions (AGENTS.md / CLAUDE.md / lint / existing patterns). Consistency with the surrounding code beats personal preference.

## dev-in-scalability — performance & scaling

- **Hot paths**: unnecessary work in loops/render/request paths; repeated computation that could be hoisted or memoized.
- **Data access**: N+1 queries (real ones, not fixed-cardinality), missing indexes implied by query shape, unbounded result sets, missing pagination.
- **Resource & cost**: unbounded memory growth, leaks (listeners/timers not cleaned up), connections/handles not released, payload size.
- **Concurrency & scaling**: shared-state races, lock contention, work that won't scale past one node, missing backpressure on queues/streams.
- Flag only with a concrete trigger (input size, call frequency, data volume) — not speculative "this might be slow."
