"use client";

import "./theme.css";
import { useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/lib/useProgress";
import type { GuideProps, Trophy } from "@/lib/types";
import { TrophyCheckbox } from "@/components/trophy/TrophyCheckbox";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";

const SWEEPER_ID = "youre-not-getting-away-that-easy";
const CABINS_ID = "mini-hunter-supreme";
const SIMS_ID = "master-of-the-simulator";
const GATE_ID = "our-promise";

/* The hack matrix: every trophy is a node on a phase ring; requires draw
   as traces. Cyan = earned, amber diamond = the missable, dark = open. */
function HackLattice({
  game,
  isDone,
  size = 300,
}: {
  game: GuideProps["game"];
  isDone: (id: string) => boolean;
  size?: number;
}) {
  const c = 190;
  const RADII: Record<string, number> = { p1: 152, p2: 96, p3: 48 };

  const coords = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    for (const phase of ["p1", "p2", "p3"]) {
      const nodes = game.trophies.filter(
        (t) => t.phase === phase && t.type !== "platinum"
      );
      nodes.forEach((t, i) => {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / nodes.length;
        m.set(t.id, {
          x: c + RADII[phase] * Math.cos(a),
          y: c + RADII[phase] * Math.sin(a),
        });
      });
    }
    const plat = game.trophies.find((t) => t.type === "platinum");
    if (plat) m.set(plat.id, { x: c, y: c });
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.trophies]);

  const phaseComplete = (phase: string) =>
    game.trophies
      .filter((t) => t.phase === phase && t.type !== "platinum")
      .every((t) => isDone(t.id));

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 380 380"
      role="img"
      aria-label="Trophy lattice"
    >
      {(["p1", "p2", "p3"] as const).map((p) => (
        <circle
          key={p}
          cx={c}
          cy={c}
          r={RADII[p]}
          fill="none"
          stroke={phaseComplete(p) ? "#35d7f0" : "#1c2836"}
          strokeWidth="1"
          style={
            phaseComplete(p)
              ? { filter: "drop-shadow(0 0 6px rgba(53,215,240,0.6))" }
              : undefined
          }
        />
      ))}

      {/* requires traces */}
      {game.trophies.flatMap((t) =>
        t.requires.map((req) => {
          const a = coords.get(t.id);
          const b = coords.get(req);
          if (!a || !b) return null;
          return (
            <line
              key={`${t.id}-${req}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#1d4fd8"
              strokeWidth="1"
              opacity="0.55"
            />
          );
        })
      )}

      {/* nodes */}
      {game.trophies.map((t) => {
        const pos = coords.get(t.id)!;
        const earned = isDone(t.id);
        const isPlat = t.type === "platinum";
        const r = isPlat ? 9 : 5.5;
        const fill = earned ? "#35d7f0" : "#0d1218";
        const stroke = earned
          ? "#35d7f0"
          : t.missable
            ? "#ffb627"
            : "#2c3c50";
        return (
          <g key={t.id}>
            {t.missable && !earned ? (
              <rect
                x={pos.x - r}
                y={pos.y - r}
                width={r * 2}
                height={r * 2}
                transform={`rotate(45 ${pos.x} ${pos.y})`}
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
              />
            ) : (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth="1.5"
                style={
                  earned
                    ? { filter: "drop-shadow(0 0 4px rgba(53,215,240,0.7))" }
                    : undefined
                }
              />
            )}
            <title>{`${t.name}${earned ? " — earned" : t.missable ? " — MISSABLE" : ""}`}</title>
          </g>
        );
      })}
    </svg>
  );
}

function CountInput({
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
    <input
      type="number"
      className="pg-count-input"
      min={0}
      max={target}
      value={draft ?? value}
      aria-label={label}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && commit()}
    />
  );
}

export default function PragmataGuide({ game }: GuideProps) {
  const { isDone, toggle, getValue, setValue, completion, syncState } =
    useProgress(game.slug, game.trophies);

  const byId = new Map(game.trophies.map((t) => [t.id, t]));
  const sweeper = byId.get(SWEEPER_ID)!;
  const cabins = byId.get(CABINS_ID)!;
  const sims = byId.get(SIMS_ID)!;
  const sectorsDone = isDone("the-right-man-for-the-job");
  const cabinTotal = (cabins.steps ?? []).reduce(
    (n, s) => n + Math.min(s.target ?? 0, getValue(`${cabins.id}::${s.id}`)),
    0
  );

  const phases = game.phases ?? [];

  const renderRow = (t: Trophy) => {
    const earned = isDone(t.id);
    const featured = t.id === "lunar-supremacy";
    return (
      <div
        key={t.id}
        className={`pg-row${earned ? " earned" : ""}${featured ? " featured" : ""}`}
      >
        <TrophyCheckbox
          checked={earned}
          onToggle={() => toggle(t.id, "trophy")}
          label={t.name}
        />
        <div className="pg-row-body">
          <div className="pg-name">
            <TrophyIcon type={t.type} size={15} dim={!earned} />
            {t.name}
          </div>
          <p className="pg-desc">{t.description}</p>

          {t.id === SIMS_ID && t.counter && (
            <div className="pg-counter-inline">
              <CountInput
                value={getValue(t.id)}
                target={t.counter}
                onCommit={(n) => setValue(t.id, n)}
                label="Training Sims completed"
              />
              <span className="pg-cab-total">/ {t.counter} sims</span>
              <button
                type="button"
                className="pg-plus"
                aria-label="Add one sim"
                onClick={() =>
                  setValue(t.id, Math.min(t.counter!, getValue(t.id) + 1))
                }
              >
                +1
              </button>
            </div>
          )}
          {t.id === CABINS_ID && (
            <p className="pg-desc pg-mono">
              {cabinTotal}/15 — tracked in the sector grid above
            </p>
          )}

          {t.steps && t.id !== CABINS_ID && (
            <details className="pg-intel" open={featured && !earned}>
              <summary>Checklist</summary>
              <div className="pg-steps-list">
                {t.steps.map((s) => {
                  const sid = `${t.id}::${s.id}`;
                  return (
                    <div key={s.id} className={`pg-step${isDone(sid) ? " done" : ""}`}>
                      <TrophyCheckbox
                        checked={isDone(sid)}
                        onToggle={() => toggle(sid, "step")}
                        label={s.text}
                        small
                      />
                      <span>{s.text}</span>
                    </div>
                  );
                })}
              </div>
            </details>
          )}

          {t.note && (
            <details className="pg-intel" open={featured && !earned}>
              <summary>Intel</summary>
              <div className="pg-note">
                <ReactMarkdown>{t.note}</ReactMarkdown>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pg">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&family=Work+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
      />
      <div className="wrap">
        <Link href="/" className="pg-back">
          ← Library
        </Link>

        <header className="pg-header">
          <div className="pg-header-info">
            <div className="pg-eyebrow">
              {game.developer} // {game.platform} // luna // 2 runs + 1 signal
            </div>
            <h1 className="pg-title">Pragmata</h1>
            {game.platinumName && (
              <p className="pg-plat">
                <TrophyIcon type="platinum" size={15} /> {game.platinumName}
              </p>
            )}
            <div className="pg-meta">
              <span>
                DIFF <b>{game.difficulty}/10</b>
              </span>
              <span>
                EST <b>~{game.hoursToPlat}H</b>
              </span>
              <span>
                RUNS <b>{game.playthroughs}</b>
              </span>
              <span>
                MISSABLE <b>1</b>
              </span>
            </div>
            <div className="pg-tiers">
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
          <div className="pg-lattice-col">
            <HackLattice game={game} isDone={isDone} />
            <div className="pg-lattice-label">
              {completion.earned}/{completion.total} nodes routed
            </div>
          </div>
        </header>

        <div className="pg-sticky">
          <span>
            <b>
              {completion.earned}/{completion.total}
            </b>{" "}
            routed
          </span>
          <span>
            cabins <b>{cabinTotal}/15</b>
          </span>
          <span>
            sims <b>{getValue(SIMS_ID)}/30</b>
          </span>
          <span className="spacer" />
          <SyncIndicator state={syncState} />
        </div>

        {game.intro && (
          <div className="pg-intro">
            <ReactMarkdown>{game.intro}</ReactMarkdown>
          </div>
        )}

        {/* missable warning band */}
        {!isDone(sweeper.id) && (
          <section className="pg-band">
            <div className="pg-band-head">
              <span className="pg-band-tag">Missable — spawns burn</span>
              <TrophyCheckbox
                checked={false}
                onToggle={() => toggle(sweeper.id, "trophy")}
                label={sweeper.name}
                small
              />
              <h2>{sweeper.name}</h2>
              <p className="pg-desc">{sweeper.description}</p>
            </div>
            <div className="pg-spawns">
              {(sweeper.steps ?? []).map((s) => {
                const sid = `${sweeper.id}::${s.id}`;
                return (
                  <div key={s.id} className={`pg-spawn${isDone(sid) ? " done" : ""}`}>
                    <TrophyCheckbox
                      checked={isDone(sid)}
                      onToggle={() => toggle(sid, "step")}
                      label={s.text}
                      small
                    />
                    <span>{s.text}</span>
                  </div>
                );
              })}
            </div>
            {sweeper.note && (
              <details className="pg-intel">
                <summary>Intel</summary>
                <div className="pg-note">
                  <ReactMarkdown>{sweeper.note}</ReactMarkdown>
                </div>
              </details>
            )}
          </section>
        )}

        {/* dual completion grid */}
        <section className="pg-grid-card">
          <h2>Sector survey</h2>
          <p className="pg-hint">
            Two columns because <strong>Mini Cabins do not count toward sector
            completion</strong> — a 100% bar says nothing about them.
          </p>
          <table className="pg-table">
            <thead>
              <tr>
                <th>Sector</th>
                <th>Completion</th>
                <th>Mini Cabins</th>
              </tr>
            </thead>
            <tbody>
              {(cabins.steps ?? []).map((s) => {
                const sid = `${cabins.id}::${s.id}`;
                const v = getValue(sid);
                const done = v >= (s.target ?? 3);
                return (
                  <tr key={s.id}>
                    <td className="pg-display" style={{ fontSize: 10, letterSpacing: "0.24em" }}>
                      {s.text}
                    </td>
                    <td>
                      {sectorsDone ? (
                        <span className="pg-sector-ok">100%</span>
                      ) : (
                        <span className="pg-sector-na">—</span>
                      )}
                    </td>
                    <td>
                      <div className="pg-cab-cell">
                        <CountInput
                          value={v}
                          target={s.target ?? 3}
                          onCommit={(n) => setValue(sid, n)}
                          label={`${s.text} Mini Cabins`}
                        />
                        <span className={`pg-cab-total${done ? " pg-cab-done" : ""}`}>
                          / {s.target ?? 3}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td className="pg-display" style={{ fontSize: 10, letterSpacing: "0.24em" }}>
                  Advanced Pragmatics
                </td>
                <td>
                  <span className="pg-sector-na">no collectibles</span>
                </td>
                <td>
                  <span className="pg-sector-na">none</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* phases */}
        {phases.map((phase) => {
          const list = game.trophies.filter(
            (t) => t.phase === phase.id && t.id !== SWEEPER_ID
          );
          const withSweeper =
            phase.id === "p1" && isDone(sweeper.id)
              ? [...list, sweeper]
              : list;
          return (
            <div key={phase.id}>
              {phase.id === "p2" && (
                <div className="pg-gate">
                  gate // our promise unlocks unknown signal + lunatic
                </div>
              )}
              <section className="pg-phase">
                <div className="pg-phase-head">
                  <h2>{phase.title}</h2>
                  {phase.summary && <p>{phase.summary}</p>}
                </div>
                <div className="pg-rows">{withSweeper.map(renderRow)}</div>
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
