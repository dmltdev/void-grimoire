# Strategic Compact Improvements

## Problem

`strategic-compact` is useful, but it currently describes a `suggest-compact.js` hook that this plugin does not ship.

## Direction

Keep the skill for now, but fix it before treating it as polished v3 behavior.

## Candidate fixes

- Add the missing `suggest-compact.js` hook if hook-based compaction advice remains part of the skill.
- Make the skill suggest `session-summary` before compacting so the handoff artifact survives the next session.
- Consider merging the behavior into `session-summary` later: when context reaches a threshold, e.g. 50%, suggest writing a session summary before `/compact`.
- Avoid adding broad docs or extra state. Less docs are easier to maintain.
