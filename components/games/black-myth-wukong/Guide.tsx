"use client";

import "./theme.css";
import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/lib/useProgress";
import type { GuideProps, Trophy } from "@/lib/types";
import { TrophyCheckbox } from "@/components/trophy/TrophyCheckbox";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";

const PLAT_ID = "final-fulfillment";
const NG_IDS = new Set([
  "six-senses-secured",
  "master-of-magic",
  "staffs-and-spears",
  "mantled-with-might",
  "brewers-bounty",
  "page-preserver",
]);

/* The golden fillet: an arc that is broken open at 0% and seals into a
   full circle at the platinum. Gap sits at the top, between the crests. */
function Fillet({ percent, size = 150 }: { percent: number; size?: number }) {
  const p = Math.min(100, Math.max(0, percent));
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const arc = (p / 100) * c;
  const sealed = p >= 100;
  // Endpoint angles for the crest tips (gap centered at top).
  const gapFrac = 1 - p / 100;
  const tipAngle = (Math.PI * gapFrac) * 1; // half-gap in radians
  const tip = (sign: number) => {
    const a = -Math.PI / 2 + sign * tipAngle;
    return {
      x: size / 2 + r * Math.cos(a),
      y: size / 2 + r * Math.sin(a),
    };
  };
  const t1 = tip(1);
  const t2 = tip(-1);
  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`${Math.round(p)}% complete`}
      style={sealed ? { filter: "drop-shadow(0 0 12px rgba(232,181,88,0.7))" } : undefined}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#241d12"
        strokeWidth="7"
      />
      {p > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#bm-gold-grad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${arc} ${c - arc}`}
          transform={`rotate(${-90 + 180 * gapFrac} ${size / 2} ${size / 2})`}
        />
      )}
      <defs>
        <linearGradient id="bm-gold-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8b558" />
          <stop offset="1" stopColor="#a06f1e" />
        </linearGradient>
      </defs>
      {/* crest tips at the open ends — the fillet's upturned crescents */}
      {!sealed && p > 0 && (
        <>
          <circle cx={t1.x} cy={t1.y} r="5" fill="#e8b558" />
          <circle cx={t2.x} cy={t2.y} r="5" fill="#e8b558" />
        </>
      )}
      {sealed && (
        <circle cx={size / 2} cy={10 + 0} r="5.5" fill="#e8b558" />
      )}
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="ZCOOL XiaoWei, serif"
        fontSize={size * 0.19}
        fill="#d9c9a8"
      >
        {Math.round(p)}%
      </text>
    </svg>
  );
}

