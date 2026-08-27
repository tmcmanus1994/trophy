"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/useProgress";
import type { Game } from "@/lib/types";
import { ProgressRing } from "@/components/trophy/ProgressRing";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";

export interface GameStats {
  percent: number;
  earned: number;
  total: number;
  lastUpdated: string | null;
}

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M14.5 3 21 9.5l-1.8 1.8-.9-.45-4.05 4.05.45 2.7-1.8 1.8-4.05-4.05L4.3 19.9 3 21l1.1-1.3 4.55-4.55L4.6 11.1l1.8-1.8 2.7.45 4.05-4.05-.45-.9L14.5 3Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GameCard({
  game,
  featured = false,
  pinned = false,
  hidden = false,
  onTogglePin,
  onStats,
}: {
  game: Game;
  featured?: boolean;
  pinned?: boolean;
  /** Hide via CSS instead of unmounting, so progress state stays warm. */
  hidden?: boolean;
  onTogglePin?: () => void;
  onStats?: (slug: string, stats: GameStats) => void;
}) {
  const { isDone, completion, lastUpdated } = useProgress(
    game.slug,
    game.trophies
  );
  const platinum = game.trophies.find((t) => t.type === "platinum");
  const hasPlat = platinum ? isDone(platinum.id) : false;
  const complete = completion.percent === 100;
  const remaining = completion.total - completion.earned;

  useEffect(() => {
    onStats?.(game.slug, {
      percent: completion.percent,
      earned: completion.earned,
      total: completion.total,
      lastUpdated,
    });
  }, [game.slug, completion.percent, completion.earned, completion.total, lastUpdated, onStats]);

  const accentStyle = {
    "--accent": game.accent ?? "var(--ps-blue)",
  } as React.CSSProperties;

  const pinButton = onTogglePin && (
    <button
      type="button"
      className={`game-pin${pinned ? " is-pinned" : ""}`}
      aria-label={pinned ? `Unpin ${game.title}` : `Pin ${game.title} as active game`}
      aria-pressed={pinned}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onTogglePin();
      }}
    >
      <PinIcon filled={pinned} />
    </button>
  );

  const wrapStyle = hidden
    ? { ...accentStyle, display: "none" }
    : accentStyle;

  if (featured) {
    return (
      <div className="game-card-wrap featured" style={wrapStyle}>
        <Link href={`/g/${game.slug}`} className="game-card game-card--featured">
          <div className="featured-cover" />
          <div className="featured-body">
            <p className="featured-eyebrow">Now playing</p>
            <h2 className="featured-title">{game.title}</h2>
            <p className="game-card-platform">{game.platform}</p>
            <p className="featured-line">
              {complete ? (
                <span className="game-card-plat">
                  <TrophyIcon type="platinum" size={15} /> Complete
                </span>
              ) : (
                <>
                  {completion.earned}/{completion.total} trophies —{" "}
                  <b>{remaining} to go</b>
                  {game.missableCount ? ` · ${game.missableCount} missable` : ""}
                </>
              )}
            </p>
          </div>
          <ProgressRing percent={completion.percent} size={88} stroke={6}>
            {completion.percent}%
          </ProgressRing>
        </Link>
        {pinButton}
      </div>
    );
  }

  return (
    <div className="game-card-wrap" style={wrapStyle}>
      <Link href={`/g/${game.slug}`} className="game-card">
        <div className="game-card-cover">
          {game.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={game.coverImage} alt="" />
          ) : (
            <span className="game-card-cover-title">{game.title}</span>
          )}
        </div>
        <div className="game-card-body">
          <div className="game-card-info">
            <h2 className="game-card-title">{game.title}</h2>
            <p className="game-card-platform">{game.platform}</p>
            {hasPlat || complete ? (
              <span className="game-card-plat">
                <TrophyIcon type="platinum" size={15} />
                {hasPlat ? (game.platinumName ?? "Platinum earned") : "Complete"}
              </span>
            ) : (
              <div className="game-card-counts">
                <span>
                  {completion.earned}/{completion.total} trophies
                </span>
                {game.missableCount ? (
                  <span>{game.missableCount} missable</span>
                ) : null}
              </div>
            )}
          </div>
          <ProgressRing percent={completion.percent} size={62} stroke={5}>
            {completion.percent}%
          </ProgressRing>
        </div>
      </Link>
      {pinButton}
    </div>
  );
}
