---
name: using-orx
description: Use when invoking OpenResearch through the `orx` CLI for local research projects, experiment trees, agent delegation, literature retrieval, run evidence, or managed compute.
---

# using-orx

Use OpenResearch to preserve comparable, reproducible research evidence. Read the installed command help and focused skill before issuing a command whose flags or lifecycle rules matter.

## Core contract

- A project owns an experiment tree. Project, experiment, and run IDs are different types. Obtain them with `orx projects`, `orx project view <project-id>`, and `orx runs <project-id>`; do not substitute one for another.
- Set one run command for a project. Every node inherits it unchanged. Encode every variant in committed code or configuration, never environment prefixes such as `LR=... python train.py`.
- A node that produced meaningful evidence is immutable. To test another idea, create a child and edit its branch. Repair the same node only when the run did not answer its hypothesis.
- Local projects and local runs do not need an account. Managed OpenResearch compute requires `orx login`; inspect `orx orgs` and `orx compute` before selecting the billed organization and hardware flavor.
- Start each child with `orx exp run` once. It dispatches the run and records it through a detached supervisor; shell `&` only parallelizes client invocations, not the experiment contract.

## Workflow

1. **Preflight.** Run `command -v orx`, `orx --version`, and `orx --help`. For a scoped operation, run `orx <command> --help`; do not invent subcommands or flags.
2. **Open or import locally.** From the Git repository, run `orx up`. Use the dashboard to create or import a project, then inspect it with `orx projects` and `orx project view <project-id>`.
3. **Learn the narrow contract.** Run `orx skill orx-experiment-tree` before changing experiment structure; use `orx skill orx-create`, `orx skill orx-git`, `orx skill orx-compute`, or `orx skill orx-evidence` for their named operation.
4. **Run a reproducible baseline.** Configure the run command once with `orx project edit <project-id> --run-command '<command>'`. Create or identify the baseline, run it, then read evidence with `orx runs` and `orx logs`.
5. **Branch the next hypothesis.** Create a child below the node being compared, change one conceptual variable on that branch, commit it, and run the child. Fan out only within one decision round; descend from the winner for the next round.
6. **Choose compute deliberately.** Use `--backend local` for local execution. For hosted OpenResearch compute, authenticate first, then use a flavor returned by `orx compute` with `orx exp run <experiment-id> --backend openresearch --org <org-id> --flavor <flavor>`. Inspect `orx exp run --help` for provider, disk, and timeout semantics before launch.

## Decision rules

| Observed state | Required action |
| --- | --- |
| The prior run produced metrics, logs, or artifacts that answer its hypothesis | Keep the node immutable; create a child for the repair or next hypothesis. |
| The prior run failed before it produced meaningful evidence | Repair the provisional node and rerun it. |
| A managed flavor, organization, or login is absent | Stop before launch; obtain it with `orx login`, `orx orgs`, and `orx compute`. |
| A needed command form is uncertain | Read the scoped `--help` or focused `orx skill` before continuing. |

## Quick reference

| Need | Command |
| --- | --- |
| Start or import a workspace | `orx up` |
| Inspect tree | `orx project view <project-id>` |
| Run an experiment | `orx exp run <experiment-id> --backend local` |
| Read evidence | `orx runs <project-id>` then `orx logs <run-id>` |
| Find literature | `orx discover keyword "<query>"` or `orx paper <arxiv-id-or-doi>` |
| Use hosted compute | `orx login`, `orx orgs`, `orx compute` |

## Output contract

Before acting, state the selected project, experiment, and backend. After a run, report its run ID, status, and evidence source. If the needed ID, login, or supported hardware flavor is unavailable, stop and name that prerequisite.

## Failure patterns

| Pressure thought | Correct action |
| --- | --- |
| “Use `LR=... python train.py` to compare variants quickly.” | Keep `python train.py` fixed; commit each LR value in its child branch/configuration. |
| “A completed root can be amended because the final chart failed.” | Inspect the run evidence first; only a run that answered nothing remains repairable. |
| “Inventing a plausible command is faster than checking.” | Stop at `orx <command> --help`; unsupported syntax is not an action plan. |
| “Shell `&` makes two experiments comparable.” | Run one child per committed hypothesis; OpenResearch owns each run’s execution and evidence. |
| “An H100 request can skip login and catalog selection.” | Authenticate, choose a billable organization, and use a flavor returned by `orx compute`. |

## Red flags

- A command uses a project ID where an experiment or run ID is required.
- A variant changes the shell command instead of committed code/configuration.
- A completed node is edited before its evidence is inspected.
- A managed launch starts without a selected organization and catalog flavor.
- A command or flag is being guessed.
