"use client";

import "./theme.css";
import { useId, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/lib/useProgress";
import type { GuideProps, Trophy } from "@/lib/types";
import { TrophyCheckbox } from "@/components/trophy/TrophyCheckbox";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";
import { ProgressRing } from "@/components/trophy/ProgressRing";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";

const BOSS_IDS = ["trials-prevailed", "to-the-death"];
const PLAT_ID = "unparalleled-strength";

/* Danger fights in the 46-round cycle, repeated each lap up to 100. */
const DANGER_BASE = [7, 10, 11, 12, 20, 32, 38, 46];
const DANGER = [
  ...DANGER_BASE,
  ...DANGER_BASE.map((n) => n + 46),
  ...DANGER_BASE.map((n) => n + 92),
].filter((n) => n <= 100);
const LOOPS = [47, 93];

/* The vertical nichirin blade: 100 notches, lit from the base upward. */
function NichirinBlade({ round }: { round: number }) {
  const id = useId();
  const TIP = 14;
  const BASE = 520;
  const y = (r: number) => BASE - (r / 100) * (BASE - TIP);
  const litTop = y(Math.min(100, Math.max(0, round)));
  const bladePath = "M40 10 L50 522 L30 522 Z";
  return (
    <svg
      width="140"
      height="660"
      viewBox="0 0 140 660"
      role="img"
      aria-label={`Survival progress: round ${round} of 100`}
    >
      <defs>
        <linearGradient id={`${id}-heat`} x1="0" y1="522" x2="0" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8e1116" />
          <stop offset="0.5" stopColor="#c1272d" />
          <stop offset="1" stopColor="#f2711c" />
        </linearGradient>
        <clipPath id={`${id}-lit`}>
          <rect x="0" y={litTop} width="140" height={BASE + 4 - litTop} />
        </clipPath>
      </defs>

      {/* unlit blade */}
      <path d={bladePath} fill="#241114" stroke="#57222a" strokeWidth="2" />
      {/* lit portion */}
      {round > 0 && (
        <path
          d={bladePath}
          fill={`url(#${id}-heat)`}
          clipPath={`url(#${id}-lit)`}
          style={
            round >= 100
              ? { filter: "drop-shadow(0 0 10px rgba(242,113,28,0.8))" }
              : { filter: "drop-shadow(0 0 5px rgba(193,39,45,0.5))" }
          }
        />
      )}

      {/* notches + labels every 10 rounds */}
      {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((r) => (
        <g key={r}>
          <line x1="52" x2="60" y1={y(r)} y2={y(r)} stroke="#4a1c22" strokeWidth="1.5" />
          <text x="64" y={y(r) + 3} fontSize="10" fill={round >= r ? "#f2711c" : "#6b444b"}>
            {r}
          </text>
        </g>
      ))}

      {/* loop points — hilt-wrap bands */}
      {LOOPS.map((r) => (
        <g key={r}>
          <rect x="27" y={y(r) - 2.5} width="26" height="5" fill="#1e5b4a" rx="1" />
          <text x="64" y={y(r) + 3} fontSize="9" fill="#1e5b4a">
            loop
          </text>
        </g>
      ))}

      {/* danger rounds — ember flares on the edge */}
      {DANGER.map((r) => (
        <circle key={r} cx={31 - (1 - r / 100) * 6} cy={y(r)} r="2.4" fill={round >= r ? "#f2711c" : "#7a2d10"} />
      ))}

      {/* current-round pointer */}
      {round > 0 && round < 100 && (
        <g>
          <path d={`M18 ${y(round)} l8 -5 v10 Z`} fill="#f26c9c" />
          <text x="14" y={y(round) + 3.5} fontSize="11" fontWeight="700" fill="#f26c9c" textAnchor="end">
            {round}
          </text>
        </g>
      )}

      {/* tsuba + hilt with haori-green wraps */}
      <rect x="22" y="524" width="36" height="8" rx="3" fill="#8e1116" stroke="#3a1418" />
      <rect x="31" y="534" width="18" height="104" rx="4" fill="#1a0d0f" stroke="#3a1418" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="31" y={540 + i * 20} width="18" height="7" fill="#1e5b4a" opacity="0.85" />
      ))}
      <text x="70" y="590" fontSize="10" fill="#6b444b">
        {round}/100
      </text>
    </svg>
  );
}

