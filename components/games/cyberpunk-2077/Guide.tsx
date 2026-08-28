"use client";

import "./theme.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/lib/useProgress";
import type { GuideProps, Trophy } from "@/lib/types";
import { TrophyCheckbox } from "@/components/trophy/TrophyCheckbox";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";

const PLAT_ID = "never-fade-away";

/* Hazard interrupts in the timeline — the brief's red gates. */
const HAZARDS: Record<string, { kind: "warn" | "gate"; title: string; body: string }> = {
  p2: {
    kind: "warn",
    title: "Live missables in this step",
    body: "Pisces — refuse Maiko's money, kill Woodman, or Judy's trophy dies. Johnny's Pants — loot them the moment you're inside the Psychofan apartment. Kerry — his whole chain hangs off finishing Chippin' In first.",
  },
  p4: {
    kind: "gate",
    title: "Hard gate — manual save at Firestarter",
    body: "After standing up from Hansen's couch: SAVE. All three remaining Kings hang from this file. Reed path first for Cups + Pentacles off one Somewhat Damaged core save, then reload Firestarter once for Wands.",
  },
};

/* Deterministic two-hex-digit code per trophy for the breach grid. */
function hexByte(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xff;
  return h.toString(16).toUpperCase().padStart(2, "0");
}

function BreachGrid({
  trophies,
  isDone,
}: {
  trophies: Trophy[];
  isDone: (id: string) => boolean;
}) {
  const solved = trophies.filter((t) => isDone(t.id)).length;
  return (
    <div className="cp-breach">
      <div className="cp-breach-grid cp-notch">
        {trophies.map((t) => {
          const done = isDone(t.id);
          return (
            <span
              key={t.id}
              className={`cp-cell${done ? " solved" : t.missable ? " hot" : ""}`}
              title={`${t.name}${done ? " — uploaded" : t.missable ? " — missable" : ""}`}
            >
              {hexByte(t.id)}
            </span>
          );
        })}
      </div>
      <div className="cp-breach-label">
        <b>{solved}</b>/{trophies.length} daemons uploaded
      </div>
    </div>
  );
}

