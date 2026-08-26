# Trophy Guide — Build Handoff

A personal, web-based trophy guide hub. One deployment, many games. Every game gets its own visual identity and its own information layout, but progress is shared, persistent, and synced across devices.

This document is the contract. Content lives in markdown, layout lives in components, progress lives in Supabase.

---

## 1. What this is

- A private site (single user: me) hosted on Vercel, no custom domain needed.
- A library home page listing every game guide with completion percentage.
- Per-game guide pages, each designed specifically for that game — different structure, palette, type, and pacing depending on what the game's trophy list actually needs.
- Checkboxes that persist. Tick on desktop, open on phone, it's already ticked.
- Adding a new game = write one markdown file + one component. Nothing else.

**Non-goals:** multi-user accounts, auth flows, a CMS, mobile apps, comment systems.

---

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Per-game routes, server-side markdown parsing, ships to Vercel with zero config |
| Hosting | Vercel | Free tier, git-push deploys, cron jobs available for phase 2 |
| Database | Supabase (Postgres) | Already familiar, generous free tier, realtime subscriptions built in |
| Styling | Tailwind CSS + CSS custom properties | Utilities for structure, CSS vars for per-game theming |
| Content | Markdown + YAML front-matter, parsed with `gray-matter` | Portable, diffable, easy for an AI to author |

Install: `next`, `react`, `tailwindcss`, `@supabase/supabase-js`, `gray-matter`, `zod` (validate front-matter at build time so a malformed guide fails loudly instead of rendering blank).

Env vars:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_USER_KEY=travelle       # single-user namespace, no auth
PSN_PROFILES_ID=                    # phase 2 only
CRON_SECRET=                        # phase 2 only
```

---

## 3. Data model

One table. Items are addressed by a composite key, so trophies and sub-steps share the same storage.

```sql
create table progress (
  user_key    text        not null default 'travelle',
  game_slug   text        not null,
  item_id     text        not null,   -- trophy id, or "trophy-id::step-id"
  item_type   text        not null default 'trophy',  -- 'trophy' | 'step'
  done        boolean     not null default false,
  done_at     timestamptz,
  source      text        not null default 'manual',  -- 'manual' | 'psnprofiles'
  updated_at  timestamptz not null default now(),
  primary key (user_key, game_slug, item_id)
);

create index progress_game_idx on progress (user_key, game_slug);

alter table progress enable row level security;

-- Single-user site, anon key only. Scoped to the one user_key.
create policy "own rows" on progress
  for all
  using  (user_key = current_setting('request.jwt.claims', true)::json->>'sub'
          or user_key = 'travelle')
  with check (true);
```

> Note for the builder: this is a private, single-user hobby site, so the anon key having write access to one namespaced row set is an accepted tradeoff. Do not put anything sensitive in this database. If it ever needs to be truly locked down, swap to Supabase Auth with a magic link and key rows by `auth.uid()`.

Also enable Realtime on the `progress` table (Supabase dashboard → Database → Replication) so cross-device updates push instead of poll.

---

## 4. Sync model

Three layers, in this order:

1. **React state** — instant. The checkbox flips the moment it's clicked, no await.
2. **localStorage** — written synchronously on every toggle, read on mount before any network call. This is what makes a cold load feel instant and keeps the site usable offline.
3. **Supabase** — written in the background (fire-and-forget upsert), and read on mount to reconcile.

**Reconciliation rule:** last write wins, compared on `updated_at`. On mount, fetch the remote rows for the current game, compare against the local cache per item, and take whichever is newer. Write the merged result back to both.

**Realtime:** subscribe to `postgres_changes` on `progress` filtered to the current `game_slug`. When a change arrives from another device, patch state and the local cache. This is what makes the couch-to-desk handoff feel immediate.

**Failure behavior:** if Supabase is unreachable, everything still works off localStorage. Queue failed writes in a `pending` array in localStorage and flush on next successful connection. Show a small, quiet sync indicator — synced / syncing / offline. Don't block the UI on it, and don't apologize in the copy; just say what's true.

Expose all of this behind one hook so no component ever touches Supabase directly:

```ts
// lib/useProgress.ts
const { isDone, toggle, completion, syncState } = useProgress(gameSlug)

