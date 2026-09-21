---
name: enforce-release-safety
description: Use when running npm or yarn releases, publishing packages, creating release canaries, or handling requests to skip release checks or tests.
depends-on: []
chains-to: null
suggests: []
---

# release safety

rules for running package releases.

## rules

- NEVER add `--skip-checks` unless user explicitly says "skip checks"
- NEVER add `--skip-tests` unless user explicitly says "skip tests"
- if checks or tests fail, FIX THE ISSUES instead of skipping
- ask user before adding any skip flags
- the point of checks is to catch problems before publishing

## when things fail

1. read the error output carefully
2. fix the underlying issue
3. re-run the release
4. do NOT just skip the failing step

## common flags

safe flags:
- `--canary` - publish canary version
- `--ci` - run in ci mode
- `--dirty` - allow dirty working directory
- `--build-fast` - faster builds

dangerous flags (require explicit permission):
- `--skip-checks` - skips type checking
- `--skip-tests` - skips test suite
- `--skip-build` - skips building packages