export default function CyberpunkGuide({ game }: GuideProps) {
  const { isDone, toggle, completion, syncState } = useProgress(
    game.slug,
    game.trophies
  );

  const plat = game.trophies.find((t) => t.id === PLAT_ID)!;
  const remaining = (phase: string) =>
    game.trophies.filter(
      (t) => t.phase === phase && t.id !== PLAT_ID && !isDone(t.id)
    );
  const banked = game.trophies.filter((t) => t.id !== PLAT_ID && isDone(t.id));
  const liveMissables = game.trophies.filter(
    (t) => t.missable && !isDone(t.id)
  ).length;

  const phases = game.phases ?? [];
  const nightCity = phases.filter((p) => ["p0", "p1", "p2", "p3"].includes(p.id));
  const dogtown = phases.filter((p) => ["p4", "p5"].includes(p.id));

  const stepId = (t: Trophy, sid: string) => `${t.id}::${sid}`;

  const renderCard = (t: Trophy) => (
    <article
      key={t.id}
      className={`cp-card cp-notch${t.missable ? " missable" : ""}${isDone(t.id) ? " earned" : ""}`}
    >
      <TrophyCheckbox
        checked={isDone(t.id)}
        onToggle={() => toggle(t.id, "trophy")}
        label={t.name}
      />
      <div className="cp-card-body">
        <div className="cp-name">
          <TrophyIcon type={t.type} size={16} dim={!isDone(t.id)} />
          {t.name}
          {t.missable && <span className="cp-tag">missable</span>}
          {t.dlc && <span className="cp-tag" style={{ color: "var(--cp-cyan)", borderColor: "rgba(0,240,255,0.4)" }}>PL</span>}
        </div>
        <p className="cp-desc">{t.description}</p>
        {t.steps && t.steps.length > 0 && (
          <div className="cp-steps">
            {t.steps.map((s) => (
              <div
                key={s.id}
                className={`cp-step${isDone(stepId(t, s.id)) ? " done" : ""}`}
              >
                <TrophyCheckbox
                  checked={isDone(stepId(t, s.id))}
                  onToggle={() => toggle(stepId(t, s.id), "step")}
                  label={s.text}
                  small
                />
                <span>
                  {s.text}
                  {s.tags?.includes("missable") && (
                    <em className="cp-step-tag">⚠ one-shot</em>
                  )}
                  {s.tags?.includes("gate") && (
                    <em className="cp-step-tag">save gate</em>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
        {t.note && (
          <div className="cp-note">
            <ReactMarkdown>{t.note}</ReactMarkdown>
          </div>
        )}
      </div>
    </article>
  );

  const renderPhase = (phase: { id: string; title: string; summary?: string }, idx: number) => {
    const list = remaining(phase.id);
    const hazard = HAZARDS[phase.id];
    return (
      <section key={phase.id} className="cp-phase">
        <div className="cp-phase-head">
          <h2>
            <span>{String(idx).padStart(2, "0")}</span>
            {phase.title.replace(/^Step \d+ — /, "")}
          </h2>
          {phase.summary && <p>{phase.summary}</p>}
        </div>
        {hazard && (
          <div className={`cp-hazard cp-notch ${hazard.kind}`}>
            <div className="cp-hazard-title">{hazard.title}</div>
            <p>{hazard.body}</p>
          </div>
        )}
        {phase.id === "p0" ? (
          <div className="cp-rig">
            {(plat.stepGroups ?? []).map((g) => (
              <div key={g.id} className="cp-rig-group cp-notch">
                <h3>{g.title}</h3>
                {(plat.steps ?? [])
                  .filter((s) => s.group === g.id)
                  .map((s) => {
                    const sid = stepId(plat, s.id);
                    return (
                      <div
                        key={s.id}
                        className={`cp-rig-step${isDone(sid) ? " done" : ""}`}
                      >
                        <TrophyCheckbox
                          checked={isDone(sid)}
                          onToggle={() => toggle(sid, "step")}
                          label={s.text}
                          small
                        />
                        <div>
                          <div className="cp-rig-text">
                            {s.text}
                            {s.tags?.includes("gate") && (
                              <em className="gate">critical</em>
                            )}
                            {s.tags?.includes("missable") && (
                              <em className="gate">one-shot</em>
                            )}
                          </div>
                          {s.detail && (
                            <div className="cp-rig-detail">{s.detail}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        ) : list.length > 0 ? (
          <div className="cp-rows">{list.map(renderCard)}</div>
        ) : (
          <p className="cp-desc" style={{ marginTop: 10 }}>
            Nothing left in this step — all uploaded.
          </p>
        )}
      </section>
    );
  };

  return (
    <div className="cp77">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
      />
      <div className="wrap">
        <Link href="/" className="cp-back">
          ← Library
        </Link>

        <header className="cp-header cp-notch">
          <div className="cp-header-info">
            <div className="cp-eyebrow">
              {game.developer} // {game.platform} // fresh save — the 17 gaps
            </div>
            <h1 className="cp-title">Cyberpunk 2077</h1>
            {game.platinumName && (
              <p className="cp-plat">
                <TrophyIcon type="platinum" size={15} /> {game.platinumName}
              </p>
            )}
            <div className="cp-meta cp-mono">
              <span>
                DIFF <b>{game.difficulty}/10</b>
              </span>
              <span>
                RUN <b>~{game.hoursToPlat}H</b>
              </span>
              <span>
                LIVE MISSABLES <b style={{ color: "var(--cp-red)" }}>{liveMissables}</b>
              </span>
            </div>
            <div className="cp-tiers">
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
          <BreachGrid trophies={game.trophies} isDone={isDone} />
        </header>

        <div className="cp-sticky">
          <span>
            <b>
              {completion.earned}/{completion.total}
            </b>{" "}
            uploaded
          </span>
          <span>
            <span className="hot">{liveMissables}</span> live missables
          </span>
          <span className="spacer" />
          <SyncIndicator state={syncState} />
        </div>

        {game.intro && (
          <div className="cp-intro">
            <ReactMarkdown>{game.intro}</ReactMarkdown>
          </div>
        )}

        <div className="cp-track">Night City</div>
        {nightCity.map((p, i) => renderPhase(p, i))}

        <div className="cp-track" style={{ color: "var(--cp-red)" }}>
          Dogtown
        </div>
        <div className="cp-dogtown">
          {dogtown.map((p, i) => renderPhase(p, i + nightCity.length))}

          <div className="cp-platrow cp-notch">
            <TrophyCheckbox
              checked={isDone(plat.id)}
              onToggle={() => toggle(plat.id, "trophy")}
              label={plat.name}
              small
            />
            <TrophyIcon type="platinum" size={16} dim={!isDone(plat.id)} />
            <b>{plat.name}</b>
            <span>— buy the Relic tree last and this pops on Relic Ruler.</span>
          </div>
        </div>

        <details className="cp-rail cp-notch">
          <summary>
            Banked on the profile — <b>{banked.length}</b> trophies that never
            un-earn
          </summary>
          <div className="cp-rail-list">
            {banked.map((t) => (
              <span key={t.id} className="cp-rail-item">
                <TrophyIcon type={t.type} size={12} />
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
      </div>
    </div>
  );
}
