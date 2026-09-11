"use client";

import "./theme.css";
import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/lib/useProgress";
import type { GuideProps, Trophy } from "@/lib/types";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";

/* Boss ledger: story-kill trophy ←→ Carnage-rematch step on
   glutton-for-punishment. One row tracks both. */
const BOSSES: Array<{ trophyId: string; step: string; name: string; chapter: string }> = [
  { trophyId: "onimusha-showdown", step: "b1", name: "Sasaki Ganryu", chapter: "Kiyomizu-dera Temple" },
  { trophyId: "get-stuffed", step: "b2", name: "Daidara", chapter: "Oni Refuge" },
  { trophyId: "twisted-fates", step: "b3", name: "Rasho-gan", chapter: "Be Careful What You Wish For" },
  { trophyId: "howling-wind", step: "b4", name: "Ifuu", chapter: "Windswept Kennin-ji" },
  { trophyId: "dokyos-fixation", step: "b5", name: "Greater Nue", chapter: "Kyoto Imperial Palace" },
  { trophyId: "benkei-out-but-not-down", step: "b6", name: "Benkei", chapter: "Bloodbath on the Bridge" },
  { trophyId: "crashing-lightning", step: "b7", name: "Burai", chapter: "A Tempest at the Temple" },
  { trophyId: "wide-awake", step: "b8", name: "Shuten Doji", chapter: "The Demon on the Mount" },
  { trophyId: "the-perfect-storm", step: "b9", name: "Ifuu & Burai", chapter: "Storm Chaser" },
  { trophyId: "we-done-here", step: "b10", name: "Sasaki Ganryu", chapter: "Arashiyama" },
  { trophyId: "end-this-madness", step: "b11", name: "Dokyo", chapter: "End of Arashiyama" },
  { trophyId: "baited-by-benkei", step: "b12", name: "Benkei", chapter: "Rendaino" },
  { trophyId: "truly-thank-you", step: "b13", name: "Minamoto no Yoshitsune", chapter: "The Clash at Rendaino" },
];

const NO_DRILL = new Set([
  "deadeye",
  "pinch-hitter",
  "untouchable",
  "winning-is-what-matters",
  "silent-violence",
]);
const DRILL = new Set([
  "burning-blade",
  "stop-motion",
  "wielder-of-oni-armaments",
  "onis-oni",
  "brutalist",
  "flow-state",
  "helm-splitter",
]);

const P1_SIMPLE = [
  "mystery-solved",
  "life-saver",
  "no-dog-left-behind",
  "selfish-selflessness",
  "looking-sharp",
  "berserker",
  "get-this-thing-off-me",
];
const P1_COUNTERS = [
  "citizen-savior",
  "coming-through",
  "deadeye",
  "pinch-hitter",
  "untouchable",
  "winning-is-what-matters",
  "silent-violence",
];
const P2_COLLECT = [
  "demystified",
  "no-job-too-small",
  "oni-armory",
  "for-the-love-of-dog",
  "charmed-life",
  "medical-marvel",
];
const P2_SIMPLE = ["serves-you-right", "health-is-wealth", "a-real-charmer", "genma-griller"];
const P2_DRILLS = [
  "burning-blade",
  "stop-motion",
  "wielder-of-oni-armaments",
  "onis-oni",
  "brutalist",
  "flow-state",
  "helm-splitter",
];
const P3_LIST = ["genma-ologist", "the-winding-way-of-the-sword", "well-rounded", "dressed-to-kill"];

/* The Oni gauntlet eye — brass setting, blue-violet orb filling with the
   completion percent, soul motes drifting at the rim. */