isDone(itemId): boolean
toggle(itemId, itemType?): void
completion: { earned: number; total: number; percent: number; byType: Record<TrophyType, {earned:number,total:number}> }
syncState: 'synced' | 'syncing' | 'offline'
```

---

## 5. The markdown contract

One file per game at `content/games/<slug>.md`. Front-matter carries all structured data. The body is optional prose that renders as an intro on the guide page.

**Validate this shape with zod at parse time.** If a file doesn't conform, fail the build with the filename and the offending field.

```markdown
---
slug: elden-ring
title: Elden Ring
platform: PS5
developer: FromSoftware
released: 2022-02-25
platinumName: Elden Lord
difficulty: 6            # 1-10, my own estimate
hoursToPlat: 90
playthroughs: 2
missableCount: 12
psnProfilesGameId: 15938 # phase 2 only, optional
accent: "#C9A227"        # one seed color; the component may ignore it
coverImage: /covers/elden-ring.jpg

# Optional. If present, the guide is organized into ordered phases.
phases:
  - id: p1
    title: Blind playthrough
    summary: Play naturally. Do not chase trophies yet.
  - id: p2
    title: Cleanup run
    summary: Mop up the endings and remaining questlines.

trophies:
  - id: elden-lord
    name: Elden Lord
    type: platinum          # bronze | silver | gold | platinum
    description: Obtain all trophies.
    phase: p2
    missable: false
    dlc: false
    requires: []            # ids of trophies that must come first

  - id: age-of-stars
    name: Age of the Stars
    type: gold
    description: Achieve the "Age of the Stars" ending.
    phase: p2
    missable: true
    dlc: false
    requires: [ranni-questline]
    steps:
      - id: s1
        text: Finish Ranni's questline through the Fingerslayer Blade.
      - id: s2
        text: Do not touch the Frenzied Flame before the final boss.
    note: |
      Missable in the sense that the ending is chosen at the very end,
      but the questline gating it can be permanently failed much earlier.
---

Short intro prose. How I'm approaching this run, what order I'm doing things in,
anything worth knowing before starting. Renders above the trophy list.
```

### Field rules

- `id` must be unique within a game, kebab-case, and **stable forever** — it's the database key. Renaming an id orphans that row's progress.
- `type` drives the icon and the completion breakdown.
- `missable: true` is the single most important flag; every layout must surface it prominently.
- `requires` is for ordering hints and dependency display, not enforcement. Never block a checkbox.
- `steps` are optional sub-checkboxes stored as `trophy-id::step-id`.
- `note` accepts markdown.

Everything else in a game's presentation — grouping, ordering, what gets emphasized — is the component's call.

---

## 6. Folder structure

```
app/
  layout.tsx
  page.tsx                    # library: grid of game cards + completion rings
  g/[slug]/page.tsx           # loads markdown, picks component from registry
  api/
    cron/psn/route.ts         # phase 2

content/
  games/
    elden-ring.md
    ghost-of-tsushima.md

components/
  games/
    registry.ts               # slug -> component map
    _default/Guide.tsx        # fallback layout, used until a custom one exists
    elden-ring/
      Guide.tsx
      theme.css               # scoped custom properties
  trophy/                     # shared primitives, styled by CSS vars only
    TrophyCheckbox.tsx
    TrophyIcon.tsx
    ProgressRing.tsx
    MissableBadge.tsx
    SyncIndicator.tsx

lib/
  content.ts                  # read + parse + validate markdown
  schema.ts                   # zod schemas
  supabase.ts
  useProgress.ts
  types.ts
```

### Registry

```ts
// components/games/registry.ts
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { GuideProps } from '@/lib/types'

export const guides: Record<string, ComponentType<GuideProps>> = {
  'elden-ring': dynamic(() => import('./elden-ring/Guide')),
}

export const getGuide = (slug: string) =>
  guides[slug] ?? DefaultGuide
