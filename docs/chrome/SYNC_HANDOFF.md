# Handoff: PSN trophy sync (for Claude in Chrome)

You are helping sync PlayStation trophy progress into a personal trophy
tracker site. The user is logged into PSNProfiles in this browser. Your
job: read which trophies they have EARNED for one game and produce a sync
block, then (if asked) paste it into the tracker's sync page.

## Step 1 — Read the earned trophies

Go to the user's PSNProfiles page for the game (they will name the game or
give the URL — it looks like `psnprofiles.com/trophies/<id>-<game>/<username>`,
or reachable from their profile at `psnprofiles.com/<username>` by clicking
the game).

On that page, every trophy row shows either an earned date/time (earned) or
appears greyed/dateless (not earned). Collect the EXACT trophy names of the
earned ones only. Copy names character-for-character — matching in the
tracker is by name.

## Step 2 — Produce the sync block

Output exactly this format, nothing else around it:

```
TROPHY-SYNC v1
game: <game title as the user calls it>
earned:
- <Trophy Name>
- <Trophy Name>
```

One block per game. Multiple games can be stacked in one output, each
starting with its own `game:` line.

Rules:
- Earned trophies only. Never list unearned ones.
- Do not translate, abbreviate, or "fix" trophy names.
- If the page shows zero earned trophies, say so instead of emitting an
  empty block.

## Step 3 — Apply it (if the user asks)

Open the tracker site (the user's domain) at `/sync`, paste the block into
the text area, click **Preview**, show the user what will be marked, and
click **Mark N earned** only after they confirm. The tool is additive —
it can only mark trophies earned, never un-earn — so a mistaken paste is
recoverable, but confirm anyway.

If the Preview shows "No match in this guide" names, report them back to
the user verbatim — that usually means the guide spells a trophy
differently and the guide file needs a fix.
