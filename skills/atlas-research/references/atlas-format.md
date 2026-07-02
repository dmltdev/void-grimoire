# Atlas format

## Repo page

```md
# <Repo name>

Last verified: YYYY-MM-DD

## Purpose
One paragraph. What this repo owns.

## Role in Atlas
- Layer: UI | BFF | API | shared lib | worker | docs | other
- Upstream dependencies:
- Downstream consumers:
- Ownership: Unknown unless evidenced
- Lifecycle: Unknown unless evidenced

## Apps and packages
<!-- atlas:generated:start apps-packages -->
| Name | Type | Entry point | Source |
|---|---|---|---|
<!-- atlas:generated:end apps-packages -->

## Public surfaces
<!-- atlas:generated:start public-surfaces -->
| Surface | Kind | Path/export/job | Source |
|---|---|---|---|
<!-- atlas:generated:end public-surfaces -->

## Cross-repo flows
Links to `docs/atlas/flows/*.md`.

## Local docs
Links to repo-local docs, or `Missing`.

## Open questions
Unverified claims only.
```

## Flow page

```md
# <Flow name>

Last verified: YYYY-MM-DD

## Scenario
One concrete user/runtime scenario.

## Flow
1. `<repo>`: action/event/request. Source: `<anchor>`
2. `<repo>`: handler/contract. Source: `<anchor>`
3. `<repo>`: data/external effect. Source: `<anchor>`

## Surfaces involved
| Step | Repo | Surface | Source |
|---|---|---|---|

## Contracts
Links to schemas/types/routes. Do not restate contract fields in prose.

## Open questions
Unverified claims only.
```

## Research note

Use when findings are exploratory, conflict-heavy, or too implementation-detailed for source-of-truth docs.

```md
# <YYYY-MM-DD topic>

## Scope
Repos/paths inspected.

## Findings
| Claim | Evidence | Confidence |
|---|---|---|

## Conflicts
| Claim | Source A | Source B | Needed decision |
|---|---|---|---|

## Candidate glossary terms
| Term | Evidence | Question |
|---|---|---|

## Next trace
Recommended next flow/domain.
```
