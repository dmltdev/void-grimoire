# JS/TS Service Discovery Reference

Load this reference when the project root contains `package.json` with a `workspaces` field, a `pnpm-workspace.yaml`, or a `lerna.json`.

## Service Enumeration

1. Check for workspace config (in priority order):
   - `pnpm-workspace.yaml` → read `packages:` array of globs
   - Root `package.json` → read `workspaces` field (array of globs)
   - `lerna.json` → read `packages` field (array of globs)
2. Glob-expand each pattern to find directories containing `package.json`
3. For each found `package.json`, extract:
   - `name` field → service name
   - Directory path (relative to project root) → service path
   - `language: "typescript"` (or `"javascript"` if no `tsconfig.json` in that directory)

**If no workspace config exists and only a single `package.json` at root:** This is a single-service project. Return empty list — no service map needed.

## Dependency Detection

For each discovered service, check its `package.json`:

1. **Workspace cross-references:** Scan `dependencies`, `devDependencies`, and `peerDependencies` for keys that match another discovered service's `name`. Each match is a `dependsOn` edge.
2. **TSConfig path aliases:** If `tsconfig.json` exists, check `compilerOptions.paths` for aliases pointing to sibling package directories (e.g., `"@org/shared": ["../shared-types/src"]`). Each match is a `dependsOn` edge.

## Output

For each service, produce:
```json
{
  "name": "<package.json name>",
  "path": "<relative directory>",
  "language": "typescript",
  "dependsOn": ["<names of other workspace packages this depends on>"]
}
```

After all services are enumerated, compute `dependedOnBy` by inverting `dependsOn` edges: for each service A that appears in another service B's `dependsOn`, add B to A's `dependedOnBy`.

## Error Handling

- If a `package.json` is malformed (invalid JSON), skip it with a warning: "Skipping `<path>/package.json`: malformed JSON." Continue with remaining services.
- If a workspace glob matches a directory with no `package.json`, skip silently.
