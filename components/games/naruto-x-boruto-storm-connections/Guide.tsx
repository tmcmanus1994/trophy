"use client";

import "./theme.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/lib/useProgress";
import type { GuideProps, Trophy } from "@/lib/types";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";

/* The 8 still in play; everything else was banked on the Nov 2023 run and
   gets seeded additively on first load. */
const REMAINING = new Set([
  "perfect-storm-master",
  "customize-and-win",
  "league-champ",
  "ninja-gathering",
  "seeking-more-power",
  "supreme-domain",
  "rich-in-knowledge",
  "multi-title-holder",
]);

const GRIND_IDS = ["ninja-gathering", "multi-title-holder", "rich-in-knowledge"];
const PROF_SLOTS = ["prof1", "prof2", "prof3", "prof4", "prof5"];
const PROF_TARGET = 30;

const ARCHIVE_GROUPS: Array<[string, string]> = [
  ["p1", "History Mode"],
  ["p2", "Special Story Mode"],
  ["p3", "Combat one-offs"],
  ["p4", "Free Battle modes"],
  ["p5", "Collection"],
];

/* Rasengan gauge: cyan chakra ring spiraling around an orange core that
   fills with the count — ignites gold when the target is hit. */
function RasenGauge({
  value,
  target,
  size = 96,
  label,
}: {
  value: number;
  target: number;
  size?: number;
  label: string;
}) {
  const p = Math.min(1, Math.max(0, value / target));
  const lit = value >= target;
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const coreMax = r - 9;
  const core = 4 + (coreMax - 4) * p;
  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`${label}: ${value} of ${target}`}
      style={lit ? { filter: "drop-shadow(0 0 10px rgba(255,201,60,0.65))" } : undefined}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0a0a0c" strokeWidth="7" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#122c56" strokeWidth="4" />
      {p > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={lit ? "#ffc93c" : "#2bb8f0"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${p * c} ${c - p * c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
      {/* inner swirl hint — only once the chakra starts spinning */}
      {p > 0.1 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={core + 4}
          fill="none"
          stroke={lit ? "rgba(255,201,60,0.5)" : "rgba(43,184,240,0.45)"}
          strokeWidth="1.5"
          strokeDasharray="7 9"
          transform={`rotate(${p * 260} ${size / 2} ${size / 2})`}
        />
      )}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={core}
        fill={lit ? "#ffc93c" : "#f26b1d"}
        stroke="#0a0a0c"
        strokeWidth="2"
        opacity={p === 0 ? 0.25 : 1}
      />
      <text
        x="50%"
        y="51%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize={size * 0.2}
        fill={p > 0.35 ? "#0a0a0c" : "#eaf2fb"}
      >
        {value}
      </text>
    </svg>
  );
}

