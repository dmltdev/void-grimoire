# Void Grimoire Skills

This context defines the language for skills that guide documentation and agent workflow design.

## Language

**Atlas**:
A technical map of repositories, services, runtime flows, and public surfaces across one or more codebases.
_Avoid_: System map, repo map

**Atlas research**:
A skill-guided analysis workflow that builds verified Atlas docs and connects them to domain docs across one or more codebases.
_Avoid_: Codebase docs research, system documentation crawl

**Context map**:
A domain map of bounded contexts and their relationships.
_Avoid_: Atlas, system map

**Domain docs**:
Documentation that captures business meaning, invariants, and contracts for a bounded context.
_Avoid_: Atlas, repo inventory, implementation notes

**Markdown-readable diagram**:
A plain Markdown table, list, or indented flow that remains useful without rendering.
_Avoid_: Mermaid-by-default, image-only diagram

**MDX-compatible docs**:
Markdown-readable docs that may use `.mdx` only when the target docs workspace already renders MDX or the user asks for MDX.
_Avoid_: Custom component docs by default, MDX-only source-of-truth
