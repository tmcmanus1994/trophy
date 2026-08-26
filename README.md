# Trophy Room

Personal PlayStation trophy guide hub. One deployment, many games. Content
lives in markdown, layout lives in components, progress lives in Supabase.
The full contract is in [`docs/HANDOFF.md`](docs/HANDOFF.md).

## One-time setup

### 1. Supabase (progress sync)

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. Open **SQL Editor**, paste and run [`supabase/schema.sql`](supabase/schema.sql).
3. **Database → Replication** → add `progress` to the `supabase_realtime`
   publication (this is what makes a tick on the couch appear on the desk).
4. **Project Settings → API** → copy the URL and anon key.

The site works without Supabase — checkboxes then save to localStorage on
each device (`Local only` indicator) and start syncing the moment the env
vars appear.

### 2. Vercel (hosting)

1. Import this GitHub repo at [vercel.com/new](https://vercel.com/new).
   Framework preset: Next.js, no config needed.
2. Add the environment variables from [`.env.example`](.env.example):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_USER_KEY`.
3. Deploy. Every `git push` deploys automatically after that.

### 3. Local dev

```bash
cp .env.example .env.local   # fill in the Supabase values
npm install
npm run dev
```

## Adding a game

In Claude Code, run **`/new-game`** with the game's name and its
PSNProfiles / PowerPyx links. The skill fetches the trophy list and
roadmap, writes `content/games/<slug>.md`, validates it with the build,
and pushes. The new guide renders immediately with the default layout and
starts tracking progress.

> **Remote sessions:** `psnprofiles.com` and `powerpyx.com` must be on the
> environment's allowed-domains list for fetching to work. Otherwise paste
> the page content into the chat — the skill handles that too.

Manual version: write `content/games/<slug>.md` following section 5 of the
handoff, `npm run build` to validate, push.

When a game deserves its own look: add
`components/games/<slug>/Guide.tsx`, register it in
`components/games/registry.ts`. Until then the default layout is used —
a custom component is an upgrade, never a prerequisite.

**Never rename a trophy `id`** after shipping — ids are the database keys;
renaming one orphans its saved progress.

## How it works

- `content/games/*.md` — one file per game; YAML front-matter validated by
  zod at build time (`lib/schema.ts`), so a malformed guide fails the build
  loudly instead of rendering blank.
- `lib/useProgress.ts` — the only path to progress state: React state →
  localStorage → Supabase, last write wins on `updated_at`, realtime
  subscription for cross-device pushes, pending-write queue when offline.
- `components/trophy/*` — shared primitives styled only by CSS custom
  properties, so per-game themes are variable overrides.
- `app/g/[slug]/page.tsx` — resolves the guide component from the registry
  and passes the parsed game.

## Phase 2 (not built yet)

PSN Profiles auto-sync via a Vercel cron (`app/api/cron/psn/route.ts`) —
see section 8 of the handoff. Additive only, degrades silently, manual
checkboxes remain the product.
