"use client";

import "./theme.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/lib/useProgress";
import type { GuideProps } from "@/lib/types";
import { TrophyCheckbox } from "@/components/trophy/TrophyCheckbox";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";
import { SyncIndicator } from "@/components/trophy/SyncIndicator";

export default function DispatchGuide({ game }: GuideProps) {
  const { isDone, toggle, syncState } = useProgress(game.slug, game.trophies);

  const trophy = game.trophies.find((t) => t.id === "h4ck3d-by-r0b3rt")!;
  const steps = trophy.steps ?? [];
  const groups = trophy.stepGroups ?? [];

  const stepId = (id: string) => `${trophy.id}::${id}`;
  const done = steps.filter((s) => isDone(stepId(s.id))).length;
  const total = steps.length;
  const complete = done === total && total > 0;
  const trophyEarned = isDone(trophy.id);

  let runningIndex = 0;
  const numbered = new Map(steps.map((s) => [s.id, ++runningIndex]));

  return (
    <div className="dispatch-guide">
      {/* Fonts for this guide only — hoisted to <head> by React. */}
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
      />
      <div className="wrap">
        <Link href="/" className="dsp-back">
          ← Library
        </Link>

        <header className="dsp-header">
          <div className="eyebrow">SDN Terminal // Trophy Protocol</div>
          <h1>H4CK3D BY R0B3RT</h1>
          <p className="sub">
            {trophy.description} {game.title} ({game.platform})
          </p>

          <div className="progress">
            <div className="progress-label">
              <span>System breach</span>
              <b className={complete ? "complete" : ""}>
                {complete ? "BREACH COMPLETE ✓" : `${done} / ${total}`}
              </b>
            </div>
            <div className="bar">
              <div
                className={`bar-fill${complete ? " complete" : ""}`}
                style={{ width: `${(done / total) * 100}%` }}
              />
            </div>
            <div className="session-note">
              <span>Progress saves automatically and syncs across devices.</span>
              <SyncIndicator state={syncState} />
            </div>
          </div>

          <div className={`dsp-trophy${trophyEarned ? " earned" : ""}`}>
            <TrophyCheckbox
              checked={trophyEarned}
              onToggle={() => toggle(trophy.id, "trophy")}
              label={trophy.name}
              small
            />
            <TrophyIcon type={trophy.type} size={16} dim={!trophyEarned} />
            <div>
              <div className="dsp-trophy-name">Trophy earned</div>
              <div className="dsp-trophy-desc">
                {complete
                  ? "All 28 hacks done — check this once it pops."
                  : "Check this when the trophy actually pops."}
              </div>
            </div>
          </div>
        </header>

        {game.intro && (
          <div className="alert cyan">
            <ReactMarkdown>{game.intro}</ReactMarkdown>
          </div>
        )}
        {trophy.note && (
          <div className="alert">
            <ReactMarkdown>{trophy.note}</ReactMarkdown>
          </div>
        )}

        {groups.map((group, gi) => {
          const groupSteps = steps.filter((s) => s.group === group.id);
          const groupDone = groupSteps.filter((s) => isDone(stepId(s.id))).length;
          return (
            <section key={group.id} className="episode">
              <div className="ep-head">
                <span className="ep-num">EP {gi + 1}</span>
                <h2>{group.title}</h2>
                <span
                  className={`ep-count${groupDone === groupSteps.length ? " done" : ""}`}
                >
                  {groupDone} / {groupSteps.length}
                </span>
              </div>
              {groupSteps.map((s) => {
                const checked = isDone(stepId(s.id));
                const hot = s.tags?.includes("danger");
                return (
                  <div
                    key={s.id}
                    className={`hack${checked ? " checked" : ""}${hot ? " hot" : ""}`}
                  >
                    <TrophyCheckbox
                      checked={checked}
                      onToggle={() => toggle(stepId(s.id), "step")}
                      label={s.text}
                      small
                    />
                    <div className="hack-body">
                      <div className="hack-title">
                        <span className="idx">
                          {String(numbered.get(s.id)).padStart(2, "0")}
                        </span>
                        {s.text}
                      </div>
                      {s.detail && <div className="hack-desc">{s.detail}</div>}
                      {s.code && <div className="pw">{s.code}</div>}
                      {s.tags && s.tags.length > 0 && (
                        <div className="tags">
                          {s.tags.map((t) => (
                            <span key={t} className={`tag ${t}`}>
                              {t === "danger" ? "often missed" : t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
