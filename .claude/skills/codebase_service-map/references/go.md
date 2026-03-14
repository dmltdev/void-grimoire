# Go Service Discovery Reference

Load this reference when the project root contains `go.work` or when multiple `go.mod` files exist within the first two directory levels.

## Service Enumeration

1. **If `go.work` exists:** Parse `use` directives to find module directories. Each `use ./path` points to a directory containing a `go.mod`.
2. **If no `go.work`:** Scan for `go.mod` files in the project root and one level of subdirectories (e.g., `*/go.mod`). Do not scan deeper than two levels.
3. For each found `go.mod`, extract:
   - `module` directive → service name (use the last path segment as short name, e.g., `github.com/org/repo/auth` → `auth`)
   - Full module path → stored for dependency matching
   - Directory path (relative to project root) → service path
   - `language: "go"`

**If only a single `go.mod` at root and no `go.work`:** This is a single-service project. Return empty list — no service map needed.

## Dependency Detection

For each discovered module:

1. **`require` directives:** Check if any required module path matches (or is a prefix of) another discovered module's full module path. Each match is a `dependsOn` edge.
2. **`replace` directives:** Check for `replace` directives pointing to local paths (`=> ./relative/path`). If the target path is another discovered module's directory, that is a `dependsOn` edge.

## Output

For each service, produce:
```json
{
  "name": "<short module name>",
  "path": "<relative directory>",
  "language": "go",
  "dependsOn": ["<names of other modules this depends on>"]
}
```

After all services are enumerated, compute `dependedOnBy` by inverting `dependsOn` edges.

## Error Handling

- If a `go.mod` is malformed, skip it with a warning: "Skipping `<path>/go.mod`: could not parse module directive." Continue with remaining modules.
- If a `go.work` `use` directive points to a directory without `go.mod`, skip silently.
