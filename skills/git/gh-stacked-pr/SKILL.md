---
name: gh-stacked-pr
description: Use when the user explicitly asks to create a stacked PR or a stack of GitHub pull requests.
---

# GitHub Stacked PRs

Create a chain of PRs where each PR reviews only its own layer.

## When to use

Only after an explicit request to create stacked PRs.
The common workflow may suggest stacking, but does not invoke
this skill automatically.

## Workflow

1. Identify the repository, root base branch, and layer order.
   Reuse existing branches and PRs where appropriate.
2. Ensure the layer branches are published. If publishing is
   needed, obtain push authorization rather than pushing implicitly.
3. Use `gh-workflow` for GitHub operations and `git-pr` for titles
   and bodies. Create missing PRs bottom-to-top:
   - First PR targets the root base.
   - Each subsequent PR targets the preceding layer's branch.
4. Add links to the other PRs in each body, showing stack order
   and dependencies.

## Result

Return the PR links in stack order, with each source and base branch.
State the bottom-to-top merge order; do not merge automatically.

Creating a stack does not authorize commits, history rewrites,
force pushes, or branch deletion.
