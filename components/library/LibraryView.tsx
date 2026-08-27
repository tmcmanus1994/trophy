"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Game } from "@/lib/types";
import { USER_KEY } from "@/lib/supabase";
import { GameCard, type GameStats } from "./GameCard";

type SortKey = "recent" | "completion" | "title";
type FilterKey = "all" | "active" | "completed";

interface Prefs {
  pinned: string | null;
  sort: SortKey;
  filter: FilterKey;
}

const PREFS_KEY = `trophy:${USER_KEY}:library`;
const DEFAULT_PREFS: Prefs = { pinned: null, sort: "recent", filter: "all" };

function loadPrefs(): Prefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function LibraryView({ games }: { games: Game[] }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [stats, setStats] = useState<Record<string, GameStats>>({});

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const update = (patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        // fine — prefs just won't persist
      }
      return next;
    });
  };

  const onStats = useCallback((slug: string, s: GameStats) => {
    setStats((prev) => {
      const cur = prev[slug];
      if (
        cur &&
        cur.percent === s.percent &&
        cur.earned === s.earned &&
        cur.lastUpdated === s.lastUpdated
      ) {
        return prev;
      }
      return { ...prev, [slug]: s };
    });
  }, []);

  const isComplete = useCallback(
    (slug: string) => stats[slug]?.percent === 100,
    [stats]
  );

  const pinnedGame =
    games.find((g) => g.slug === prefs.pinned) ?? null;

  const visible = useMemo(() => {
    const rest = games.filter((g) => g.slug !== prefs.pinned);
    const filtered = rest.filter((g) => {
      if (prefs.filter === "active") return !isComplete(g.slug);
      if (prefs.filter === "completed") return isComplete(g.slug);
      return true;
    });
    const sorted = [...filtered];
    if (prefs.sort === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (prefs.sort === "completion") {
      sorted.sort(
        (a, b) =>
          (stats[b.slug]?.percent ?? 0) - (stats[a.slug]?.percent ?? 0) ||
          a.title.localeCompare(b.title)
      );
    } else {
      sorted.sort((a, b) => {
        const la = stats[a.slug]?.lastUpdated ?? "";
        const lb = stats[b.slug]?.lastUpdated ?? "";
        return lb.localeCompare(la) || a.title.localeCompare(b.title);
      });
    }
    return sorted;
  }, [games, prefs, stats, isComplete]);

  const togglePin = (slug: string) =>
    update({ pinned: prefs.pinned === slug ? null : slug });

  return (
    <>
      <div className="library-controls">
        <div className="guide-filters" role="group" aria-label="Filter games">
          {(
            [
              ["all", "All"],
              ["active", "In progress"],
              ["completed", "Completed"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`guide-filter${prefs.filter === key ? " is-active" : ""}`}
              aria-pressed={prefs.filter === key}
              onClick={() => update({ filter: key })}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="guide-filters" role="group" aria-label="Sort games">
          {(
            [
              ["recent", "Recent"],
              ["completion", "Completion"],
              ["title", "A–Z"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`guide-filter${prefs.sort === key ? " is-active" : ""}`}
              aria-pressed={prefs.sort === key}
              onClick={() => update({ sort: key })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {pinnedGame && prefs.filter !== "completed" && (
        <GameCard
          game={pinnedGame}
          featured
          pinned
          onTogglePin={() => togglePin(pinnedGame.slug)}
          onStats={onStats}
        />
      )}

      {visible.length === 0 && !pinnedGame ? (
        <p className="library-empty-filter">
          {prefs.filter === "completed"
            ? "Nothing completed yet — the trophy case is waiting."
            : "Nothing in progress. Time to add a game."}
        </p>
      ) : (
        <main className="library-grid">
          {visible.map((game) => (
            <GameCard
              key={game.slug}
              game={game}
              pinned={false}
              onTogglePin={() => togglePin(game.slug)}
              onStats={onStats}
            />
          ))}
        </main>
      )}

      {/* Completed games hidden by the filter still need their stats
          reported so counts stay right — render them invisibly. */}
      {prefs.filter !== "all" &&
        games
          .filter((g) => g.slug !== prefs.pinned && !visible.includes(g))
          .map((g) => (
            <div key={g.slug} style={{ display: "none" }}>
              <GameCard game={g} onStats={onStats} />
            </div>
          ))}
    </>
  );
}
