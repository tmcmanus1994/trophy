import { supabase, USER_KEY } from "./supabase";
import type { Game, ProgressEntry, ProgressMap } from "./types";

/**
 * Manual PSN sync: parse a pasted TROPHY-SYNC block (produced by the
 * Claude-in-Chrome handoff, or written by hand), match earned trophy names
 * against the guides, and mark them earned.
 *
 * Additive only — this can mark a trophy earned, never un-earn one, and it
 * never touches steps. Manual state is never destroyed by a bad paste.
 */

export interface SyncBlock {
  game: string;
  earned: string[];
}

export interface TrophyRef {
  id: string;
  name: string;
}

export interface GameMatch {
  slug: string;
  title: string;
  toMark: TrophyRef[];
  alreadyDone: TrophyRef[];
  unmatched: string[];
}

export interface ApplyResult {
  marked: number;
  failedRemote: boolean;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const cacheKey = (slug: string) => `trophy:${USER_KEY}:${slug}`;

function readCache(slug: string): ProgressMap {
  try {
    const raw = window.localStorage.getItem(cacheKey(slug));
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeCache(slug: string, map: ProgressMap) {
  try {
    window.localStorage.setItem(cacheKey(slug), JSON.stringify(map));
  } catch {
    // Ignore — Supabase (if configured) still gets the rows.
  }
}

/**
 * Accepts one or more blocks of:
 *   game: <slug or title>
 *   earned:
 *   - Trophy Name
 *   - Trophy Name
 * Tolerates bullet variants (-, *, •), blank lines, and a TROPHY-SYNC header.
 */
export function parseSyncText(text: string): SyncBlock[] {
  const blocks: SyncBlock[] = [];
  let current: SyncBlock | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const gameMatch = line.match(/^game\s*:\s*(.+)$/i);
    if (gameMatch) {
      current = { game: gameMatch[1].trim(), earned: [] };
      blocks.push(current);
      continue;
    }
    if (/^trophy-sync/i.test(line) || /^earned\s*:?\s*$/i.test(line)) continue;
    const bullet = line.match(/^[-*•]\s*(.+)$/);
    if (bullet && current) current.earned.push(bullet[1].trim());
  }

  return blocks.filter((b) => b.earned.length > 0);
}

export function matchBlocks(blocks: SyncBlock[], games: Game[]): GameMatch[] {
  const bySlugOrTitle = new Map<string, Game>();
  for (const g of games) {
    bySlugOrTitle.set(norm(g.slug), g);
    bySlugOrTitle.set(norm(g.title), g);
  }

  return blocks.map((block) => {
    const game = bySlugOrTitle.get(norm(block.game));
    if (!game) {
      return {
        slug: block.game,
        title: block.game,
        toMark: [],
        alreadyDone: [],
        unmatched: block.earned,
      };
    }

    const byName = new Map(game.trophies.map((t) => [norm(t.name), t]));
    const cache = readCache(game.slug);
    const toMark: TrophyRef[] = [];
    const alreadyDone: TrophyRef[] = [];
    const unmatched: string[] = [];
    const seen = new Set<string>();

    for (const name of block.earned) {
      const trophy = byName.get(norm(name));
      if (!trophy) {
        unmatched.push(name);
        continue;
      }
      if (seen.has(trophy.id)) continue;
      seen.add(trophy.id);
      if (cache[trophy.id]?.done) {
        alreadyDone.push({ id: trophy.id, name: trophy.name });
      } else {
        toMark.push({ id: trophy.id, name: trophy.name });
      }
    }

    return { slug: game.slug, title: game.title, toMark, alreadyDone, unmatched };
  });
}

export async function applyMatch(match: GameMatch): Promise<ApplyResult> {
  if (match.toMark.length === 0) return { marked: 0, failedRemote: false };

  const now = new Date().toISOString();
  const entry = (): ProgressEntry => ({
    done: true,
    done_at: now,
    updated_at: now,
    source: "psnprofiles",
  });

  const cache = readCache(match.slug);
  for (const t of match.toMark) cache[t.id] = entry();
  writeCache(match.slug, cache);

  let failedRemote = false;
  if (supabase) {
    const rows = match.toMark.map((t) => ({
      user_key: USER_KEY,
      game_slug: match.slug,
      item_id: t.id,
      item_type: "trophy",
      done: true,
      done_at: now,
      source: "psnprofiles",
      updated_at: now,
    }));
    const { error } = await supabase.from("progress").upsert(rows);
    failedRemote = !!error;
  }

  return { marked: match.toMark.length, failedRemote };
}
