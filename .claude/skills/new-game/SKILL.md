---
name: new-game
description: Add a new game guide to the Trophy Room from PSNProfiles + PowerPyx data. Use when the user says "add <game>", "new game", "build a guide for <game>", or pastes a PSNProfiles/PowerPyx link or trophy list.
---

# Add a new game guide

Turn a game's trophy data into `content/games/<slug>.md`, following the
contract in section 5 of `docs/HANDOFF.md`. A valid markdown file is the
whole job — the site renders it with the default layout and starts tracking
progress immediately. A custom component is an optional upgrade afterward.

## 1. Gather the data

Sources, in order of preference:

1. **PSNProfiles trophy page** (`https://psnprofiles.com/trophies/<id>-<name>`)
   — the authoritative trophy list: exact names, descriptions, tiers
   (bronze/silver/gold/platinum), DLC grouping, and the numeric
   `psnProfilesGameId` (the number in the URL).
2. **PowerPyx guide** (`https://www.powerpyx.com/<game>-trophy-guide-roadmap/`)
   — the roadmap: difficulty estimate, hours to platinum, number of
   playthroughs, missable trophies, step-by-step ordering, and phase
   structure ("Step 1: ...", "Step 2: ...").

Try `WebFetch` on both. **If the network policy blocks these domains**
(remote sessions block anything not on the environment's allowlist), tell
the user and ask them to either (a) add `psnprofiles.com` and
`powerpyx.com` to the environment's allowed domains, (b) run the
Claude-in-Chrome handoff at `docs/chrome/NEW_GAME_HANDOFF.md` — it browses
both sites logged-in and hands back a ready GUIDE FILE block plus a
TROPHY-SYNC block (earned trophies, applied via the site's `/sync` page)
and a DESIGN BRIEF block — or (c) paste the trophy list and roadmap text
directly into the chat. All three work; never guess a trophy list from
memory without flagging it.

If the user provides a `TROPHY-SYNC` block here instead of using `/sync`,
point them to the site's `/sync` page — that's what writes earned state to
the database.

Cross-check: trophy count and tier counts from PSNProfiles are ground
truth. PowerPyx supplies `difficulty`, `hoursToPlat`, `playthroughs`,
`missableCount`, phases, and which trophies get `missable: true`.

## 2. Author the markdown

Write `content/games/<slug>.md`. Rules that matter:

- `slug` must match the filename and be kebab-case.
- Every trophy `id` is kebab-case, unique, and **stable forever** — it is
  the database key. Never rename an id in a later edit; renaming orphans
  that trophy's saved progress.
- `type` comes from PSNProfiles exactly.
- `missable: true` on anything PowerPyx flags as missable or quest-gated.
  Set `missableCount` to match.
- Use `phases` when the roadmap has ordered steps; assign each trophy a
  `phase`. Trophies playable anytime can omit `phase`.
- Use `steps` (sub-checkboxes) for multi-part trophies: collectible lists,
  questline sequences, endings. Step ids are stable too.
- Use `requires` for ordering hints (ids of prerequisite trophies).
- `note` is markdown — put warnings, strategies, and point-of-no-return
  info there. Bold the traps.
- `accent`: one hex color pulled from the game's key art.
- `coverImage`: optional; if the user provides art, save it to
  `public/covers/<slug>.jpg` and reference it as `/covers/<slug>.jpg`.
- Intro prose below the front-matter: 2–5 sentences on the run plan.

## 3. Validate

Run `npm run build`. The zod schema fails the build with the filename and
field on any malformed front-matter. Fix until green — never ship a guide
that didn't build.

## 4. Ship

Commit with a message like `Add <Title> guide` and push. Done — the guide
is live with the default layout.

## 5. Custom layout

The owner wants every game to get its own UI, designed around the game
itself. After the guide ships with the default layout, offer the design
pass (or do it when asked). Create `components/games/<slug>/Guide.tsx`,
register it in
`components/games/registry.ts`, and treat it as a real design brief per
section 7 of `docs/HANDOFF.md`: state the palette (4–6 hex values from the
game's world), the type pairing (don't reuse a previous game's), the
structure the trophy list wants, and one signature element. Theme only via
CSS custom properties on the wrapper; shared primitives read those vars.
Keep the constraints: 44px hit targets, missable state visible without
hover, completion summary reachable without scrolling, responsive,
`prefers-reduced-motion` respected.
