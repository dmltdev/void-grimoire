# The Grimoire of the Void

> *A spellbook born from nothingness, that fills itself with the wisdom of its wielder.*

In the fantasy world of dragons, magic, and swords, a **Grimoire of the Void** is no ordinary spellbook. It draws power from *absence* — its pages are blank until the mage's experience fills them. It enforces discipline by making the caster stop and think before acting. Wild magic awaits those who skip the ritual.

This plugin works the same way.

## The Parallels

| Fantasy | Plugin |
|---|---|
| Must be **consulted before casting** any spell — skipping it causes wild magic and backfire | Three-gate flow — the agent MUST check rules, docs, and routing before acting |
| **Learns from its wielder** — pages fill themselves based on the mage's experiences and mistakes | `claude:learn` — self-learning from user corrections, rules append themselves |
| Organizes spells into **schools of magic** (necromancy, illusion, conjuration...) | 7 domains: workflow, dev, git, design, docs, claude, npm |
| Spells have **prerequisites and chains** — you must know Fireball before Meteor | `depends-on`, `chains-to`, `suggests` — skill composition model |
| Starts as **blank pages from the void** — the book is empty until knowledge fills it | `rules/*.md` files start empty, accumulate learned rules over time |
| The grimoire **summons familiars** to do parallel work | Subagent dispatch via `workflow:subagent-dev` and `workflow:parallel-agents` |
| Contains **wards and protections** against forbidden acts | `git:safety`, `npm:release-safety` — guardrails against destructive actions |
| A **ritual of opening** must be performed each time the book is used | SessionStart hook injects `claude:using-void-grimoire` and the registry into the session |

## Why "Void"?

A void grimoire is specifically one that draws power from *absence*. Its strength is not in what it contains, but in what it *prevents* — reckless action without thought.

The three gates are the ritual. The blank rule files are the void. The agent's learned corrections are the ink that fills the pages. And the skill registry is the table of contents that grows with each school of magic the mage masters.

The void is where the agent starts. The grimoire is what makes it wise.
