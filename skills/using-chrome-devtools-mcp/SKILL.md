---
name: using-chrome-devtools-mcp
domain: tools
description: Use when test-with-browser routes to the chrome-devtools MCP server (agent-browser unavailable), or when the user explicitly asks for DevTools-grade inspection — performance traces, heap snapshots, deep network/console diagnostics. Skip when agent-browser suffices for the verification.
depends-on: []
chains-to: null
suggests: []
---

# using-chrome-devtools-mcp

The chrome-devtools MCP server exposes Chrome's DevTools protocol as MCP tools. It is the second tier in `test-with-browser`'s cascade: reach for it when agent-browser is unavailable, or when the verification needs DevTools-grade signals that agent-browser does not surface.

## Preflight

Check whether the MCP tool family is loaded in this session. The tools share the prefix:

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__*
```

If they are not in the available-tools list, the MCP server is not connected. Tell the user to enable it via their plugin/MCP configuration and stop. Do not silently fall back.

## Tool surface (high-value families)

Verify exact names in the session's tool list — they may evolve.

- **Navigation** — `navigate_page`, `new_page`, `close_page`, `list_pages`, `select_page`.
- **Interaction** — `click`, `fill`, `fill_form`, `hover`, `drag`, `press_key`, `type_text`, `upload_file`.
- **Inspection** — `take_snapshot` (accessibility tree), `take_screenshot`, `evaluate_script`.
- **Console** — `list_console_messages`, `get_console_message`.
- **Network** — `list_network_requests`, `get_network_request`.
- **Performance** — `performance_start_trace`, `performance_stop_trace`, `performance_analyze_insight`, `lighthouse_audit`.
- **Memory** — `take_heapsnapshot`.
- **Emulation** — `emulate`, `resize_page`.
- **Dialogs** — `handle_dialog`, `wait_for`.

## When to pick chrome-devtools-mcp over agent-browser

- Performance regression: needs a trace or Lighthouse audit.
- Memory leak: needs a heap snapshot.
- Network-level debugging: needs request bodies, timing, status correlation richer than agent-browser exposes.
- Deep console diagnostics with structured payloads.
- agent-browser is not installed and the user has chrome-devtools-mcp ready.

## Usage pattern in test-with-browser

1. `new_page` → `navigate_page` to the target URL.
2. `take_snapshot` to find interactive refs (a11y tree).
3. Drive the flow via `click` / `fill` / `press_key`.
4. Capture evidence: `take_screenshot` → `.claude/test-results/<task-slug>/step-N.png`.
5. If diagnosing: `list_console_messages`, `list_network_requests`, or start a performance trace.
6. `close_page` when done.

## Hard rules

- Never echo cookies, auth headers, or full request bodies that contain secrets into the response.
- Redact PII in screenshots before embedding in the evidence report.
- Performance traces and heap snapshots can be large — save them under `.claude/test-results/<task-slug>/` rather than pasting raw output into chat.
- One tab per task unless the verification genuinely needs multi-tab state.
