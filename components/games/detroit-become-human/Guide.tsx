"use client";

import "./theme.css";
import { useMemo } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/lib/useProgress";
import type { GuideProps, Trophy } from "@/lib/types";
import { TrophyCheckbox } from "@/components/trophy/TrophyCheckbox";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";
import { ProgressRing } from "@/components/trophy/ProgressRing";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";

/* Mutually exclusive branch pairs — [pacifist/first-run, machine-run]. */
const FORKS: Array<[string, string]> = [
  ["self-control", "defend-yourself"],
  ["save-hank", "catch-it"],
  ["doubts", "ruthless"],
  ["send-a-message", "burn-the-place"],
  ["stand-your-ground", "confrontation"],
  ["kinship", "priorities"],
  ["one-of-us", "compliant"],
  ["safe-harbor", "escape-death"],
];

export default function DetroitGuide({ game }: GuideProps) {
  const { isDone, toggle, completion, syncState } = useProgress(
    game.slug,
    game.trophies
  );

  const byId = useMemo(
    () => new Map(game.trophies.map((t) => [t.id, t])),
    [game.trophies]
  );
  const partnerOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const [a, b] of FORKS) {
      m.set(a, b);
      m.set(b, a);
    }
    return m;
  }, []);

  const remaining = game.trophies.filter((t) => !isDone(t.id));
  const complete = remaining.length === 0;
  const phases = game.phases ?? [];

  /* Node state: earned (blue), offbranch (partner taken, this one not — the
     ghost path), open (dashed, still ahead of you). */
  const nodeState = (t: Trophy) => {
    if (isDone(t.id)) return "earned";
    const p = partnerOf.get(t.id);
    if (p && isDone(p)) return "offbranch";
    return "open";
  };

  return (
    <div className="dbh">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Exo+2:wght@500;600;700&family=Archivo:wght@400;500;600&display=swap"
      />
      <div className="wrap">
        <Link href="/" className="dbh-back">
          ← Library
        </Link>

        <header className="dbh-header">
          <div className="dbh-header-info">
            <div className="dbh-eyebrow">
              <span className={`dbh-led${complete ? " calm" : ""}`} />
              {game.developer} // {game.platform} // Flowchart
            </div>
            <h1 className="dbh-title">{game.title}</h1>
            {game.platinumName && (
              <p className="dbh-plat">
                <TrophyIcon type="platinum" size={15} /> {game.platinumName}
              </p>
            )}
            <div className="dbh-meta">
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
              {game.missableCount != null && (
                <span>
                  Missable <b>{game.missableCount}</b>
                </span>
              )}
            </div>
            <div className="dbh-tiers">
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
            <span className="dbh-ring-label">{completion.percent}%</span>
          </ProgressRing>
        </header>

        <div className="dbh-sticky">
          <span className={`dbh-led${complete ? " calm" : ""}`} />
          <span>
            <b>
              {completion.earned} / {completion.total}
            </b>{" "}
            collected
          </span>
          <span>
            <b>{remaining.length}</b> remaining
          </span>
          <span className="spacer" />
          <SyncIndicator state={syncState} />
        </div>

        <section className="dbh-remaining">
          <h2 className="dbh-display">Remaining objectives</h2>
          {complete ? (
            <p className="dbh-remaining-done">
              Software instability: none. Every branch resolved — {game.platinumName} secured.
            </p>
          ) : (
            <div className="dbh-remaining-list">
              {remaining.map((t) => (
                <span key={t.id} className="dbh-chip">
                  <TrophyIcon type={t.type} size={13} />
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </section>

        {game.intro && (
          <div className="dbh-intro">
            <ReactMarkdown>{game.intro}</ReactMarkdown>
          </div>
        )}

        {phases.map((phase) => {
          const phaseTrophies = game.trophies.filter((t) => t.phase === phase.id);
          if (phaseTrophies.length === 0) return null;
          return (
            <section key={phase.id} className="dbh-phase">
              <div className="dbh-phase-head">
                <h2>{phase.title}</h2>
                {phase.summary && <p>{phase.summary}</p>}
              </div>
              <div className="dbh-phase-body">
                {phaseTrophies.map((t) => (
                  <TrophyRow
                    key={t.id}
                    trophy={t}
                    partner={partnerOf.get(t.id) ? byId.get(partnerOf.get(t.id)!) : undefined}
                    state={nodeState(t)}
                    partnerState={
                      partnerOf.get(t.id)
                        ? nodeState(byId.get(partnerOf.get(t.id)!)!)
                        : undefined
                    }
                    isDone={isDone}
                    toggle={toggle}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TrophyRow({
  trophy: t,
  partner,
  state,
  partnerState,
  isDone,
  toggle,
}: {
  trophy: Trophy;
  partner?: Trophy;
  state: string;
  partnerState?: string;
  isDone: (id: string) => boolean;
  toggle: (id: string, type?: string) => void;
}) {
  const earned = isDone(t.id);
  return (
    <div className="dbh-row">
      <span
        className={`dbh-node ${state}${t.missable ? " diamond" : ""}`}
        aria-hidden="true"
      />
      <div className="dbh-fork">
        <div
          className={`dbh-card${t.missable ? " missable" : ""}${
            earned ? " earned" : state === "offbranch" ? " offbranch" : ""
          }`}
        >
          <TrophyCheckbox
            checked={earned}
            onToggle={() => toggle(t.id, "trophy")}
            label={t.name}
            small
          />
          <div className="dbh-card-body">
            <div className="dbh-name">
              <TrophyIcon type={t.type} size={15} dim={!earned} />
              {t.name}
            </div>
            <p className="dbh-desc">{t.description}</p>
            {t.steps && t.steps.length > 0 && (
              <ul className="dbh-steps">
                {t.steps.map((s) => {
                  const sid = `${t.id}::${s.id}`;
                  const sDone = isDone(sid);
                  return (
                    <li key={s.id} className={sDone ? "done" : ""}>
                      <TrophyCheckbox
                        checked={sDone}
                        onToggle={() => toggle(sid, "step")}
                        label={s.text}
                        small
                      />
                      <span>{s.text}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {t.note && (
              <div className="dbh-note">
                <ReactMarkdown>{t.note}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        {partner && (
          <>
            <div className="dbh-fork-link">fork — other branch</div>
            <div className={`dbh-partner ${partnerState ?? "open"}`}>
              <span
                className={`dbh-node ${partnerState ?? "open"}${
                  partner.missable ? " diamond" : ""
                }`}
                aria-hidden="true"
              />
              <span className="dbh-partner-name">{partner.name}</span>
              <span className="dbh-partner-state">
                {partnerState === "earned"
                  ? "earned"
                  : partnerState === "offbranch"
                    ? "branch not taken yet"
                    : "still open"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
