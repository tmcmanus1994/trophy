"use client";

import "./theme.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/useProgress";
import type { GuideProps } from "@/lib/types";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";
import {
  SIX,
  FIRST,
  RUN1,
  RUN2,
  MAGS,
  TRAPS,
  CHAPTERS,
  DEATH_IDS,
  MAG_IDS,
  TROPHY_GATES,
  SEED_DONE_IDS,
  type PlanRow,
  type PlanChapter,
  type MagItem,
} from "./data";

/* Plan rows live in the progress DB as `plan::<id>` step entries; the six
   trophy ids stay the real content ids so sync and library stats agree. */
const pid = (id: string) => `plan::${id}`;

const pillClass = (m: string) =>
  m.startsWith("#")
    ? "pill flag"
    : /Death|Trophy|Platinum/.test(m)
      ? "pill blue"
      : "pill";

type MagFilter = "all" | "todo" | "branch" | "r1" | "r2";

const FILTERS: Array<[MagFilter, string]> = [
  ["all", "All 46"],
  ["todo", "Not yet read"],
  ["branch", "Branch-locked"],
  ["r1", "Run 01"],
  ["r2", "Run 02"],
];

function Row({
  row,
  done,
  onToggle,
}: {
  row: PlanRow;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <label className={`row ${row.k}${done ? " done" : ""}`}>
      <input type="checkbox" checked={done} onChange={onToggle} />
      <div>
        <p className="txt" dangerouslySetInnerHTML={{ __html: row.txt }} />
        {row.met && (
          <p className="met">
            {row.met.map((m) => (
              <span key={m} className={pillClass(m)}>
                {m}
              </span>
            ))}
          </p>
        )}
        {row.why && <p className="why">{row.why}</p>}
      </div>
    </label>
  );
}

