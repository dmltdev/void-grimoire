---
name: claude:skill-builder
description: Guide for creating and managing Claude skills - modular packages that extend Claude's capabilities with specialized knowledge, workflows, and tools. Use when: (1) Creating a new skill from scratch, (2) Structuring skill components (SKILL.md, scripts/, references/, assets/), (3) Designing skill architecture with progressive disclosure, (4) Following skill creation workflow (understand, plan, initialize, edit, package, iterate), (5) Validating and packaging skills for distribution, (6) Understanding skill anatomy and core principles
---

# Skill Builder Guide

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing specialized knowledge, workflows, and tools.

### What Skills Provide

1. **Specialized workflows** - Multi-step procedures for specific domains
2. **Tool integrations** - Instructions for working with specific file formats or APIs
3. **Domain expertise** - Company-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts, references, and assets for complex tasks

## Core Principles

### Concise is Key

The context window is a public good. Default assumption: Claude is already very smart. Only add context Claude doesn't already have.

### Set Appropriate Degrees of Freedom

Match specificity to task fragility:
- **High freedom** (text-based): Multiple valid approaches, context-dependent decisions
- **Medium freedom** (pseudocode/scripts with parameters): Preferred pattern exists, some variation acceptable
- **Low freedom** (specific scripts, few parameters): Fragile operations, consistency critical

## Anatomy of a Skill

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter: name, description
│   └── Markdown instructions
├── scripts/ (optional) - Executable code
├── references/ (optional) - Documentation for context
└── assets/ (optional) - Files for output (templates, images)
```

### SKILL.md

**Frontmatter** (always loaded ~100 words):
- `name`: Skill name
- `description`: When to use this skill - triggers/context

**Body** (loaded when skill triggers, <5k words): Instructions and guidance

### Bundled Resources

**scripts/**: Executable code for deterministic reliability or repetitive tasks. When same code is repeatedly rewritten or deterministic reliability needed.

**references/**: Documentation loaded as needed. For schemas, API docs, policies, workflow guides. Use for >10k word files with grep patterns.

**assets/**: Files NOT loaded into context but used in output. Templates, images, boilerplate, fonts.

### What NOT to Include

No README.md, INSTALLATION_GUIDE.md, CHANGELOG.md, etc. Only essential files for AI agent to do the job.

## Progressive Disclosure Design

Three-level loading system:
1. **Metadata** - Always in context
2. **SKILL.md body** - When skill triggers
3. **Bundled resources** - As needed

### Patterns

**Pattern 1: High-level guide with references**
```markdown
## Quick start
[basic info]

## Advanced features
- See [FORMS.md](references/FORMS.md) for forms
- See [REFERENCE.md](references/REFERENCE.md) for API
```

**Pattern 2: Domain-specific organization**
```
skill/
├── SKILL.md (overview + navigation)
└── references/
    ├── finance.md
    ├── sales.md
    └── product.md
```

**Pattern 3: Conditional details**
```markdown
## Basic editing
[simple approach]

**For tracked changes**: See [REDLINING.md](references/REDLINING.md)
**For OOXML details**: See [OOXML.md](references/OOXML.md)
```

Guidelines:
- Keep SKILL.md under 500 lines
- Reference files one level deep
- Large files include table of contents

## Skill Creation Process

### Step 1: Understand with Concrete Examples

Understand how skill will be used. Gather concrete examples from users or generate and validate.

Ask: "What functionality should this skill support?" "How will users trigger it?"

### Step 2: Plan Reusable Contents

Analyze each example by:
1. Considering how to execute from scratch
2. Identifying scripts, references, assets that would help

Examples:
- `pdf-editor`: Need `scripts/rotate_pdf.py`
- `frontend-webapp-builder`: Need `assets/hello-world/` template
- `big-query`: Need `references/schema.md` for table schemas

### Step 3: Initialize

For new skills, run init script:
```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

Creates:
- Skill directory
- SKILL.md template with TODO placeholders
- Example resource directories
- Example files in each directory

Skip if skill exists and you're iterating/packaging.

### Step 4: Edit Skill

**Start with reusable contents**: Implement scripts, references, assets first. Test scripts by actually running them.

**Update SKILL.md**:

**Writing Guidelines**: Always use imperative/infinitive form.

**Frontmatter**:
```yaml
name: skill-name
description: Comprehensive description including what skill does AND when to use it. Include triggers/contexts. Not in body.
```

Do not include other fields.

**Body**: Instructions for using skill and bundled resources.

### Step 5: Package Skill

```bash
scripts/package_skill.py <path/to/skill-folder> [output-directory]
```

Validates and packages into .skill file (zip with .skill extension).

**Validation checks**:
- YAML frontmatter format
- Skill naming conventions
- Directory structure
- Description quality
- File organization

### Step 6: Iterate

Use skill on real tasks → notice struggles → identify improvements → implement changes → test again.

## Key Takeaways

- Keep SKILL.md lean (<500 lines, <5k words)
- Move detailed info to references
- Use scripts for repeated code patterns
- Use assets for output files (templates, images)
- Progressive disclosure: metadata → body → resources
- Only include files Claude needs to do the job