function OniEye({ percent, size = 148 }: { percent: number; size?: number }) {
  const p = Math.min(100, Math.max(0, percent)) / 100;
  const cx = size / 2;
  const r = size / 2 - 12;
  const orbR = r - 8;
  const fillY = cx + orbR - 2 * orbR * p;
  const full = p >= 1;
  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`${Math.round(p * 100)}% complete`}
      style={full ? { filter: "drop-shadow(0 0 14px rgba(90,108,255,0.7))" } : undefined}
    >
      <defs>
        <radialGradient id="oni-orb" cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="#8f9cff" />
          <stop offset="0.55" stopColor="#5a6cff" />
          <stop offset="1" stopColor="#2c3390" />
        </radialGradient>
        <linearGradient id="oni-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8b273" />
          <stop offset="0.5" stopColor="#b8925a" />
          <stop offset="1" stopColor="#6d5636" />
        </linearGradient>
        <clipPath id="oni-fill">
          <rect x="0" y={fillY} width={size} height={size - fillY} />
        </clipPath>
      </defs>
      {/* brass setting */}
      <circle cx={cx} cy={cx} r={r + 6} fill="none" stroke="url(#oni-brass)" strokeWidth="5" />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#0a0a0c" strokeWidth="4" />
      {/* dark socket */}
      <circle cx={cx} cy={cx} r={orbR} fill="#10131f" />
      {/* filling orb */}
      {p > 0 && (
        <circle cx={cx} cy={cx} r={orbR} fill="url(#oni-orb)" clipPath="url(#oni-fill)" />
      )}
      {/* glass highlight */}
      <ellipse cx={cx - orbR * 0.3} cy={cx - orbR * 0.45} rx={orbR * 0.32} ry={orbR * 0.18} fill="rgba(255,255,255,0.18)" />
      {/* soul motes */}
      <circle cx={cx - r - 2} cy={cx - 14} r="2.3" fill="#a3201e" opacity="0.75" />
      <circle cx={cx + r + 1} cy={cx + 10} r="2" fill="#5a6cff" opacity="0.8" />
      <circle cx={cx - 10} cy={cx + r + 5} r="1.8" fill="#9a6cff" opacity="0.7" />
      <text
        x="50%"
        y="53%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Cinzel, serif"
        fontWeight="700"
        fontSize={size * 0.17}
        fill={p > 0.42 ? "#e9ecff" : "#8b93b8"}
      >
        {Math.round(p * 100)}%
      </text>
    </svg>
  );
}

