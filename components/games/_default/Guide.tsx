"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/lib/useProgress";
import type { Game, GuideProps, Trophy } from "@/lib/types";
import { TrophyCheckbox } from "@/components/trophy/TrophyCheckbox";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";
import { ProgressRing } from "@/components/trophy/ProgressRing";
import { MissableBadge } from "@/components/trophy/MissableBadge";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";

type Filter = "all" | "remaining" | "missable";

export default function DefaultGuide({ game }: GuideProps) {
  const { isDone, toggle, completion, syncState } = useProgress(
    game.slug,
    game.trophies
  );
  const [filter, setFilter] = useState<Filter>("all");

  const trophyById = useMemo(
    () => new Map(game.trophies.map((t) => [t.id, t])),
    [game.trophies]
  );

  const visible = (t: Trophy) => {
    if (filter === "remaining") return !isDone(t.id);
    if (filter === "missable") return t.missable;
    return true;
  };

  const sections = useMemo(() => {
    if (!game.phases?.length) {
      return [{ phase: null, trophies: game.trophies }];
    }
    const byPhase = new Map<string, Trophy[]>();
    const unphased: Trophy[] = [];
    for (const t of game.trophies) {
      if (t.phase) {
        if (!byPhase.has(t.phase)) byPhase.set(t.phase, []);
        byPhase.get(t.phase)!.push(t);
      } else {
        unphased.push(t);
      }
    }
    const result = game.phases
      .filter((p) => byPhase.has(p.id))
      .map((p) => ({ phase: p, trophies: byPhase.get(p.id)! }));
    if (unphased.length) {
      result.push({
        phase: { id: "anytime", title: "Anytime", summary: undefined },
        trophies: unphased,
      });
    }
    return result;
  }, [game]);

  return (
    <div
      className="guide"
      style={{ "--accent": game.accent ?? "var(--ps-blue)" } as React.CSSProperties}
    >
      <header className="guide-header">
        <Link href="/" className="guide-back">
          ← Library
        </Link>
        <p className="guide-platform">
          {game.platform}
          {game.developer ? ` · ${game.developer}` : ""}
          {game.released ? ` · ${game.released.slice(0, 4)}` : ""}
        </p>
        <h1 className="guide-title">{game.title}</h1>
        {game.platinumName && (
          <p className="guide-plat-name">
            <TrophyIcon type="platinum" size={16} /> {game.platinumName}
          </p>
        )}
        <dl className="guide-meta">
          {game.difficulty != null && (
            <div>
              <dt>Difficulty</dt>
              <dd>{game.difficulty}/10</dd>
            </div>
          )}
          {game.hoursToPlat != null && (
            <div>
              <dt>Hours</dt>
              <dd>~{game.hoursToPlat}</dd>
            </div>
          )}
          {game.playthroughs != null && (
            <div>
              <dt>Playthroughs</dt>
              <dd>{game.playthroughs}</dd>
            </div>
          )}
          {game.missableCount != null && (
            <div>
              <dt>Missables</dt>
              <dd>{game.missableCount}</dd>
            </div>
          )}
        </dl>
      </header>

      {/* Sticky so completion is always reachable without scrolling. */}
      <div className="guide-summary">
        <ProgressRing percent={completion.percent} size={56} stroke={4}>
          <span className="guide-summary-percent">{completion.percent}%</span>
        </ProgressRing>
        <div className="guide-summary-counts">
          {(["platinum", "gold", "silver", "bronze"] as const).map((type) =>
            completion.byType[type].total > 0 ? (
              <span key={type} className="guide-summary-count">
                <TrophyIcon type={type} size={15} />
                {completion.byType[type].earned}/{completion.byType[type].total}
              </span>
            ) : null
          )}
        </div>
        <div className="guide-summary-side">
          <div className="guide-filters" role="group" aria-label="Filter trophies">
            {(["all", "remaining", "missable"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`guide-filter${filter === f ? " is-active" : ""}`}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "remaining" ? "Remaining" : "Missable"}
              </button>
            ))}
          </div>
          <SyncIndicator state={syncState} />
        </div>
      </div>

      {game.intro && (
        <section className="guide-intro">
          <ReactMarkdown>{game.intro}</ReactMarkdown>
        </section>
      )}

      <main>
        {sections.map(({ phase, trophies }) => {
          const shown = trophies.filter(visible);
          return (
            <section key={phase?.id ?? "all"} className="guide-phase">
              {phase && (
                <div className="guide-phase-header">
                  <h2>{phase.title}</h2>
                  {phase.summary && <p>{phase.summary}</p>}
                </div>
              )}
              {shown.length === 0 ? (
                <p className="guide-empty">
                  {filter === "remaining"
                    ? "Everything here is earned."
                    : "Nothing matches this filter."}
                </p>
              ) : (
                <ul className="trophy-list">
                  {shown.map((t) => (
                    <TrophyRow
                      key={t.id}
                      trophy={t}
                      game={game}
                      trophyById={trophyById}
                      isDone={isDone}
                      toggle={toggle}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}

function TrophyRow({
  trophy: t,
  game,
  trophyById,
  isDone,
  toggle,
}: {
  trophy: Trophy;
  game: Game;
  trophyById: Map<string, Trophy>;
  isDone: (id: string) => boolean;
  toggle: (id: string, type?: string) => void;
}) {
  const done = isDone(t.id);
  return (
    <li className={`trophy-row${done ? " is-done" : ""}`}>
      <TrophyCheckbox
        checked={done}
        onToggle={() => toggle(t.id, "trophy")}
        label={t.name}
      />
      <div className="trophy-body">
        <div className="trophy-title-line">
          <TrophyIcon type={t.type} size={18} dim={!done && t.type !== "platinum"} />
          <span className="trophy-name">{t.name}</span>
          {t.missable && <MissableBadge />}
          {t.dlc && <span className="dlc-badge">DLC</span>}
        </div>
        <p className="trophy-desc">{t.description}</p>
        {t.requires.length > 0 && (
          <p className="trophy-requires">
            After:{" "}
            {t.requires
              .map((id) => trophyById.get(id)?.name ?? id)
              .join(", ")}
          </p>
        )}
        {t.steps && t.steps.length > 0 && (
          <ul className="trophy-steps">
            {t.steps.map((s) => {
              const stepId = `${t.id}::${s.id}`;
              const stepDone = isDone(stepId);
              return (
                <li key={s.id} className={stepDone ? "is-done" : ""}>
                  <TrophyCheckbox
                    checked={stepDone}
                    onToggle={() => toggle(stepId, "step")}
                    label={s.text}
                    small
                  />
                  <span className="trophy-step-text">
                    {s.text}
                    {s.detail && (
                      <span className="trophy-step-detail"> — {s.detail}</span>
                    )}
                    {s.code && <code className="trophy-step-code">{s.code}</code>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {t.note && (
          <div className="trophy-note">
            <ReactMarkdown>{t.note}</ReactMarkdown>
          </div>
        )}
      </div>
    </li>
  );
}