function Counter({
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
    <span className="counter">
      <input
        type="number"
        className="count-input"
        min={0}
        max={target}
        value={draft ?? value}
        aria-label={`${label} count`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
      <span className={`count-total${full ? " full" : ""}`}>/ {target}</span>
      <button
        type="button"
        className="plus"
        aria-label={`Add one to ${label}`}
        onClick={() => onCommit(Math.min(target, value + 1))}
      >
        +1
      </button>
    </span>
  );
}

export default function NarutoGuide({ game }: GuideProps) {
  const { isDone, toggle, markDone, getValue, setValue, completion, syncState } =
    useProgress(game.slug, game.trophies);

  /* One-time additive seed of the 37 already-earned trophies. */
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (syncState !== "synced" && syncState !== "local") return;
    seededRef.current = true;
    for (const t of game.trophies) {
      if (!REMAINING.has(t.id)) markDone(t.id, "trophy");
    }
  }, [syncState, markDone, game.trophies]);

  const byId = new Map(game.trophies.map((t) => [t.id, t]));
  const t = (id: string) => byId.get(id) as Trophy;

  const profValue = (slot: string) => getValue(`supreme-domain::${slot}`);
  const profDone = PROF_SLOTS.filter((s) => profValue(s) >= PROF_TARGET).length;
  const grindValue = (id: string) => getValue(`${id}::count`);

  /* Derived clears: counter targets met, or the trophy actually marked. */
  const derived = (id: string): boolean => {
    if (isDone(id)) return true;
    if (GRIND_IDS.includes(id)) return grindValue(id) >= 100;
    if (id === "seeking-more-power") return profDone >= 1;
    if (id === "supreme-domain") return profDone >= 5;
    if (id === "perfect-storm-master")
      return [...REMAINING].filter((x) => x !== "perfect-storm-master").every(derived);
    return false;
  };

  const effEarned =
    completion.earned +
    game.trophies.filter((x) => !isDone(x.id) && derived(x.id)).length;
  const overall = Math.round((effEarned / completion.total) * 100);
  const remainingCount = [...REMAINING].filter((id) => !derived(id)).length;

  const earnedCheck = (id: string) => (
    <input
      type="checkbox"
      checked={isDone(id)}
      onChange={() => toggle(id, "trophy")}
      aria-label={`Mark ${t(id).name} earned`}
    />
  );

  const stepChecks = (trophy: Trophy, only?: (sid: string) => boolean) => (
    <div className="steps">
      {(trophy.steps ?? [])
        .filter((s) => !s.target && (!only || only(s.id)))
        .map((s) => {
          const sid = `${trophy.id}::${s.id}`;
          return (
            <label key={s.id} className={`step${isDone(sid) ? " done" : ""}`}>
              <input
                type="checkbox"
                checked={isDone(sid)}
                onChange={() => toggle(sid, "step")}
              />
              <span>{s.text}</span>
            </label>
          );
        })}
    </div>
  );

  const trophyHead = (id: string, extra?: React.ReactNode) => (
    <div className="grind-head">
      <TrophyIcon type={t(id).type} size={16} dim={!derived(id)} />
      <span className={derived(id) ? "earned-mark" : undefined}>
        <span className="tname">{t(id).name}</span>
      </span>
      {extra}
      <span className="spacer" />
      {derived(id) && !isDone(id) && <span className="pill gold">Target met</span>}
      {earnedCheck(id)}
    </div>
  );

  return (
    <div className="nxb">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;600;700&display=swap"
      />
      <div className="wrap">
        <header>
          <div className="title-block">
            <p className="kicker">
              <Link href="/">← Trophy Room</Link> &nbsp;/&nbsp; {game.platform}{" "}
              &nbsp;/&nbsp; {game.developer}
            </p>
            <h1 style={{ marginTop: 14 }}>
              <span className="sub-title">Naruto x Boruto</span>
              <br />
              <span className="disp">
                Storm <span style={{ color: "var(--orange)" }}>Connections</span>
              </span>
            </h1>
            <p className="plat-line">
              <TrophyIcon type="platinum" size={15} /> {game.platinumName} —{" "}
              {remainingCount} to go, none missable, nothing skill-gated
            </p>
            <div className="meta-row">
              <span>
                Difficulty <b>{game.difficulty}/10</b>
              </span>
              <span>
                Left <b>~15–20h</b>
              </span>
              <span>
                {(["platinum", "gold", "silver", "bronze"] as const)
                  .map(
                    (type) =>
                      `${completion.byType[type].earned}/${completion.byType[type].total}`
                  )
                  .join(" · ")}{" "}
                <b>P·G·S·B</b>
              </span>
              <SyncIndicator state={syncState} />
            </div>
          </div>
          <div className="ring-col">
            <RasenGauge
              value={overall}
              target={100}
              size={150}
              label="Overall completion percent"
            />
            <p className="lbl">
              {effEarned}/{completion.total} — chakra at {overall}%
            </p>
          </div>
        </header>

        {/* ---------- quick wins ---------- */}
        <section>
          <div className="sec-head">
            <h2>
              <span className="disp">
                Quick <span className="accent">Wins</span>
              </span>
            </h2>
            <span className="sec-note">20 minutes combined — do these tonight</span>
          </div>
          <div className="qgrid">
            {(["customize-and-win", "league-champ"] as const).map((id) => (
              <div key={id} className="panel orange">
                {trophyHead(id)}
                <p className="tdesc">{t(id).description}</p>
                {stepChecks(t(id))}
                {t(id).note && (
                  <div className="tnote">
                    <ReactMarkdown>{t(id).note!}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ---------- the braided grind ---------- */}
        <section>
          <div className="sec-head">
            <h2>
              <span className="disp">
                One Grind, <span className="accent">Three Trophies</span>
              </span>
            </h2>
            <span className="sec-note">
              Themed trios → Ultimate Survival team matches → all three climb
            </span>
          </div>
          <div className="panel">
            <div className="braid">
              {GRIND_IDS.map((id) => {
                const val = grindValue(id);
                const target = t(id).counter ?? 100;
                const met = val >= target;
                return (
                  <div key={id} className={`grind${met ? " met" : ""}`}>
                    {trophyHead(
                      id,
                      <Counter
                        value={val}
                        target={target}
                        onCommit={(n) => setValue(`${id}::count`, n)}
                        label={t(id).name}
                      />
                    )}
                    <p className="tdesc">{t(id).description}</p>
                    <div className={`cbar${met ? " full" : ""}`}>
                      <i style={{ width: `${Math.min(100, (val / target) * 100)}%` }} />
                    </div>
                    {stepChecks(t(id))}
                    {t(id).note && (
                      <div className="tnote">
                        <ReactMarkdown>{t(id).note!}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- supreme domain ---------- */}
        <section>
          <div className="sec-head">
            <h2>
              <span className="disp">
                Supreme <span style={{ color: "var(--crimson)" }}>Domain</span>
              </span>
            </h2>
            <span className="sec-note">Five at Proficiency 30 — this IS the platinum</span>
          </div>
          <div className="panel crimson">
            {trophyHead("supreme-domain")}
            <p className="tdesc">{t("supreme-domain").description}</p>

            <div className="sphere-row">
              {PROF_SLOTS.map((slot, i) => {
                const val = profValue(slot);
                return (
                  <div key={slot} className={`sphere${val >= PROF_TARGET ? " lit" : ""}`}>
                    <RasenGauge
                      value={val}
                      target={PROF_TARGET}
                      label={`Slot ${i + 1} proficiency`}
                    />
                    <p className="slot-lbl">Slot {i + 1}</p>
                    <Counter
                      value={val}
                      target={PROF_TARGET}
                      onCommit={(n) => setValue(`supreme-domain::${slot}`, n)}
                      label={`Slot ${i + 1} proficiency`}
                    />
                  </div>
                );
              })}
            </div>

            <div
              className="grind-head"
              style={{ marginTop: 6, justifyContent: "center", gap: 8 }}
            >
              <TrophyIcon type="silver" size={14} dim={!derived("seeking-more-power")} />
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                <b>Seeking More Power</b> pops at the first sphere
              </span>
              {derived("seeking-more-power") && !isDone("seeking-more-power") && (
                <span className="pill gold">Target met</span>
              )}
              {earnedCheck("seeking-more-power")}
            </div>

            {stepChecks(t("supreme-domain"))}
            <div className="warn">
              <b>Pick your five on day one and never deviate.</b> Leader gets
              ~6,000 XP per stretched match (up to ~14,000 with the right tool
              loadout), supports ~1,200–2,300. Spreading XP across a dozen
              characters is the classic way to double this grind. If settings
              don&rsquo;t apply after a match, restart the application.
            </div>
          </div>
        </section>

        {/* ---------- platinum ---------- */}
        <section>
          <div
            className={`panel gold plat-card${derived("perfect-storm-master") ? " ready" : ""}`}
          >
            <TrophyIcon type="platinum" size={26} dim={!derived("perfect-storm-master")} />
            <div style={{ flex: 1 }}>
              <span
                className={derived("perfect-storm-master") ? "earned-mark" : undefined}
              >
                <span className="tname">Perfect Storm Master</span>
              </span>
              <p className="tdesc">
                Falls out the far end once the seven above are in.
              </p>
            </div>
            {derived("perfect-storm-master") && !isDone("perfect-storm-master") && (
              <span className="pill gold">Target met</span>
            )}
            {earnedCheck("perfect-storm-master")}
          </div>
        </section>

        {/* ---------- archive ---------- */}
        <section>
          <details className="archive">
            <summary>
              <span className="disp">Banked — November 2023</span>
              <span className="pill cyan">
                {game.trophies.filter((x) => !REMAINING.has(x.id) && isDone(x.id)).length}
                /37 cleared
              </span>
              <span className="sec-note" style={{ marginLeft: "auto" }}>
                History · Special Story · S-ranks · Survival · Collector
              </span>
            </summary>
            <div className="arch-body">
              {ARCHIVE_GROUPS.map(([phase, title]) => {
                const list = game.trophies.filter(
                  (x) => x.phase === phase && !REMAINING.has(x.id)
                );
                if (list.length === 0) return null;
                return (
                  <div key={phase} className="arch-group">
                    <h3>{title}</h3>
                    <div className="arch-list">
                      {list.map((x) => (
                        <label key={x.id} className="arch-item">
                          <input
                            type="checkbox"
                            checked={isDone(x.id)}
                            onChange={() => toggle(x.id, "trophy")}
                          />
                          <TrophyIcon type={x.type} size={12} dim={!isDone(x.id)} />
                          {x.name}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        </section>

        <footer>
          <p>
            Counters and checkboxes sync to your Trophy Room account across
            devices. Cmd/Ctrl+Z undoes an accidental change. The five
            proficiency spheres ignite gold at 30 — that row is the platinum.
          </p>
        </footer>
      </div>
    </div>
  );
}
