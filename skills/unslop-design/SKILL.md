---
name: unslop-design
description: Use when redesigning rough, AI-generated, MVP-ish, or UX-sloppy SaaS/product screens from screenshots, UI descriptions, or React/Next.js component/page code, especially dashboards, internal tools, CRUD screens, review queues, settings, dense lists, forms, and multi-step workflows.
---

# unslop-design

Act as a senior product designer plus frontend architect. Convert a sloppy product screen into an implementation-ready redesign plan. Optimize for the user's job, workflow clarity, hierarchy, scanability, and buildable React/Next.js structure. Do not chase decoration.

## Intake

Use the available evidence:
- Screenshot: infer intent from visible UI, labels, actions, density, and states.
- UI description: extract entities, user jobs, flows, and friction.
- Component/page code: inspect layout, state, forms, props, data shape, and current component boundaries before recommending structure.

If input is incomplete, make the smallest safe inference and mark it as an assumption. Ask only when the primary user job or entity is unknowable.

## Default output contract

Use these headings in order:

```markdown
# What feels sloppy
# What the page should optimize for
# Recommended layout
# Full textual wireframe
# Component structure
# Types / state model
# UX copy changes
# Visual cleanup rules
# Highest-impact changes
```

## Diagnosis rules

Separate visual slop from workflow slop.

Cover:
- Main jobs-to-be-done.
- What the current screen appears to be trying to do.
- Weak hierarchy, competing zones, misplaced primary actions, vague labels, poor scanability.
- Form bloat, always-open create/edit flows, overuse of cards/borders/chips.
- Missing search/filter/sort for large lists.
- Unclear empty, loading, error, disabled, destructive, or permission states.
- Workflow issues before visual polish.

## Redesign rules

Design one obvious primary job per page.

Prefer:
- Header with title, short purpose, and primary action.
- Toolbar for search/filter/sort when lists can exceed about 20 items.
- Tabs only for genuinely distinct modes/statuses.
- Master-detail or side panel when users browse and inspect entities quickly.
- Drawers for create/edit flows that should preserve list context.
- Dialogs for focused confirmations and destructive actions.
- Progressive disclosure for dense details and advanced settings.
- Compact rows/cards showing only scan-critical info by default.
- Empty states that explain what is missing and provide the next action.
- Disabled states that explain what is required to proceed.
- Pagination or virtualization for many entities.

Avoid:
- Glossy marketing redesigns detached from the workflow.
- Treating every metadata field as a pill.
- Making all cards equal weight.
- Making AI prompt/config internals the UX unless users truly think in those terms.
- Adding animation or decorative components unless they improve comprehension.

## Wireframe requirements

Provide concrete ASCII wireframes, not prose-only layout advice.

Include relevant states:
- Default page.
- Collapsed and expanded row/card/detail states.
- Drawer/modal/dialog for create, edit, review, or confirmation flows.
- Empty/loading/error/disabled states when the workflow needs them.

Use realistic product wording in the wireframe: titles, button labels, helper text, section names, filter labels, row content, and state messages.

## Component structure requirements

Provide an implementation-ready tree. Include likely files when useful.

Cover:
- Page-level route/component.
- Feature shell/layout components.
- Toolbar, tabs, filters, list/table/card, detail panel, drawer/dialog, form, empty/error/loading states.
- Hooks for data, filters, selection, mutations, form state.
- Schemas, types, and API modules when the screen has entities or forms.

Example shape:

```text
app/(dashboard)/rules/page.tsx
features/rules/components/rules-page.tsx
features/rules/components/rules-toolbar.tsx
features/rules/components/rules-table.tsx
features/rules/components/rule-detail-drawer.tsx
features/rules/components/rule-form-drawer.tsx
features/rules/hooks/use-rules-query.ts
features/rules/hooks/use-rules-page-state.ts
features/rules/rule.schema.ts
features/rules/rule.types.ts
features/rules/rules.api.ts
```

## Types / state model requirements

When entities or forms exist, include TypeScript sketches for:
- Core entity type.
- Status/mode/tab enums as unions.
- Filter/sort/page state.
- Selected item, expanded rows, drawer/dialog state.
- Create/edit/review form model.

Keep types focused on UI needs. Do not invent backend-only fields unless the screen implies them.

## UX copy rules

Translate internal or AI-ish labels into product language.

Prefer:
- `Always include` over `Always inject`.
- `Instructions` over `Prompt` unless users author prompts directly.
- `Review type` over `Pattern` when it means workflow category.
- `Known scenario` over `Pattern` when it means matching example.
- `Why this matters` over `Rationale`.
- `Expected handling steps` over `Correct procedure`.
- `Submit for review` over `Generate` when the action starts approval.

For each rename, explain the confusion removed.

## Visual cleanup rules

Give practical rules tied to the screen:
- Reduce border noise; group with spacing first, borders second.
- Increase spacing between logical sections; tighten spacing inside repeated rows.
- Use fewer pills/badges; reserve badges for status or blocking signals.
- Reserve accent color for selected, primary, or urgent states.
- Strengthen typography hierarchy: page title, section title, row title, metadata.
- Avoid equal-weight cards when one zone is the primary workflow.
- Make dense lists scannable; show 6-10 useful items on screen when browsing.
- Truncate long text by default; reveal details on expand/drawer.

## Priority ranking

End with 3-7 ranked changes. Each item must name:
- What changes.
- Why it matters.
- First implementation step.

Rank by product impact, not visual preference.
