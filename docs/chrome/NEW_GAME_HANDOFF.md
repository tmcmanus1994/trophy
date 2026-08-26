# Handoff: New game build (for Claude in Chrome)

You are gathering everything needed to add a new game to a personal
PlayStation trophy tracker. The user is logged into PSNProfiles in this
browser. Your final output is **three fenced blocks of markdown** that the
user hands to Claude Code, which builds the site. Markdown is the required
format — the tracker's content system is markdown with YAML front-matter.

Work through four research steps, then emit the three blocks.

## Research

**1. Trophy list (PSNProfiles — ground truth).**
Open the game's trophy page (`psnprofiles.com/trophies/<id>-<game>`). Record
for every trophy: exact name, tier (bronze/silver/gold/platinum),
description, and DLC grouping if any. Also note the numeric game id from
the URL. Counts matter: state the totals per tier and verify your list adds
up before moving on.

**2. Earned status (user's PSNProfiles page for this game).**
Same page under the user's profile (`psnprofiles.com/trophies/<id>-<game>/<username>`).
Record which trophies are already earned (they show an earned date).

**3. Roadmap (PowerPyx).**
Open `powerpyx.com` and find the game's "Trophy Guide & Roadmap". Record:
difficulty estimate (x/10), estimated hours to platinum, number of
playthroughs, which trophies are missable, the step/phase structure
("Step 1: ...", "Step 2: ..."), and any point-of-no-return warnings. Note
per-trophy tips worth keeping (collectible counts, quest gates, boss
strategies) — brief, not copied wholesale: summarize in your own words.

**4. Design research (for the game's custom page look).**
Look at the game's key art, cover, logo, and in-game UI screenshots (image
search is fine). Decide and note: 4–6 hex color values pulled from the
game's world; the typography personality (e.g. "carved serif, weathered",
"clean geometric sci-fi"); what structure the trophy list wants (dense
grind table? phase timeline with warning gates? collectible counter grid?);
and one signature visual element worth building the page around.

## Output

Emit exactly three fenced blocks, in this order, each preceded by its
heading.

### Block 1 — `GUIDE FILE`

The complete guide markdown. It must follow this contract exactly
(YAML front-matter, then optional intro prose):

```markdown
---
slug: <kebab-case, e.g. ghost-of-tsushima>
title: <Title>
platform: PS5
developer: <Developer>
released: <YYYY-MM-DD>
platinumName: <name of the platinum trophy>
difficulty: <1-10, from PowerPyx>
hoursToPlat: <number>
playthroughs: <number>
missableCount: <number of missable: true trophies below>
psnProfilesGameId: <numeric id from the PSNProfiles URL>
accent: "<one hex color from your design research>"

phases:            # from the PowerPyx roadmap steps; omit if no ordering
  - id: p1
    title: <phase title>
    summary: <one sentence>

trophies:          # EVERY trophy, including ones already earned
  - id: <kebab-case of the name, unique, stable>
    name: <Exact Trophy Name>
    type: bronze | silver | gold | platinum
    description: <exact trophy description>
    phase: p1              # omit if no phases
    missable: true|false   # from PowerPyx
    dlc: true|false
    requires: []           # ids of prerequisite trophies, if meaningful
    steps:                 # only for multi-part trophies (collectibles,
      - id: s1             # questlines, endings); omit otherwise
        text: <sub-task>
    note: |                # optional; warnings and strategy, markdown ok
      <tip. Bold the traps.>
---

<2-5 sentences: the run plan, in the user's voice. Mention what's already
earned shaping the plan, e.g. "Mid-run pickup: story is done, this run is
cleanup-first.">
```

Hard rules:
- Include EVERY trophy from PSNProfiles — earned ones too. The tracker
  needs the full list for completion math; earned status is applied
  separately (Block 2), never by omission.
- Names and descriptions exactly as PSNProfiles shows them.
- Every `id` kebab-case and unique.
- `missable: true` on everything PowerPyx flags; `missableCount` must match.

### Block 2 — `TROPHY-SYNC`

The earned trophies from research step 2, in this exact format:

```
TROPHY-SYNC v1
game: <same slug as Block 1>
earned:
- <Exact Trophy Name>
- <Exact Trophy Name>
```

If nothing is earned yet, output the block with no bullets and say so.

### Block 3 — `DESIGN BRIEF`

Your design research as a short brief for the developer who will build the
game's custom page:

```markdown
## Design brief: <title>
- Palette: <4-6 named hex values, each with what it's drawn from>
- Type: <display personality / body personality>
- Structure: <what the trophy list's shape demands>
- Signature: <the one memorable element>
- References: <what you looked at>
```

## Handling

Give the user all three blocks. Block 1 goes to Claude Code to create the
guide. Block 2 gets pasted into the tracker's `/sync` page (you can do this
for the user — paste, Preview, confirm before applying). Block 3 goes to
Claude Code with the request for the custom page design.
