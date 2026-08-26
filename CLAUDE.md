# Trophy Room — project conventions

Personal PlayStation trophy tracker. Single user (Travelle / BlackXThunder25).
Full architecture contract: `docs/HANDOFF.md`. Setup: `README.md`.

## Shipping

- **Every push to the production branch deploys the live site** (Vercel).
  The owner wants changes shipped straight to live — no PR ceremony needed
  unless they ask for one.
- Production tracks the repo's default branch. `main` mirrors it; prefer
  `main` once it is the default.
- ALWAYS run `npm run build` before pushing — it validates every guide's
  front-matter (zod) and fails loudly on malformed content.

## Rules that protect user data

- **Never rename a trophy or step `id`** in `content/games/*.md` — ids are
  the progress database keys; renaming orphans the user's saved progress.
  Fixing names/descriptions/notes is always safe; ids are forever.
- Deleting a guide file removes it from the site but leaves its progress
  rows in Supabase untouched (re-adding the same slug+ids restores them).
- Progress sync (`/sync`, scrapers) is additive only: mark earned, never
  un-earn, never touch steps.

## Adding games

- `/new-game` skill (`.claude/skills/new-game/`) is the workflow. Data
  sources: PSNProfiles (trophy list, tiers — ground truth) + PowerPyx
  (roadmap, missables). If the network blocks those domains, the user runs
  the Claude-in-Chrome handoffs (`docs/chrome/`) and pastes the output.
- Every game eventually gets its own custom guide component
  (`components/games/<slug>/Guide.tsx`, registered in
  `components/games/registry.ts`) treated as a real design brief —
  palette/type/structure from the game itself. The `_default` layout is the
  interim renderer, never the end state.
- One-off checklists (single trophy, many steps) are supported via
  `stepGroups` + per-step `detail`/`code`/`tags` — see
  `content/games/dispatch.md` and its custom component.

## Design

- Library home: Sony palette — deep navy, PlayStation blue primary, red
  only as an accent (○ glyph, missable warnings). Michroma + Saira.
- Shared primitives (`components/trophy/`) are themed via CSS custom
  properties only; per-game components override the vars, never fork the
  primitives.
