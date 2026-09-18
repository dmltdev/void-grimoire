# Cross-channel writing skill research

**Question.** What source-owned skill contracts are worth adapting for a future writing skill that produces natural, concise competent-peer text in chat, Slack/Teams, PR descriptions, and related communication?

## Method and evidence limits

This review used the two named candidates and three candidates surfaced by the [`skills.sh` humanize search](https://www.skills.sh/?q=humanize). Repository-owned `SKILL.md` files are the evidence source wherever available; Skills.sh is only used to establish search candidacy. The requested PostHog identifier says `posthog/skills`, but the candidate's source-owned implementation is in [`PostHog/posthog`](https://github.com/PostHog/posthog/pull/80018), not the current [`PostHog/skills`](https://github.com/PostHog/skills) tree. An automated source check for the PostHog claim was inconclusive, so the conclusions below rely on the directly fetched, source-owned PR diff rather than that check.

## Candidate comparison

### 1. `op7418/humanizer-zh/humanizer-zh`

- **Source and stated trigger/scope.** The source-owned [`SKILL.md`](https://raw.githubusercontent.com/op7418/Humanizer-zh/main/SKILL.md) says to edit or review text to remove AI-writing traces. Its core workflow is to identify patterns, rewrite them, preserve core information, match formal/casual/technical tone, and add personality.
- **Useful guidance shape.** It has a concrete pattern catalogue with paired bad/good examples: significance inflation, promotional prose, vague attribution, formulaic challenge/outlook sections, AI vocabulary clusters, copula avoidance, negative parallelism, forced triads, synonym cycling, excess dashes, bold labels, and over-structured lists. Its short five-rule recap is especially portable: remove filler, break formulaic structure, vary rhythm, trust the reader, and remove quotable-sounding lines.
- **Adapt.** Keep the instruction to preserve meaning while changing shape; inspect structural as well as lexical tells; prefer direct statements; and treat unnecessary Markdown decoration as an output defect. Its stated register matching maps directly to delivery context.
- **Reject or narrow.** The source is Chinese-first, so its vocabulary list and Chinese examples are not an English cross-channel contract. Its advice to add opinions, first person, tangents, and "mess" can improve an essay but can distort terse status updates and PR descriptions. Treat personality as optional, never as a required transformation. Its dash guidance is useful, but the future skill should make the requested no-em-dash rule unconditional rather than a general stylistic observation.

### 2. `posthog/writing-simplified-technical-english`

- **Source and stated trigger/scope.** The source-owned [PostHog skill diff](https://github.com/PostHog/posthog/pull/80018.diff) says to use the skill for prose that another person or agent acts on: reports, findings, PR descriptions, commit messages, instructions, prompts, tool descriptions, errors, empty states, and log lines. It explicitly excludes marketing, blogs, and persuasive writing because controlled technical English is deliberately flat.
- **Useful guidance shape.** It uses a compact rule table, then a rewrite pass and self-check. Reusable rules include one meaning per word, one verb for one action, active voice when it clarifies the actor, simple tenses, one idea per sentence, sentence and paragraph limits, one hedge at most, lists for three or more genuine steps, defined jargon, sentence case, and no em dashes. Its key safety valve is also concrete: precision beats brevity, so do not drop a condition, scope qualifier, number, or date merely to shorten a sentence.
- **Adapt.** Use its actionability test for PR bodies and operational messages: could a reader with no session context know what to do next? Preserve facts, conditions, qualifiers, and quoted text. The self-check provides enforceable output checks rather than a vague instruction to "sound natural."
- **Reject or narrow.** Its controlled-language limits are too restrictive for ordinary chat: hard caps, simple-tenses-only, and a flat voice would make peer communication stiff. Do not adopt a universal ban on compact sentence coordination or force a list at three items when a short conversational sentence reads better. Keep its clarity contract for formal and action-bearing contexts, not as a universal register.

### 3. `lguz/humanize-writing-skill/humanize-writing`

- **Source and stated trigger/scope.** The source-owned [`SKILL.md`](https://raw.githubusercontent.com/lguz/humanize-writing-skill/main/skills/humanize-writing/SKILL.md), surfaced by [Skills.sh](https://www.skills.sh/lguz/humanize-writing-skill), targets text described as too AI-like, including LinkedIn posts, blog drafts, emails, and marketing copy. It explicitly says not to use the skill for technical writing, READMEs, API references, code comments, commit messages, or changelogs.
- **Useful guidance shape.** Its three-pass shape is clear: remove vocabulary clusters, break repeated structures, then apply the selected voice. It prioritizes user-supplied voice samples and avoids emojis, hashtags, and engagement bait unless requested. It also calls out secondary convergence: replacing one stock transition with another stock transition is not a fix.
- **Adapt.** Reuse voice-sample precedence, the "do not explain edits unless asked" delivery rule, and the anti-convergence check. The explicit prohibition on unsolicited marketing ornaments helps protect chat and PR copy.
- **Reject or narrow.** Its explicit exclusion of technical and commit/structured writing conflicts with the target. Several checklist quotas are not enforceable quality rules: require 30% of paragraphs to end without a conclusion, force a sentence to start with "And" or "But," demand a visible opinion, and cap em dashes at one per 500 words. The future skill needs meaning-preserving, context-sensitive rules, not artificial human-signalling quotas.

### 4. `aashaexo/soundshuman/humanize`

- **Source and stated trigger/scope.** The source-owned [`SKILL.md`](https://raw.githubusercontent.com/aashaexo/soundshuman/main/SKILL.md), surfaced by [Skills.sh](https://www.skills.sh/aashaexo/soundshuman/humanize), covers drafting, editing, and reviewing prose for 41 AI-pattern categories. It specifies formal, casual, and technical voice matching, an explicit no-fabrication rule, and a draft, audit, final-rewrite loop.
- **Useful guidance shape.** Its strongest reusable contract is "preserve the information, not the shape": retain each source claim while freely compressing, merging, splitting, and restructuring text. It says never to invent facts, names, numbers, dates, quotations, or citations; ask for missing detail or use plainer wording. It distinguishes formatting that should match the medium, including removing Markdown that will not render, and calls out assistant chatter, acknowledgement loops, and signposting as communication defects.
- **Adapt.** Adopt the no-fabrication invariant, medium-aware Markdown rule, and the explicit removal of greetings, question restatements, "here is," offers to continue, and reasoning scaffolding. Its caveat that neutral technical/reference prose can already be the correct human voice is important for avoiding over-editing.
- **Reject or narrow.** A 41-pattern catalogue is too large to be the primary operating surface for a short cross-channel skill. Its hard zero-em/en-dash rule has a writing-sample exception; that conflicts with the stated no-em-dash requirement, so do not copy the exception. The catalogue should become a compact, high-confidence review list rather than a long blacklist.

### 5. `aboudjem/humanizer-skill/humanizer`

- **Source and stated trigger/scope.** The source-owned [`SKILL.md`](https://raw.githubusercontent.com/Aboudjem/humanizer-skill/main/skills/humanizer/SKILL.md), surfaced by [Skills.sh](https://www.skills.sh/aboudjem/humanizer-skill/humanizer), offers detect/rewrite/edit modes, five named voice profiles, purpose overlays including email and technical writing, and optional code/quote masking.
- **Useful guidance shape.** It has unusually good false-positive guardrails: flag clusters rather than isolated words or punctuation; do not change quotations, code, titles, headings, or examples; repeat precise technical terms rather than cycling synonyms; and do not mistake formal, non-native-English, or naturally low-variance prose for AI output. Its direct prose rules cover Markdown bleeding into non-Markdown media, abrupt register shifts, low-information restatement, and diff-anchored documentation.
- **Adapt.** Keep the false-positive protections and the distinction between a pattern cluster and one legitimate instance. Preserve exact technical terminology and quoted/code spans. A delivery-context overlay is better than a single universal voice.
- **Reject or narrow.** The 55-pattern score, multiple modes, flags, and named voices are more machinery than this focused skill needs. A numeric "AI-tell" score creates an appearance of measurement that does not prove quality. Its claim that a lone em dash is weak evidence is sensible for detection, but the future skill has a product constraint to avoid em dashes, so the final-output check should simply reject them.

## Cross-candidate findings

1. **Primary failure class: context-free, model-shaped prose.** The candidates agree most strongly on structural problems rather than individual taboo words: staged openings, repetition, forced symmetry or triads, inflated importance, assistant meta-chatter, vague authority, and over-structured Markdown. This is direct evidence in the [Humanizer source](https://raw.githubusercontent.com/blader/humanizer/main/SKILL.md) from which the Chinese candidate is translated, and in the [Soundshuman source](https://raw.githubusercontent.com/aashaexo/soundshuman/main/SKILL.md). **Researcher inference:** the new skill should phrase its goal as "write the useful message for this reader and medium," not "make it pass as human."
2. **Meaning protection is non-negotiable.** Soundshuman and Humanizer both explicitly prohibit inventing factual detail, while PostHog explicitly says not to shorten away conditions, qualifiers, dates, or numbers. These are compatible and should be one shared invariant. Sources: [Soundshuman](https://raw.githubusercontent.com/aashaexo/soundshuman/main/SKILL.md), [Humanizer](https://raw.githubusercontent.com/blader/humanizer/main/SKILL.md), [PostHog](https://github.com/PostHog/posthog/pull/80018.diff).
3. **Register must follow delivery context.** Humanizer-zh explicitly names formal, casual, and technical tone; Soundshuman says technical/reference prose can correctly remain neutral; PostHog deliberately excludes voice-led persuasive prose. Sources: [Humanizer-zh](https://raw.githubusercontent.com/op7418/Humanizer-zh/main/SKILL.md), [Soundshuman](https://raw.githubusercontent.com/aashaexo/soundshuman/main/SKILL.md), [PostHog](https://github.com/PostHog/posthog/pull/80018.diff). **Researcher inference:** chat and PR text need different defaults, while both need the same preservation and anti-slop rules.

## Proposed synthesis

### Primary failure class

A message is correct but sounds like a context-free assistant: it performs helpfulness, explanation, structure, or polish instead of delivering the useful point to a capable peer. The skill should remove this failure without manufacturing quirks, opinions, or false specificity.

### Boundaries

- Apply to authored prose for chat, Slack/Teams, PR descriptions, review replies, status updates, issue text, commit context, and similar messages.
- Preserve every supported claim, condition, qualifier, number, date, citation, code span, quoted text, and exact technical term. Do not invent detail to make prose feel lived-in.
- Do not use it to write marketing, fiction, brand voice, legal prose, a strict controlled-language manual, or a personal essay unless the user explicitly asks for that transformation.
- Do not add Markdown just to organize a short message. Strip or avoid Markdown where the delivery surface will not render it. Use a list only when items are genuinely parallel or action steps.
- Final text contains no em dashes. Do not add beginner explanations, question restatements, greetings, praise, offers to continue, or a change log unless the recipient needs them.

### Register decision table

| Delivery context | Default register | Shape | What to optimize | Avoid |
| --- | --- | --- | --- | --- |
| Chat, Slack, or Teams | Informal competent peer | One short paragraph; bullets only for a real decision or action list | Direct answer first, familiar contractions where natural, enough context to act | Formal throat-clearing, Markdown decoration, tutorial framing, faux warmth |
| PR description | Formal, concise technical peer | Outcome first; brief bullets for scope, risk, and verification when useful | Reviewer scanability, precise nouns/verbs, conditions and evidence | Chatty asides, repeated explanation of basic code concepts, generic claims of improvement |
| Code-review reply or issue comment | Neutral to informal, depending on thread tone | Answer or decision first, then rationale/evidence | Resolve the question without rephrasing it | Sycophancy, defensive rebuttal to imagined objections, long recap |
| Status update or handoff | Neutral and operational | Current state, blocker/decision, next action; use bullets when several independent facts exist | Unambiguous ownership, state, and next step | Narrative diary, vague hedging, unsupported optimism |
| Error, prompt, or instruction | Formal operational clarity | Short active sentences; separate conditions and actions | One actionable meaning; preserve safety/scope detail | Metaphor, synonym rotation, missing actors, combined instructions |

### Candidate names for later selection

Do not decide the final name in this note. Candidates: **cross-channel writing**, **peer prose**, **message polish**, **contextual writing**, and **clear peer communication**.
