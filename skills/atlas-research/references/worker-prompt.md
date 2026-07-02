# Worker prompt template

Use one worker per repo/path. Workers are read-only and do not run builds, tests, formatters, or project-wide commands.

```md
# Target
Repo/path: <exact path>
Non-goals: no edits, no generated docs, no private helpers, no exhaustive crawl.

# Change
Inventory this repo for Atlas research:
1. Existing docs and source-of-truth files.
2. Repo purpose and likely Atlas layer.
3. Apps/packages and entrypoints.
4. Public surfaces only: routes, exports, CLI, jobs, queues/events/webhooks, owned schemas, integration env/config keys.
5. Upstream dependencies and downstream consumers if evidenced.
6. Local domain terms or contexts that may need repo-local docs.
7. Conflicts between README/docs/code/tests.
8. Open questions and missing ownership/status.

# Evidence
Every non-obvious claim needs an anchor: repo-relative path plus symbol/line range when available. Unknown stays Unknown. Do not infer owners, lifecycle, or intent.

# Acceptance
Return:
- Purpose
- Layer
- Apps/packages table
- Public surfaces table
- Dependencies/consumers
- Local docs found/missing
- Conflicts
- Open questions
No commands beyond targeted read/search/find. No verification gates.
```