/* Single ink-brush slash — the section divider. */
function Slash() {
  return (
    <svg className="slash" viewBox="0 0 1000 26" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 20 Q 320 24 520 12 T 1000 4 L 1000 7 Q 660 16 480 18 T 0 23 Z"
        fill="rgba(184,146,90,0.35)"
      />
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
        className="count-input num"
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

export default function OnimushaGuide({ game }: GuideProps) {
  const { isDone, toggle, getValue, setValue, completion, syncState } =
    useProgress(game.slug, game.trophies);

  const byId = new Map(game.trophies.map((t) => [t.id, t]));
  const t = (id: string) => byId.get(id) as Trophy;
  const phases = game.phases ?? [];
  const phase = (id: string) => phases.find((p) => p.id === id);

  const countOf = (id: string) => getValue(`${id}::count`);

  const check = (id: string) => (
    <input
      type="checkbox"
      checked={isDone(id)}
      onChange={() => toggle(id, "trophy")}
      aria-label={`Mark ${t(id).name} earned`}
    />
  );

  const note = (id: string) =>
    t(id).note ? (
      <div className="tnote">
        <ReactMarkdown>{t(id).note!}</ReactMarkdown>
      </div>
    ) : null;

  const stepList = (trophy: Trophy, single = false) => (
    <div className={`steps${single ? " single" : ""}`}>
      {(trophy.steps ?? [])
        .filter((s) => !s.target)
        .map((s) => {
          const sid = `${trophy.id}::${s.id}`;
          return (
            <label key={s.id} className={`step${isDone(sid) ? " done" : ""}`}>
              <input type="checkbox" checked={isDone(sid)} onChange={() => toggle(sid, "step")} />
              <span>{s.text}</span>
            </label>
          );
        })}
    </div>
  );

  const targetSteps = (trophy: Trophy) =>
    (trophy.steps ?? [])
      .filter((s) => s.target)
      .map((s) => {
        const sid = `${trophy.id}::${s.id}`;
        const val = getValue(sid);
        return (
          <div key={s.id} className="thead-line" style={{ marginTop: 8 }}>
            <span style={{ fontSize: 14, color: "var(--text-2)" }}>{s.text}</span>
            <span className="spacer" />
            <Counter value={val} target={s.target!} onCommit={(n) => setValue(sid, n)} label={s.text} />
          </div>
        );
      });

  /* Full trophy row: checkbox, tier, name, badge, counter meter, steps, note. */
  const row = (id: string) => {
    const trophy = t(id);
    const done = isDone(id);
    const cval = trophy.counter ? countOf(id) : 0;
    const met = trophy.counter ? cval >= trophy.counter : false;
    return (
      <div key={id} className={`trow${done ? " done" : ""}`}>
        {check(id)}
        <div className="body">
          <div className="thead-line">
            <TrophyIcon type={trophy.type} size={15} dim={!done} />
            <span className="tname">{trophy.name}</span>
            {NO_DRILL.has(id) && <span className="badge nodrill">No drill — story only</span>}
            {DRILL.has(id) && <span className="badge drill">Drill available</span>}
            {met && !done && <span className="badge met">Target met</span>}
            <span className="spacer" />
            {trophy.counter && (
              <Counter
                value={cval}
                target={trophy.counter}
                onCommit={(n) => setValue(`${id}::count`, n)}
                label={trophy.name}
              />
            )}
          </div>
          <p className="tdesc">{trophy.description}</p>
          {trophy.counter && (
            <div className={`cbar${met ? " full" : ""}`}>
              <i style={{ width: `${Math.min(100, (cval / trophy.counter) * 100)}%` }} />
            </div>
          )}
          {trophy.steps && trophy.steps.some((s) => !s.target) && id !== "glutton-for-punishment" && (
            stepList(trophy, trophy.id === "charmed-life")
          )}
          {targetSteps(trophy)}
          {note(id)}
        </div>
      </div>
    );
  };

  const phaseHead = (pid: string, ord: string) => (
    <>
      <div className="phase-head">
        <span className="ord">{ord}</span>
        <h2>{phase(pid)?.title}</h2>
      </div>
      <p className="phase-sum">{phase(pid)?.summary}</p>
    </>
  );

  const carnage = (step: string) => `glutton-for-punishment::${step}`;
  const rematchDone = BOSSES.filter((b) => isDone(carnage(b.step))).length;

  return (
    <div className="oni">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap"
      />
      <div className="wrap">
        <span className="kanji" aria-hidden="true">
          鬼武者
        </span>

        <header>
          <div className="title-block">
            <p className="kicker">
              <Link href="/">← Trophy Room</Link> &nbsp;·&nbsp; {game.platform}{" "}
              &nbsp;·&nbsp; {game.developer}, 2026
            </p>
            <h1>
              <span className="disp">Onimusha</span>
              <span className="way">Way of the Sword</span>
            </h1>
            <p className="plat-line">
              <TrophyIcon type="platinum" size={15} /> {game.platinumName} — fresh
              start, nothing missable, two runs
            </p>
            <div className="meta-row">
              <span>
                Difficulty <b>6.5/10</b>
              </span>
              <span>
                Hours <b>~{game.hoursToPlat}</b>
              </span>
              <span>
                Runs <b>{game.playthroughs}</b>
              </span>
              <span className="num">
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
          <div className="eye-col">
            <OniEye percent={completion.percent} />
            <p className="lbl">
              {completion.earned}/{completion.total} — the eye awakens
            </p>
          </div>
        </header>

        {/* ═══ Phase I ═══ */}
        <Slash />
        <section className="phase">
          {phaseHead("p1", "I")}
          <div className="panel">
            <p className="panel-title">Habits for the blind run</p>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-2)", fontSize: 14.5 }}>
              <li>Buy the three <b>Oni Vision</b> skills first.</li>
              <li><b>Hoard consumables</b> — every talisman and restorative is for Carnage.</li>
              <li><b>Talk to every townsperson you save</b> — the rescue only counts after the conversation.</li>
              <li>Chip at the five no-drill counters below whenever the chance appears.</li>
            </ul>
          </div>
          <div className="panel">
            <p className="panel-title">Along the way</p>
            {P1_SIMPLE.map(row)}
          </div>
          <div className="panel">
            <p className="panel-title">Combat counters — story habits</p>
            {P1_COUNTERS.map(row)}
          </div>
        </section>

        {/* ═══ The gate ═══ */}
        <div className="gate">
          <p className="disp">Point of No Return</p>
          <p>
            Before <b>&ldquo;The Clash at Rendaino&rdquo;</b> — nothing is
            missable, but the cleanup save lives on this line.{" "}
            <b>Manual save here</b>, then sweep everything below before touching
            the finale.
          </p>
        </div>

        {/* ═══ Phase II ═══ */}
        <section className="phase" style={{ marginTop: 40 }}>
          {phaseHead("p2", "II")}
          <div className="grid2">
            {P2_COLLECT.map((id) => (
              <div key={id} className="panel">
                {row(id)}
              </div>
            ))}
          </div>
          <div className="panel" style={{ marginTop: 14 }}>
            <p className="panel-title">Pre-finale one-offs</p>
            {P2_SIMPLE.map(row)}
          </div>
          <div className="panel">
            <p className="panel-title">Counter sweep — Practice Grounds</p>
            {P2_DRILLS.map(row)}
          </div>
        </section>

        {/* ═══ Phase III ═══ */}
        <Slash />
        <section className="phase">
          {phaseHead("p3", "III")}
          <div className="panel">{P3_LIST.map(row)}</div>
        </section>

        {/* ═══ NG+ carryover ═══ */}
        <div className="carry">
          <div className="col">
            <h3>Carries into NG+</h3>
            <ul>
              <li>Skills &amp; Oni abilities</li>
              <li>Hozuki Pouches &amp; Charms</li>
              <li>Items (not enhancement materials)</li>
              <li>Genma Notes</li>
              <li>Lion Dogs</li>
            </ul>
          </div>
          <div className="col no">
            <h3>Does not carry</h3>
            <ul>
              <li>Mysteries of Kyoto</li>
              <li>Chance Encounters</li>
              <li>Clothing / Sword / Gauntlet enhancements</li>
              <li>Red Souls</li>
              <li>Spirit Mirror unlocks</li>
            </ul>
          </div>
        </div>

        {/* ═══ Phase IV ═══ */}
        <Slash />
        <section className="phase">
          {phaseHead("p4", "IV")}
          <div className="panel" style={{ borderColor: "var(--crimson)" }}>
            {row("true-onimusha")}
          </div>
        </section>

        {/* ═══ Phase V ═══ */}
        <Slash />
        <section className="phase">
          {phaseHead("p5", "V")}
          <div className="panel">{row("second-helping")}</div>
          <div className="panel">
            <div className="thead-line" style={{ marginBottom: 12 }}>
              <p className="panel-title" style={{ marginBottom: 0 }}>
                Boss Ledger
              </p>
              <span className="spacer" />
              <span className="badge gold num">
                {rematchDone}/13 Carnage rematches
              </span>
            </div>
            <div className="ledger-head">
              <span>Boss</span>
              <span>Story</span>
              <span>Carnage</span>
            </div>
            {BOSSES.map((b) => {
              const slain = isDone(b.trophyId);
              return (
                <div key={b.step} className={`boss-row${slain ? " slain" : ""}`}>
                  <div>
                    <span className="boss-name">{b.name}</span>{" "}
                    <span className="boss-chapter">— {b.chapter}</span>
                  </div>
                  <span className="chk">{check(b.trophyId)}</span>
                  <span className="chk">
                    <input
                      type="checkbox"
                      checked={isDone(carnage(b.step))}
                      onChange={() => toggle(carnage(b.step), "step")}
                      aria-label={`${b.name} beaten in Carnage rematch`}
                    />
                  </span>
                  {t(b.trophyId).note && (
                    <details>
                      <summary />
                      <div className="bnote">
                        <ReactMarkdown>{t(b.trophyId).note!}</ReactMarkdown>
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
            {note("glutton-for-punishment")}
            <div className="thead-line" style={{ marginTop: 12 }}>
              <TrophyIcon type="gold" size={15} dim={!isDone("glutton-for-punishment")} />
              <span className="tname">Glutton for Punishment</span>
              <span className="spacer" />
              {check("glutton-for-punishment")}
            </div>
          </div>
        </section>

        {/* ═══ Platinum ═══ */}
        <div className={`plat-card${isDone("peerless") ? " ready" : ""}`}>
          <TrophyIcon type="platinum" size={26} dim={!isDone("peerless")} />
          <div style={{ flex: 1 }}>
            <span className="tname">Peerless</span>
            <p className="tdesc">
              Earn all trophies. No DLC, two playthroughs, ~60–70 hours of the
              sword&rsquo;s winding way.
            </p>
          </div>
          {check("peerless")}
        </div>

        <footer>
          <p>
            Checkboxes and counters sync to your Trophy Room account.
            Cmd/Ctrl+Z undoes an accidental tick. When Peerless lands it joins
            the Platinum Vault on its own.
          </p>
        </footer>
      </div>
    </div>
  );
}
