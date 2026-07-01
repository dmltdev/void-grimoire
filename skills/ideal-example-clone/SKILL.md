---
name: ideal-example-clone
description: Implement new code by cloning the architecture, conventions, and quality bar from an existing ideal example instead of relying on broad markdown documentation. Use when the user provides requirements plus a reference module/component/test/library, asks to "clone", "copy", "do it like this", "use this as the ideal example", generate similar modules/components/tests, extract conventions from a polished implementation, create or refresh hashed convention docs for an exemplar, or reduce stale markdown by treating code as the source of truth.
---

# Ideal Example Clone

Use code as the primary documentation. Require two inputs before implementation:

1. Requirements: feature file, ticket, acceptance criteria, design, or explicit user request.
2. Ideal example: existing module, component, test, package, or library to mirror.

If either input is missing, ask for the missing one. Do not infer a reference example from vibes.

## Workflow

1. Read requirements fully.
2. Read the ideal example at the same granularity as the requested output:
   - single component -> component + tests + local exports
   - module/feature -> module entrypoints, domain/core, adapters/integration, UI/API, tests
   - package/library -> package config, public API, build/test setup, one representative implementation
3. Find local convention docs only if colocated with the example (`AGENTS.md`, `docs/`, `requirements/`, or similar).
4. Treat docs as secondary. If docs conflict with code, pause and report the conflict.
5. Extract conventions before editing:
   - architecture boundaries and dependency direction
   - folder/file naming
   - public API shape
   - types and invariants
   - state/error/loading patterns
   - test structure and scenario naming
   - styling/accessibility conventions for UI
   - build/export/config conventions for packages
6. Implement the new target with the same conventions and no compatibility shim unless requirements demand it.
7. Verify behavior against requirements, not just compilation.
8. If the ideal example has hashed convention docs, refresh the hash only after implementation and verification.

## Hashing convention docs

Use `scripts/hash_reference.py` to hash an ideal example snapshot.

```bash
python skill://ideal-example-clone/scripts/hash_reference.py <example-path>
```

To update markdown frontmatter with the current snapshot hash:

```bash
python skill://ideal-example-clone/scripts/hash_reference.py <example-path> --update-doc <example-path>/AGENTS.md --version 1.0
```

Hash only implementation files that define the example. Exclude generated output, lockfiles, build artifacts, screenshots, and dependency folders unless the requirement says they are part of the contract.

## Output contract

Report:

- requirements source
- ideal example source
- conventions cloned
- files changed
- verification command and observed result
- doc hash updated or intentionally unchanged

## Guardrails

- Do not create broad architecture docs for every module.
- Do not copy code blindly; copy conventions and adapt names, domain terms, and behavior.
- Do not read every reference file by default. Read secondary docs only when the code or requirements leave a real ambiguity.
- Do not accept an outdated hash silently. Recompute it and report mismatch.
- Do not call the result done until the new code works against the stated acceptance criteria.