```

The route resolves the component, passes in the parsed game object, and gets out of the way:

```tsx
// app/g/[slug]/page.tsx
const game = await getGame(params.slug)   // parsed + validated
const Guide = getGuide(params.slug)
return <Guide game={game} />
```

**This is the important part:** a new game with no custom component still renders and still tracks progress, using `_default`. The custom layout is an upgrade, never a prerequisite.

---

## 7. Per-game design direction

Each game's component is a real design job, not a reskin. Treat every one as its own brief.

Before writing a game's component, decide and state:

- **Palette** — 4–6 named hex values pulled from the game's own world. Not a hue-shift of the last game's palette.
- **Type** — a display face with personality and a body face that stays readable through long trophy descriptions. Do not reuse the same pairing across games.
- **Structure** — what the *information* wants. A long grind list wants a dense scannable table. A missable-heavy narrative game wants a phase timeline with hard warning gates. A collectathon wants a map or a counter-driven grid. Let the trophy list dictate the shape.
- **Signature** — the one memorable element. Spend the boldness here and keep everything else quiet.

Constraints that apply to every game regardless of direction:

- Theme only via CSS custom properties on a wrapper. Shared primitives read those vars, so the checkbox in Elden Ring and the checkbox in Ghost of Tsushima are the same component wearing different clothes.
- Checkbox hit targets ≥ 44px. This gets used one-handed on a couch.
- Missable state must be visible without hovering or expanding.
- Responsive to phone width. Visible keyboard focus. `prefers-reduced-motion` respected.
- The completion summary is always reachable without scrolling to the bottom.

Copy rules: plain verbs, sentence case, active voice. Say "Mark earned," not "Submit." An empty guide says what to add, not "no data."

---

## 8. Phase 2 — PSN Profiles auto-sync (optional, build last)

Sony has no public trophy API. Unofficial PSN wrappers exist but require your account session token, break on Sony's schedule, and sit outside their terms. Not worth it here.

PSN Profiles is the softer option: the profile page is public HTML, so it can be parsed.

**Approach:**

- `app/api/cron/psn/route.ts`, protected by `CRON_SECRET` in the Authorization header.
- Vercel cron, hourly:
  ```json
  { "crons": [{ "path": "/api/cron/psn", "schedule": "0 * * * *" }] }
  ```
- For each game with a `psnProfilesGameId`, fetch that game's trophy page, parse out earned trophy names, fuzzy-match them against `trophies[].name` in the markdown, and upsert `done: true, source: 'psnprofiles'`.

**Rules that keep this safe:**

- **Additive only.** The scraper may mark a trophy earned. It may never un-earn one. Manual state is never destroyed by a failed parse.
- **Never touch steps.** Sub-steps stay manual — PSN doesn't know about them.
- **Degrade silently.** If the fetch 403s or the parse returns zero matches, log it and exit cleanly. The site keeps working manually; that's the baseline, not the fallback.
- **Match by name, report misses.** Surface unmatched trophy names somewhere visible (a debug route is fine) so drift gets caught.
- Be a polite client: one request per game per hour, real user-agent, no parallel hammering. If they block it, that's the end of the feature and it's fine.

Treat all of this as a convenience that may stop working at any time. The manual checkbox is the product.

---

## 9. Build order

1. Next.js + Tailwind + Vercel deploy. Blank page, live URL.
2. Supabase project, `progress` table, RLS, realtime enabled.
3. `lib/content.ts` + `lib/schema.ts`. Parse one markdown file, render raw JSON to screen.
4. `useProgress` hook: state → localStorage → Supabase, plus realtime subscription. Verify by ticking on one device and watching another.
5. Shared trophy primitives, unstyled apart from CSS vars.
6. `_default/Guide.tsx` — a clean, genuinely usable layout. Everything works from here.
7. Library home page with completion rings.
8. First custom game component. Full design pass, own brief.
9. Repeat step 8 per game, one at a time.
10. Phase 2 scraper, only if steps 1–9 are solid.

Ship after step 6. Everything past that is refinement on a working product.

---

## 10. Adding a game later

1. Write `content/games/<slug>.md` following section 5.
2. Push. It renders with the default layout and starts tracking immediately.
3. When you want it to feel like the game: add `components/games/<slug>/Guide.tsx`, register it, design it properly.
