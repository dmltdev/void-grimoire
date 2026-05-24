# The Grimoire of the Void

> *A spellbook born from nothingness, that fills itself with the wisdom of its wielder.*

In the fantasy world of dragons, magic, and swords, a **Grimoire of the Void** is no ordinary spellbook. It draws power from *absence* — its pages are blank until the mage's experience fills them. The wielder chooses which spells to invoke.

This plugin works the same way.

## The Parallels

| Fantasy | Plugin |
|---|---|
| **Learns from its wielder** — pages fill themselves based on the mage's experiences and mistakes | `learn-correction` — persists user corrections to project AGENTS.md / CLAUDE.md |
| Organizes spells into **schools of magic** (necromancy, illusion, conjuration...) | 6 domains: void-grimoire, workflow, docs, codebase, git, npm |
| Spells have **prerequisites and chains** — you must know Fireball before Meteor | `depends-on`, `chains-to`, `suggests` — skill composition model |
| Contains **wards and protections** against forbidden acts | `enforce-git-safety`, `enforce-release-safety` — guardrails against destructive actions |
| The mage **chooses which spell to cast** rather than the book casting on its own | Skills load on demand via the `Skill` tool — no startup ritual, no auto-injection |

## Why "Void"?

A void grimoire is specifically one that draws power from *absence*. Its strength is not in what it contains, but in what it leaves to the wielder's judgement.

The agent's learned corrections are the ink that fills the pages. The skill registry is the table of contents that grows with each school of magic the mage masters.

The void is where the agent starts. The grimoire is what makes it wise.