function StepCounter({
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
  const full = value >= target;
  return (
    <span className="bm-counter">
      <input
        type="number"
        className="bm-count-input"
        min={0}
        max={target}
        value={draft ?? value}
        aria-label={`${label} count`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
      <span className={`bm-count-total${full ? " full" : ""}`}>/ {target}</span>
      <button
        type="button"
        className="bm-plus"
        aria-label={`Add one to ${label}`}
        onClick={() => onCommit(Math.min(target, value + 1))}
      >
        +1
      </button>
    </span>
  );
}

export default function WukongGuide({ game }: GuideProps) {
  const { isDone, toggle, getValue, setValue, completion, syncState } =
    useProgress(game.slug, game.trophies);

  const liveMissables = game.trophies.filter(
    (t) => t.missable && !isDone(t.id)
  ).length;
  const earned = game.trophies.filter((t) => isDone(t.id));
  const phases = game.phases ?? [];

  const renderCard = (t: Trophy) => (
    <article
      key={t.id}
      className={`bm-card${t.missable ? " missable" : ""}${isDone(t.id) ? " earned" : ""}`}
    >
      <TrophyCheckbox
        checked={isDone(t.id)}
        onToggle={() => toggle(t.id, "trophy")}
        label={t.name}
      />
      <div className="bm-card-body">
        <div className="bm-name">
          <TrophyIcon type={t.type} size={16} dim={!isDone(t.id)} />
          {t.name}
          {t.missable && <span className="bm-tag miss">missable</span>}
          {NG_IDS.has(t.id) && <span className="bm-tag ng">NG+</span>}
        </div>
        <p className="bm-desc">{t.description}</p>
        {t.steps && t.steps.length > 0 && (
          <div className="bm-steps">
            {t.steps.map((s) => {
              const sid = `${t.id}::${s.id}`;
              if (s.target) {
                return (
                  <div key={s.id} className="bm-step">
                    <span style={{ paddingTop: 12 }}>{s.text}</span>
                    <StepCounter
                      value={getValue(sid)}
                      target={s.target}
                      onCommit={(n) => setValue(sid, n)}
                      label={s.text}
                    />
                  </div>
                );
              }
              return (
                <div
                  key={s.id}
                  className={`bm-step${isDone(sid) ? " done" : ""}`}
                >
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
        )}
        {t.note && (
          <div className="bm-note">
            <ReactMarkdown>{t.note}</ReactMarkdown>
          </div>
        )}
      </div>
    </article>
  );

  const phaseSection = (phaseId: string) => {
    const phase = phases.find((p) => p.id === phaseId);
    if (!phase) return null;
    const list = game.trophies.filter(
      (t) => t.phase === phaseId && !isDone(t.id)
    );
    return (
      <section className="bm-phase">
        <div className="bm-phase-head">
          <h2>{phase.title}</h2>
          {phase.summary && <p>{phase.summary}</p>}
        </div>
        {list.length > 0 ? (
          <div className="bm-rows">{list.map(renderCard)}</div>
        ) : (
          <p className="bm-desc" style={{ margin: "12px 0 0 17px" }}>
            Nothing left on this leg of the journey.
          </p>
        )}
      </section>
    );
  };

  return (
    <div className="bmw">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&family=Fira+Sans:wght@400;600&display=swap"
      />
      <div className="wrap">
        <span className="bm-cjk" aria-hidden="true">
          黑神话悟空
        </span>
        <Link href="/" className="bm-back">
          ← Library
        </Link>

        <header className="bm-header">
          <div className="bm-header-info">
            <div className="bm-eyebrow">
              {game.developer} // {game.platform} // two cycles to the crown
            </div>
            <h1 className="bm-title">
              Black Myth <em>Wukong</em>
            </h1>
            {game.platinumName && (
              <p className="bm-plat">
                <TrophyIcon type="platinum" size={15} /> {game.platinumName}
              </p>
            )}
            <div className="bm-meta">
              <span>
                Difficulty <b>{game.difficulty}/10</b>
              </span>
              <span>
                Hours <b>~{game.hoursToPlat}</b>
              </span>
              <span>
                Cycles <b>{game.playthroughs}</b>
              </span>
              <span>
                Live missables <b className="cinnabar">{liveMissables}</b>
              </span>
            </div>
            <div className="bm-tiers">
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
          <div className="bm-fillet-col">
            <Fillet percent={completion.percent} />
            <div className="bm-fillet-label">
              <b>{completion.earned}</b>/{completion.total} — the fillet closes
            </div>
          </div>
        </header>

        <div className="bm-sticky">
          <span>
            <b>
              {completion.earned}/{completion.total}
            </b>{" "}
            fulfilled
          </span>
          <span>
            <span className="cinnabar">{liveMissables}</span> live missables
          </span>
          <span className="spacer" />
          <SyncIndicator state={syncState} />
        </div>

        {game.intro && (
          <div className="bm-intro">
            <ReactMarkdown>{game.intro}</ReactMarkdown>
          </div>
        )}

        {phaseSection("p1")}
        {phaseSection("p2")}

        {/* The one-way door. */}
        <div className="bm-gate">
          <h3>One-way door — New Game+ overwrites the save</h3>
          <p>
            Cross only when Steps 1–2 are fully swept: curios (Lantern Wardens
            before Captain Wise-Voice), seeds, meditation spots, spirits, and
            every journal entry you can still reach. On the NG+ pass, log the
            three chapter-locked journal entries chapter by chapter before
            anything else — free-roam will not give them back.
          </p>
        </div>

        {phaseSection("p3")}

        {earned.length > 0 && (
          <details className="bm-rail">
            <summary>
              Fulfilled — <b>{earned.length}</b> already inscribed
            </summary>
            <div className="bm-rail-list">
              {earned.map((t) => (
                <span key={t.id} className="bm-rail-item">
                  {t.missable ? (
                    <span className="dot" title="was missable" />
                  ) : (
                    <TrophyIcon type={t.type} size={12} />
                  )}
                  <span className="name">{t.name}</span>
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
      </div>
    </div>
  );
}
