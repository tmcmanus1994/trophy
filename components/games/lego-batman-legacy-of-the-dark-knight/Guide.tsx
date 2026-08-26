"use client";

import "./theme.css";
import { useId, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/lib/useProgress";
import type { GuideProps, Trophy } from "@/lib/types";
import { TrophyCheckbox } from "@/components/trophy/TrophyCheckbox";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";

/* Generic bat silhouette in a 100x64 box — fills bottom-up as the meter. */
const BAT_PATH =
  "M50 20 L47 13 L45 21 C36 17 21 19 8 32 C20 29 27 32 31 41 C35 36 40 37 43 45 C46 40 48 42 50 51 C52 42 54 40 57 45 C60 37 65 36 69 41 C73 32 80 29 92 32 C79 19 64 17 55 21 L53 13 Z";

function BatMeter({
  percent,
  size = 96,
}: {
  percent: number;
  size?: number;
}) {
  const id = useId();
  const p = Math.min(100, Math.max(0, percent));
  const h = 64;
  const filledTop = h * (1 - p / 100);
  return (
    <svg
      width={size}
      height={(size * h) / 100}
      viewBox="0 0 100 64"
      role="img"
      aria-label={`${Math.round(p)}% complete`}
      className={p >= 100 ? "lb-emblem-full" : undefined}
    >
      <ellipse
        cx="50"
        cy="32"
        rx="47"
        ry="29"
        fill="#0a1120"
        stroke={p >= 100 ? "var(--lb-rim)" : "var(--lb-cowl)"}
        strokeWidth="2.5"
      />
      <path d={BAT_PATH} fill="#1a2440" />
      <clipPath id={id}>
        <rect x="0" y={filledTop} width="100" height={h - filledTop} />
      </clipPath>
      <path d={BAT_PATH} fill="var(--lb-yellow)" clipPath={`url(#${id})`} />
    </svg>
  );
}

/* Fraction of a trophy's work that is finished, for the emblem + sorting. */
function useEffort(
  isDone: (id: string) => boolean,
  getValue: (id: string) => number
) {
  return (t: Trophy) => {
    if (isDone(t.id)) return { pct: 100, remaining: 0 };
    let total = 0;
    let doneUnits = 0;
    if (t.counter) {
      // Steps under a counter trophy are a breakdown of the same units —
      // the trophy-level count alone drives the meter.
      total = t.counter;
      doneUnits = Math.min(t.counter, getValue(t.id));
    } else {
      for (const s of t.steps ?? []) {
        const sid = `${t.id}::${s.id}`;
        if (s.target) {
          total += s.target;
          doneUnits += Math.min(s.target, getValue(sid));
        } else {
          total += 1;
          doneUnits += isDone(sid) ? 1 : 0;
        }
      }
    }
    if (total === 0) return { pct: 0, remaining: 1 };
    return {
      pct: (doneUnits / total) * 100,
      remaining: total - doneUnits,
    };
  };
}

function CounterInput({
  value,
  target,
  onCommit,
  label,
}: {
  value: number;
  target: number;
  onCommit: (n: number) => void;
  label: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null) {
      const n = parseInt(draft, 10);
      if (!Number.isNaN(n)) onCommit(Math.min(target, Math.max(0, n)));
      setDraft(null);
    }
  };
  return (
    <>
      <input
        type="number"
        className="lb-counter-input"
        min={0}
        max={target}
        value={draft ?? value}
        aria-label={`${label} count`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
      <span className="lb-counter-total">/ {target}</span>
      <button
        type="button"
        className="lb-plus"
        aria-label={`Add one to ${label}`}
        onClick={() => onCommit(Math.min(target, value + 1))}
      >
        +1
      </button>
    </>
  );
}

export default function LegoBatmanGuide({ game }: GuideProps) {
  const { isDone, toggle, getValue, setValue, completion, syncState } =
    useProgress(game.slug, game.trophies);
  const effort = useEffort(isDone, getValue);

  const cleared = game.trophies.filter((t) => isDone(t.id));
  const remaining = game.trophies
    .filter((t) => !isDone(t.id))
    .sort((a, b) => effort(b).remaining - effort(a).remaining);

  return (
    <div className="lbat">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
      />
      <div className="wrap">
        <Link href="/" className="lb-back">
          ← Library
        </Link>

        <header className="lb-header">
          <div className="lb-header-info">
            <div className="lb-eyebrow">
              {game.developer} // {game.platform} // Nothing missable — only volume
            </div>
            <h1 className="lb-title">
              LEGO Batman <em>Legacy of the Dark Knight</em>
            </h1>
            {game.platinumName && (
              <p className="lb-plat">
                <TrophyIcon type="platinum" size={15} /> {game.platinumName}
              </p>
            )}
            <div className="lb-meta">
              {game.difficulty != null && (
                <span>
                  Difficulty <b>{game.difficulty}/10</b>
                </span>
              )}
              {game.hoursToPlat != null && (
                <span>
                  Hours <b>~{game.hoursToPlat}</b>
                </span>
              )}
              {game.playthroughs != null && (
                <span>
                  Playthroughs <b>{game.playthroughs}</b>
                </span>
              )}
              <span>
                Missable <b>0</b>
              </span>
            </div>
            <div className="lb-tiers">
              {(["platinum", "gold", "silver", "bronze"] as const).map((type) =>
                completion.byType[type].total > 0 ? (
                  <span key={type}>
                    <TrophyIcon type={type} size={14} />
                    {completion.byType[type].earned}/{completion.byType[type].total}
                  </span>
                ) : null
              )}
            </div>
          </div>
          <div className="lb-hero-emblem">
            <BatMeter percent={completion.percent} size={150} />
            <div className="lb-pct">{completion.percent}%</div>
          </div>
        </header>

        <div className="lb-sticky">
          <span>
            <b>
              {completion.earned} / {completion.total}
            </b>{" "}
            collected
          </span>
          <span>
            <b>{remaining.length}</b> to light
          </span>
          <span className="spacer" />
          <SyncIndicator state={syncState} />
        </div>

        {cleared.length > 0 && (
          <details className="lb-cleared">
            <summary>
              Cleared — <b>{cleared.length}</b> trophies banked
            </summary>
            <div className="lb-cleared-list">
              {cleared.map((t) => (
                <span key={t.id} className="lb-cleared-chip">
                  <TrophyIcon type={t.type} size={12} />
                  {t.name}
                  <TrophyCheckbox
                    checked
                    onToggle={() => toggle(t.id, "trophy")}
                    label={t.name}
                    small
                  />
                </span>
              ))}
            </div>
          </details>
        )}

        {game.intro && (
          <div className="lb-intro">
            <ReactMarkdown>{game.intro}</ReactMarkdown>
          </div>
        )}

        <h2 className="lb-grid-title">
          Signals to light
          <small>sorted by remaining effort</small>
        </h2>
        <div className="lb-grid">
          {remaining.map((t) => {
            const { pct } = effort(t);
            return (
              <article key={t.id} className="lb-card">
                <div className="lb-card-emblem">
                  <BatMeter percent={pct} size={92} />
                  <div className="lb-card-count">
                    <b>{Math.round(pct)}%</b>
                  </div>
                </div>
                <div className="lb-card-body">
                  <div className="lb-card-name">
                    <TrophyIcon type={t.type} size={15} dim />
                    {t.name}
                    <TrophyCheckbox
                      checked={false}
                      onToggle={() => toggle(t.id, "trophy")}
                      label={t.name}
                      small
                    />
                  </div>
                  <p className="lb-card-desc">{t.description}</p>

                  {t.counter && (
                    <div className="lb-counter-row">
                      <CounterInput
                        value={getValue(t.id)}
                        target={t.counter}
                        onCommit={(n) => setValue(t.id, n)}
                        label={t.name}
                      />
                    </div>
                  )}

                  {t.steps && t.steps.length > 0 && (
                    <details className="lb-steps" open={!t.counter}>
                      <summary>Breakdown</summary>
                      {t.steps.map((s) => {
                        const sid = `${t.id}::${s.id}`;
                        return (
                          <div
                            key={s.id}
                            className={`lb-step${isDone(sid) ? " done" : ""}`}
                          >
                            {s.target ? (
                              <>
                                <span className="lb-step-text">{s.text}</span>
                                <input
                                  type="number"
                                  className="lb-counter-input"
                                  min={0}
                                  max={s.target}
                                  value={getValue(sid)}
                                  aria-label={`${s.text} count`}
                                  onChange={(e) => {
                                    const n = parseInt(e.target.value, 10);
                                    if (!Number.isNaN(n))
                                      setValue(sid, Math.min(s.target!, Math.max(0, n)));
                                  }}
                                />
                                <span className="lb-step-total">/ {s.target}</span>
                              </>
                            ) : (
                              <>
                                <TrophyCheckbox
                                  checked={isDone(sid)}
                                  onToggle={() => toggle(sid, "step")}
                                  label={s.text}
                                  small
                                />
                                <span className="lb-step-text">{s.text}</span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </details>
                  )}

                  {t.note && (
                    <div className="lb-note">
                      <ReactMarkdown>{t.note}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
