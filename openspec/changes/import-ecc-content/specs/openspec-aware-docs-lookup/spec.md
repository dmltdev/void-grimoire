## ADDED Requirements

### Requirement: `lookup-docs` recognises accepted openspec specs

The `lookup-docs` skill SHALL treat `./openspec/specs/**/*.md` as a first-class documentation source in addition to its existing sources (qmd index, `./docs/**`, project README).

When openspec specs are present, `lookup-docs` MUST surface matching spec content in its results with provenance labelled as `openspec:specs/<capability>`.

#### Scenario: Accepted spec content surfaces in lookup
- **WHEN** `./openspec/specs/<capability>/spec.md` exists in the project
- **AND** a user invokes `lookup-docs` with a query matching content in that spec
- **THEN** `lookup-docs` returns the matching spec content
- **AND** the result is labelled with provenance `openspec:specs/<capability>`

#### Scenario: Absence of openspec is non-fatal
- **WHEN** no `./openspec/` directory exists in the project
- **AND** a user invokes `lookup-docs`
- **THEN** `lookup-docs` runs successfully against its other sources
- **AND** does not warn or error about missing openspec content

### Requirement: `lookup-docs` excludes in-flight changes by default

The `lookup-docs` skill SHALL NOT scan `./openspec/changes/**/*.md` as part of its default lookup. In-flight proposal/design/tasks artifacts MUST be excluded unless the caller explicitly passes a change name to scope to.

#### Scenario: In-flight changes are not in default results
- **WHEN** `./openspec/changes/<name>/proposal.md` contains text matching a `lookup-docs` query
- **AND** the caller did NOT pass an explicit change-name parameter
- **THEN** the matching proposal content is NOT returned

#### Scenario: Explicit change scope opts in
- **WHEN** the caller passes a change name parameter
- **AND** `./openspec/changes/<name>/` contains matching content
- **THEN** the matching content is returned and labelled `openspec:changes/<name>`

### Requirement: qmd integration when available

When the project has qmd configured with an `openspec` or `specs` collection, `lookup-docs` SHALL prefer routing openspec-specs queries through qmd over raw filesystem glob.

#### Scenario: qmd collection routes openspec queries
- **WHEN** qmd is available and exposes a collection covering `./openspec/specs/`
- **AND** a user invokes `lookup-docs` with a query
- **THEN** `lookup-docs` issues the query against the qmd collection
- **AND** does not fall back to raw glob unless qmd returns zero results

### Requirement: Documentation of the new source

The `lookup-docs/SKILL.md` body SHALL document `./openspec/specs/` as a recognised source and explicitly note that `./openspec/changes/` is excluded by default.

#### Scenario: SKILL.md mentions openspec
- **WHEN** a developer reads `void-grimoire/skills/lookup-docs/SKILL.md`
- **THEN** the body mentions `./openspec/specs/` as a scanned source
- **AND** mentions that `./openspec/changes/` is excluded by default