function battleParts(text: string) {
  // "Battle N — Title: matchup"
  const m = text.match(/^Battle (\d+) — ([^:]+): (.+)$/);
  return m ? { num: m[1], title: m[2], vs: m[3] } : null;
}

function BossCard({
  trophy,
  earned,
  toggle,
  isDone,
  getValue,
  setValue,
  children,
}: {
  trophy: Trophy;
  earned: boolean;
  toggle: (id: string, type?: string) => void;
  isDone: (id: string) => boolean;
  getValue: (id: string) => number;
  setValue: (id: string, v: number) => void;
  children?: React.ReactNode;
}) {
  return (
    <section className={`ds-boss${earned ? " earned" : ""}`}>
      <div className="ds-boss-head">
        <TrophyCheckbox
          checked={earned}
          onToggle={() => toggle(trophy.id, "trophy")}
          label={trophy.name}
        />
        <TrophyIcon type={trophy.type} size={20} dim={!earned} />
        <h2>{trophy.name}</h2>
        <p className="ds-desc">{trophy.description}</p>
      </div>
      {children}
      {trophy.note && (
        <div className="ds-note">
          <ReactMarkdown>{trophy.note}</ReactMarkdown>
        </div>
      )}
    </section>
  );
}

export default function DemonSlayerGuide({ game }: GuideProps) {
  const { isDone, toggle, getValue, setValue, completion, syncState } =
    useProgress(game.slug, game.trophies);
  const [roundDraft, setRoundDraft] = useState<string | null>(null);

  const byId = new Map(game.trophies.map((t) => [t.id, t]));
  const trials = byId.get("trials-prevailed")!;
  const survival = byId.get("to-the-death")!;
  const plat = byId.get(PLAT_ID)!;
  const rest = game.trophies.filter(
    (t) => !BOSS_IDS.includes(t.id) && t.id !== PLAT_ID
  );
  const restEarned = rest.filter((t) => isDone(t.id)).length;

  const round = getValue(survival.id);
  const commitRound = () => {
    if (roundDraft !== null) {
      const n = parseInt(roundDraft, 10);
      if (!Number.isNaN(n)) setValue(survival.id, Math.min(100, Math.max(0, n)));
      setRoundDraft(null);
    }
  };

  const battles = (trials.steps ?? []).filter((s) => battleParts(s.text));
  const prep = (trials.steps ?? []).filter((s) => !battleParts(s.text));

  return (
    <div className="ds2">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Yuji+Syuku&family=Karla:wght@400;500;700&display=swap"
      />
      <div className="wrap">
        <span className="ds-jp" aria-hidden="true">
          鬼滅の刃
        </span>
        <Link href="/" className="ds-back">
          ← Library
        </Link>

        <header className="ds-header">
          <div className="ds-header-info">
            <div className="ds-eyebrow">
              {game.developer} // {game.platform} // Two fights left
            </div>
            <h1 className="ds-title">
              Demon Slayer
              <small>Kimetsu no Yaiba — The Hinokami Chronicles 2</small>
            </h1>
            {game.platinumName && (
              <p className="ds-plat">
                <TrophyIcon type="platinum" size={15} /> {game.platinumName}
              </p>
            )}
            <div className="ds-meta">
              <span>
                Difficulty <b className="hard">{game.difficulty}/10</b> — and it is
                all one trophy
              </span>
              {game.hoursToPlat != null && (
                <span>
                  Hours <b>~{game.hoursToPlat}</b>
                </span>
              )}
              <span>
                Missable <b>0</b>
              </span>
            </div>
            <div className="ds-tiers">
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
          <ProgressRing percent={completion.percent} size={92} stroke={5}>
            <span className="ds-ring-label">{completion.percent}%</span>
          </ProgressRing>
        </header>

        <div className="ds-sticky">
          <span>
            <b>
              {completion.earned} / {completion.total}
            </b>{" "}
            collected
          </span>
          <span>
            Survival <b>{round}/100</b>
          </span>
          <span className="spacer" />
          <SyncIndicator state={syncState} />
        </div>

        {game.intro && (
          <div className="ds-intro">
            <ReactMarkdown>{game.intro}</ReactMarkdown>
          </div>
        )}

        {/* Boss 1 — Trials Prevailed */}
        <BossCard
          trophy={trials}
          earned={isDone(trials.id)}
          toggle={toggle}
          isDone={isDone}
          getValue={getValue}
          setValue={setValue}
        >
          <div className="ds-battles">
            {battles.map((s) => {
              const parts = battleParts(s.text)!;
              const sid = `${trials.id}::${s.id}`;
              const done = isDone(sid);
              return (
                <div key={s.id} className={`ds-battle${done ? " done" : ""}`}>
                  <span className="ds-battle-num ds-display">{parts.num}</span>
                  <div className="ds-battle-body">
                    <div className="ds-battle-name">{parts.title}</div>
                    <div className="ds-battle-vs">{parts.vs}</div>
                  </div>
                  <span className="ds-srank" aria-hidden="true">
                    S
                  </span>
                  <TrophyCheckbox
                    checked={done}
                    onToggle={() => toggle(sid, "step")}
                    label={`S rank — ${parts.title}`}
                    small
                  />
                </div>
              );
            })}
          </div>
          <details className="ds-steps">
            <summary>Prep &amp; verification</summary>
            {prep.map((s) => {
              const sid = `${trials.id}::${s.id}`;
              return (
                <div key={s.id} className={`ds-step${isDone(sid) ? " done" : ""}`}>
                  <TrophyCheckbox
                    checked={isDone(sid)}
                    onToggle={() => toggle(sid, "step")}
                    label={s.text}
                    small
                  />
                  <span className="ds-step-text">{s.text}</span>
                </div>
              );
            })}
          </details>
        </BossCard>

        {/* Boss 2 — To the Death */}
        <BossCard
          trophy={survival}
          earned={isDone(survival.id)}
          toggle={toggle}
          isDone={isDone}
          getValue={getValue}
          setValue={setValue}
        >
          <div className="ds-boss-grid">
            <div className="ds-blade-col">
              <NichirinBlade round={isDone(survival.id) ? 100 : round} />
            </div>
            <div>
              <div className="ds-counter-row">
                <span className="ds-counter-label">Current round</span>
                <input
                  type="number"
                  className="ds-counter-input"
                  min={0}
                  max={100}
                  value={roundDraft ?? round}
                  aria-label="Current Survival round"
                  onChange={(e) => setRoundDraft(e.target.value)}
                  onBlur={commitRound}
                  onKeyDown={(e) => e.key === "Enter" && commitRound()}
                />
                <span className="ds-counter-total">/ 100</span>
                <button
                  type="button"
                  className="ds-plus"
                  aria-label="Advance one round"
                  onClick={() => setValue(survival.id, Math.min(100, round + 1))}
                >
                  +1
                </button>
              </div>
              <details className="ds-steps" open>
                <summary>Run protocol</summary>
                {(survival.steps ?? []).map((s) => {
                  const sid = `${survival.id}::${s.id}`;
                  return (
                    <div key={s.id} className={`ds-step${isDone(sid) ? " done" : ""}`}>
                      <TrophyCheckbox
                        checked={isDone(sid)}
                        onToggle={() => toggle(sid, "step")}
                        label={s.text}
                        small
                      />
                      <span className="ds-step-text">{s.text}</span>
                    </div>
                  );
                })}
              </details>
            </div>
          </div>
        </BossCard>

        {/* platinum */}
        <div className="ds-platrow">
          <TrophyCheckbox
            checked={isDone(plat.id)}
            onToggle={() => toggle(plat.id, "trophy")}
            label={plat.name}
            small
          />
          <TrophyIcon type="platinum" size={16} dim={!isDone(plat.id)} />
          <span>
            <b>{plat.name}</b> — falls out the far end once the two above are done.
          </span>
        </div>

        {/* everything else */}
        <details className="ds-rail">
          <summary>
            The other {rest.length} — <b>{restEarned}</b> banked
          </summary>
          <div className="ds-rail-list">
            {rest.map((t) => (
              <span key={t.id} className={`ds-chip${isDone(t.id) ? " earned" : ""}`}>
                <TrophyIcon type={t.type} size={12} dim={!isDone(t.id)} />
                {t.name}
                <TrophyCheckbox
                  checked={isDone(t.id)}
                  onToggle={() => toggle(t.id, "trophy")}
                  label={t.name}
                  small
                />
              </span>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
