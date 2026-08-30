"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, USER_KEY } from "./supabase";
import type { ProgressMap } from "./types";

export interface TrackedPlat {
  slug: string;
  platinumId: string;
}

export interface PlatStatus {
  done: boolean;
  doneAt: string | null;
}

/**
 * Read-only platinum status for tracked games: localStorage caches paint
 * instantly, then one Supabase query reconciles across devices. No writes —
 * earning a platinum happens on the game's own page.
 */
export function usePlatinumStatus(
  tracked: TrackedPlat[]
): Record<string, PlatStatus> {
  const [status, setStatus] = useState<Record<string, PlatStatus>>({});
  const key = useMemo(
    () => tracked.map((t) => `${t.slug}:${t.platinumId}`).join(","),
    [tracked]
  );

  useEffect(() => {
    const byId = new Map(tracked.map((t) => [t.slug, t.platinumId]));

    const next: Record<string, PlatStatus> = {};
    for (const t of tracked) {
      try {
        const raw = window.localStorage.getItem(`trophy:${USER_KEY}:${t.slug}`);
        const cache = raw ? (JSON.parse(raw) as ProgressMap) : {};
        const entry = cache[t.platinumId];
        if (entry?.done) next[t.slug] = { done: true, doneAt: entry.done_at };
      } catch {
        // cache unreadable — Supabase pass below still covers it
      }
    }
    setStatus(next);

    if (!supabase || tracked.length === 0) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase!
        .from("progress")
        .select("game_slug, item_id, done, done_at")
        .eq("user_key", USER_KEY)
        .eq("done", true)
        .in("game_slug", tracked.map((t) => t.slug))
        .in("item_id", tracked.map((t) => t.platinumId));
      if (cancelled || error || !data) return;
      setStatus((prev) => {
        const merged = { ...prev };
        for (const row of data) {
          // The two .in() filters are independent — confirm the real pair.
          if (byId.get(row.game_slug) === row.item_id) {
            merged[row.game_slug] = { done: true, doneAt: row.done_at };
          }
        }
        return merged;
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return status;
}
