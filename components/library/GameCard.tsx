"use client";

import Link from "next/link";
import { useProgress } from "@/lib/useProgress";
import type { Game } from "@/lib/types";
import { ProgressRing } from "@/components/trophy/ProgressRing";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";

export function GameCard({ game }: { game: Game }) {
  const { isDone, completion } = useProgress(game.slug, game.trophies);
  const platinum = game.trophies.find((t) => t.type === "platinum");
  const hasPlat = platinum ? isDone(platinum.id) : false;

  return (
    <Link
      href={`/g/${game.slug}`}
      className="game-card"
      style={
        { "--accent": game.accent ?? "var(--ps-blue)" } as React.CSSProperties
      }
    >
      <div className="game-card-cover">
        {game.coverImage ? (
          // Plain img: covers are local files in /public, no optimization needed.
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
          {hasPlat ? (
            <span className="game-card-plat">
              <TrophyIcon type="platinum" size={15} />
              {game.platinumName ?? "Platinum earned"}
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
  );
}