export default function DetroitGuide({ game }: GuideProps) {
  const { isDone, toggle, markDone, completion, syncState } = useProgress(
    game.slug,
    game.trophies
  );
  const [filter, setFilter] = useState<MagFilter>("todo");

  const pDone = (id: string) => isDone(pid(id));
  const pToggle = (id: string) => toggle(pid(id), "step");

  /* One-time additive seed: magazines confirmed in the Extras menu (and the
     spine rows they fully cover) get marked done after the first sync
     reconcile, so they land in the account like any other check. */
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (syncState !== "synced" && syncState !== "local") return;
    seededRef.current = true;
    for (const id of SEED_DONE_IDS) markDone(pid(id), "step");
  }, [syncState, markDone]);

  /* A trophy counts as cleared once it's actually marked earned OR every
     plan row gating it is checked (the platinum follows the other five). */
  const gateCleared = (trophyId: string): boolean => {
    if (isDone(trophyId)) return true;
    if (trophyId === "detroit-master") {
      return SIX.filter((s) => s.id !== "detroit-master").every((s) =>
        gateCleared(s.id)
      );
    }
    const gates = TROPHY_GATES[trophyId];
    return !!gates && gates.every(pDone);
  };

  const count = (ids: string[]) => ids.filter(pDone).length;
  const mags = count(MAG_IDS);
  const deaths = count(DEATH_IDS);
  const troph = SIX.filter((t) => gateCleared(t.id)).length;

  const r1Ids = RUN1.flatMap((c) => c.rows.map((r) => r.id));
  const r2Ids = RUN2.flatMap((c) => c.rows.map((r) => r.id));

  /* Overall % — real earned trophies plus any of the six whose gates are
     fully checked but which haven't been marked earned yet. */
  const effEarned =
    completion.earned +
    SIX.filter((t) => !isDone(t.id) && gateCleared(t.id)).length;
  const overall =
    completion.total === 0
      ? 0
      : Math.round((effEarned / completion.total) * 100);

  const magVisible = (it: MagItem, groupRun: 1 | 2) => {
    const run = it.run ?? groupRun;
    switch (filter) {
      case "todo":
        return !pDone(`mag-${it.n}`);
      case "branch":
        return !!it.b;
      case "r1":
        return run === 1;
      case "r2":
        return run === 2;
      default:
        return true;
    }
  };

  const renderChapter = (c: PlanChapter) => {
    const act = c.rows.some((r) => r.k !== "magz");
    return (
      <div key={c.ch + c.name} className={`ch ${act ? "act" : "mag"}`}>
        <div className="card brk">
          <div className="ch-head">
            <span className="ch-num">{c.ch}</span>
            <span className="ch-name">{c.name}</span>
            <span className="ch-who">{c.who}</span>
          </div>
          <div className="ch-body">
            {c.rows.map((r) => (
              <Row
                key={r.id}
                row={r}
                done={pDone(r.id)}
                onToggle={() => pToggle(r.id)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dbh6">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Saira:wght@200;300;400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
      />
      <div className="wrap">
        <header>
          <p className="eyebrow">
            <Link href="/">← Trophy Room</Link> &nbsp;/&nbsp; {game.platform}{" "}
            &nbsp;/&nbsp; {game.developer}, 2018
          </p>
          <div style={{ marginTop: 14 }}>
            <p className="pct">
              {overall}% <span>COMPLETE</span>
            </p>
            <div className="rule" />
            <h1>
              Detroit:
              <br />
              The Last Six
            </h1>
          </div>
          <p className="sub">
            Forty-three down. The story is finished and every fork you took is
            locked into the flowchart — so this isn&rsquo;t a walkthrough,
            it&rsquo;s a demolition plan for the six that are left. One hostile
            playthrough clears four of them at once and picks up three of the
            four branch-locked magazines still missing on the way past.
          </p>

          <div className="meters">
            <div className="meter">
              <p className="n">
                <b>{troph}</b>/6
              </p>
              <p className="eyebrow l">Trophies cleared</p>
              <span className="bar">
                <i style={{ width: `${(troph / 6) * 100}%` }} />
              </span>
            </div>
            <div className="meter">
              <p className="n">
                <b>{mags}</b>/46
              </p>
              <p className="eyebrow l">Magazines read</p>
              <span className="bar">
                <i style={{ width: `${(mags / 46) * 100}%` }} />
              </span>
            </div>
            <div className="meter">
              <p className="n">
                <b>{deaths}</b>/8
              </p>
              <p className="eyebrow l">Connor deaths</p>
              <span className="bar">
                <i style={{ width: `${(deaths / 8) * 100}%` }} />
              </span>
            </div>
            <div className="meter" style={{ minWidth: "auto" }}>
              <SyncIndicator state={syncState} />
            </div>
          </div>
        </header>

        {/* ============ DO THIS FIRST ============ */}
        <section>
          <div className="first brk">
            <p className="big mono">00</p>
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>
                Do this before you launch anything
              </h2>
              <p style={{ marginBottom: 12 }}>
                <b>THESE ARE OUR STORIES</b> is a menu chore, not a gameplay
                trophy — it wants 20,000 bonus points <em>spent</em>, not
                earned. You have three full playthroughs of banked points
                sitting there.
              </p>
              <div className="ch-body">
                {FIRST.map((r) => (
                  <Row
                    key={r.id}
                    row={r}
                    done={pDone(r.id)}
                    onToggle={() => pToggle(r.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ THE SIX ============ */}
        <section>
          <div className="sec-head">
            <p className="eyebrow">Remaining</p>
            <h2>The Six</h2>
            <span className="pill tag">{6 - troph} outstanding</span>
          </div>
          <div className="tgrid">
            {SIX.map((t) => {
              const cleared = gateCleared(t.id);
              return (
                <div
                  key={t.id}
                  className={`card brk trophy${cleared ? " cleared" : ""}`}
                >
                  <div className="top">
                    <span className={`tier ${t.t}`} />
                    <span className="nm">{t.n}</span>
                    <label
                      className="tchk"
                      title={`Mark ${t.n} earned`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone(t.id)}
                        onChange={() => toggle(t.id, "trophy")}
                        aria-label={`Mark ${t.n} earned`}
                      />
                    </label>
                  </div>
                  <p className="ds">{t.d}</p>
                  <p className="wh">
                    {t.w.map((w) => (
                      <span key={w} className="pill">
                        {w}
                      </span>
                    ))}
                    {cleared && !isDone(t.id) && (
                      <span className="pill done">Gates clear</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ RUN 1 ============ */}
        <section>
          <div className="sec-head">
            <p className="eyebrow">Run 01</p>
            <h2>The Machine Run</h2>
            <span className="pill tag blue">
              {count(r1Ids)} / {r1Ids.length} steps
            </span>
          </div>

          <div className="card brk" style={{ marginBottom: 22 }}>
            <h3 style={{ marginBottom: 10 }}>Before you press New Story</h3>
            <div className="ch-body">
              <div className="row key" style={{ cursor: "default" }}>
                <span />
                <div>
                  <p className="txt">
                    <b>Start a fresh New Story on Experienced.</b> Not chapter
                    select — I&rsquo;LL BE BACK needs one continuous run from
                    The Hostage, and several of Connor&rsquo;s death states
                    (the freeway collisions especially) are documented as
                    Experienced-only. Casual auto-passes the QTEs you are
                    deliberately trying to fail.
                  </p>
                </div>
              </div>
              <div className="row key" style={{ cursor: "default" }}>
                <span />
                <div>
                  <p className="txt">
                    <b>What this run is for:</b> I&rsquo;LL BE BACK, JUST A
                    MACHINE, ESCAPE DEATH — plus every unconditional magazine
                    and seven branch-locked ones. JUST A MACHINE <em>is</em>{" "}
                    Connor death #5, so it costs you nothing extra.
                  </p>
                </div>
              </div>
              <div className="row warn" style={{ cursor: "default" }}>
                <span />
                <div>
                  <p className="txt">
                    <b>Ignore PowerPyx&rsquo;s time-saver.</b> Its roadmap
                    tells you to let Kara and Alice die on the freeway to
                    shorten the Connor run. That kills ESCAPE DEATH outright —
                    dead Kara means no capture at Crossroads, no recall
                    centre, no trophy. Keep Kara, Alice and Markus alive the
                    whole way.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="spine">{RUN1.map(renderChapter)}</div>
        </section>

        {/* ============ RUN 2 ============ */}
        <section>
          <div className="sec-head">
            <p className="eyebrow">Run 02</p>
            <h2>One Short Chain</h2>
            <span className="pill tag blue">
              {count(r2Ids)} / {r2Ids.length} steps
            </span>
          </div>
          <p className="sub" style={{ margin: "0 0 22px" }}>
            Only one magazine is mutually exclusive with the choices Run 01
            forces on you: <b>#41</b> needs the stealth branch of Kara&rsquo;s
            escape. (#28 and #46, the other exclusives, are already in your
            ledger.) It doesn&rsquo;t need another full playthrough — one
            continuous chapter-select chain. <b>Continuous matters:</b> the
            game reads the stored flowchart state, so jumping straight to
            Zlatko won&rsquo;t spawn it. You have to replay from the chapter
            that holds the decision.
          </p>
          <div className="spine">{RUN2.map(renderChapter)}</div>
        </section>

        {/* ============ MAGAZINES ============ */}
        <section>
          <div className="sec-head">
            <p className="eyebrow">Bookworm</p>
            <h2>The Magazine Ledger</h2>
            <span className="pill tag flag">{mags} / 46</span>
          </div>

          <div className="card brk" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 9 }}>
              Read this once, then never worry again
            </h3>
            <p style={{ fontSize: 14, color: "var(--ink-2)" }}>
              There are only <b>24 physical magazines</b> in the game but{" "}
              <b>46 collectible entries</b> — each object has two covers. On
              PS4 you <b>swipe the touchpad right</b> to flip to the second
              cover, and you must read <em>every page of both</em>. Half the
              &ldquo;missing magazine&rdquo; panic online is people who picked
              up all 24 objects and never swiped.
            </p>
            <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 10 }}>
              Check what you already have at{" "}
              <b>Main Menu → Extras → Magazines</b>. It lists every entry by
              publisher, so blanks are obvious. The trophy is{" "}
              <b>cumulative across the save file</b>, not per-playthrough — it
              is mathematically impossible to get all 46 in one run. Finish
              the chapter after your last pickup; it pops on the flowchart
              screen.
            </p>
          </div>

          <div className="magbar">
            <span className="eyebrow" style={{ marginRight: 4 }}>
              Filter
            </span>
            {FILTERS.map(([f, label]) => (
              <button
                key={f}
                type="button"
                className="fbtn"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            {MAGS.map((g) => {
              const anyVisible = g.items.some((it) => magVisible(it, g.run));
              return (
                <div
                  key={g.c}
                  className={`mgroup${anyVisible ? "" : " hide"}`}
                >
                  <div className="mgroup-h">
                    <span className="cn">{g.c}</span>
                    <span className="ch-who">{g.who}</span>
                    <span
                      className={`pill${g.run === 2 ? " lock" : ""}`}
                      style={{ marginLeft: "auto" }}
                    >
                      Run 0{g.run}
                    </span>
                  </div>
                  <p className="mwhere">{g.where}</p>
                  {g.items.map((it) => {
                    const id = `mag-${it.n}`;
                    const done = pDone(id);
                    const visible = magVisible(it, g.run);
                    return (
                      <label
                        key={it.n}
                        className={`mrow${done ? " done" : ""}${visible ? "" : " hide"}`}
                      >
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => pToggle(id)}
                        />
                        <span className="no mono">#{it.n}</span>
                        <span className="ti">
                          {it.t}
                          {it.b && <span className="bl">⚠ {it.b}</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ TRAPS ============ */}
        <section>
          <div className="sec-head">
            <p className="eyebrow">Do not</p>
            <h2>Run Killers</h2>
          </div>
          <div className="traps">
            {TRAPS.map((t) => (
              <div key={t.h} className="card trap">
                <h3>{t.h}</h3>
                <p>{t.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ CHAPTER STATE ============ */}
        <section>
          <div className="sec-head">
            <p className="eyebrow">Your save</p>
            <h2>Flowchart Coverage</h2>
            <span className="pill tag">36 chapters</span>
          </div>
          <p className="sub" style={{ margin: "0 0 18px" }}>
            Pulled from your flowchart screenshots. This doesn&rsquo;t gate
            any trophy — it&rsquo;s the map of where the unexplored branches
            actually are, if you ever want 100% flowchart completion after the
            platinum.
          </p>
          <div className="scroller">
            <table className="cctable">
              <thead>
                <tr>
                  <th>Chapter</th>
                  <th style={{ width: "44%" }}>Explored</th>
                  <th style={{ textAlign: "right" }}>%</th>
                </tr>
              </thead>
              <tbody>
                {CHAPTERS.map(([n, p]) => (
                  <tr key={n}>
                    <td>{n}</td>
                    <td>
                      <span className={`ccbar${p < 40 ? " low" : ""}`}>
                        <i style={{ width: `${p}%` }} />
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="ccnum">{p}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note">
            Two chapters sit at 0%: <b>Night of the Soul — Connor</b> and{" "}
            <b>Battle for Detroit — Connor&rsquo;s Last Mission</b>. Both open
            up on the machine-Connor path this run puts you on.
          </p>
        </section>

        <footer>
          <p>
            Compiled from PSNProfiles (earned state, 26 Dec 2025),
            PowerPyx&rsquo;s roadmap and per-chapter walkthroughs, GamerGuides,
            the Detroit: Become Human wiki, and 36 flowchart screenshots from
            your save. Where sources disagreed — the Connor death count
            especially — the page follows the guide that actually enumerates
            its list.
          </p>
          <p style={{ marginTop: 8 }}>
            Every checkbox syncs to your Trophy Room account across devices.
            Cmd/Ctrl+Z undoes an accidental tick.
          </p>
        </footer>
      </div>
    </div>
  );
}
