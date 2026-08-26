"use client";

import { useState } from "react";
import Link from "next/link";
import type { Game } from "@/lib/types";
import {
  applyMatch,
  matchBlocks,
  parseSyncText,
  type GameMatch,
} from "@/lib/psnSync";
import { supabase } from "@/lib/supabase";

type Stage = "input" | "preview" | "done";

export function SyncTool({ games }: { games: Game[] }) {
  const [text, setText] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [matches, setMatches] = useState<GameMatch[]>([]);
  const [applying, setApplying] = useState(false);
  const [summary, setSummary] = useState("");

  const preview = () => {
    const blocks = parseSyncText(text);
    if (blocks.length === 0) {
      setSummary(
        "Nothing to parse. The paste needs a `game:` line and `- Trophy Name` bullets."
      );
      return;
    }
    setSummary("");
    setMatches(matchBlocks(blocks, games));
    setStage("preview");
  };

  const apply = async () => {
    setApplying(true);
    let marked = 0;
    let anyRemoteFail = false;
    for (const m of matches) {
      const result = await applyMatch(m);
      marked += result.marked;
      anyRemoteFail = anyRemoteFail || result.failedRemote;
    }
    setApplying(false);
    setStage("done");
    setSummary(
      marked === 0
        ? "Nothing new to mark — everything was already earned here."
        : `Marked ${marked} ${marked === 1 ? "trophy" : "trophies"} earned.` +
            (anyRemoteFail
              ? " Some rows didn't reach Supabase — they're saved on this device and will sync from the guide page."
              : !supabase
                ? " Saved on this device (Supabase isn't configured in this build)."
                : "")
    );
  };

  const totalToMark = matches.reduce((n, m) => n + m.toMark.length, 0);

  return (
    <div className="sync-tool">
      {stage === "input" && (
        <>
          <p className="sync-help">
            Paste a trophy sync block — from the Claude-in-Chrome handoff, or
            typed by hand:
          </p>
          <pre className="sync-example">{`game: elden-ring
earned:
- Roundtable Hold
- Margit, the Fell Omen`}</pre>
          <textarea
            className="sync-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="game: ..."
            aria-label="Trophy sync block"
          />
          <div className="sync-actions">
            <button type="button" className="sync-button" onClick={preview}>
              Preview
            </button>
          </div>
        </>
      )}

      {stage === "preview" && (
        <>
          {matches.map((m) => (
            <section key={m.slug} className="sync-game">
              <h2>{m.title}</h2>
              {m.toMark.length > 0 && (
                <div className="sync-list sync-list-mark">
                  <h3>Will mark earned ({m.toMark.length})</h3>
                  <ul>
                    {m.toMark.map((t) => (
                      <li key={t.id}>{t.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {m.alreadyDone.length > 0 && (
                <p className="sync-note">
                  Already earned here, skipping: {m.alreadyDone.length}
                </p>
              )}
              {m.unmatched.length > 0 && (
                <div className="sync-list sync-list-unmatched">
                  <h3>No match in this guide ({m.unmatched.length})</h3>
                  <ul>
                    {m.unmatched.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                  <p className="sync-note">
                    Usually a name spelled differently than the guide, or a
                    game not in the library yet. These are left alone.
                  </p>
                </div>
              )}
            </section>
          ))}
          <div className="sync-actions">
            <button
              type="button"
              className="sync-button"
              onClick={apply}
              disabled={applying || totalToMark === 0}
            >
              {applying
                ? "Applying..."
                : totalToMark === 0
                  ? "Nothing to apply"
                  : `Mark ${totalToMark} earned`}
            </button>
            <button
              type="button"
              className="sync-button sync-button-quiet"
              onClick={() => setStage("input")}
              disabled={applying}
            >
              Back
            </button>
          </div>
          <p className="sync-note">
            Sync only marks earned — it never un-marks anything, and it never
            touches sub-steps.
          </p>
        </>
      )}

      {stage === "done" && (
        <div className="sync-result">
          <p>{summary}</p>
          <div className="sync-actions">
            <Link href="/" className="sync-button">
              Back to library
            </Link>
            <button
              type="button"
              className="sync-button sync-button-quiet"
              onClick={() => {
                setText("");
                setSummary("");
                setStage("input");
              }}
            >
              Sync another
            </button>
          </div>
        </div>
      )}

      {stage === "input" && summary && <p className="sync-note">{summary}</p>}
    </div>
  );
}
