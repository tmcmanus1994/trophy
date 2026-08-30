"use client";

import "./vault.css";
import Link from "next/link";
import { usePlatinumStatus, type TrackedPlat } from "@/lib/usePlatinums";
import type { PlatinumEntry } from "@/lib/platinums";
import { TrophyIcon } from "@/components/trophy/TrophyIcon";

export interface TrackedGameInfo extends TrackedPlat {
  title: string;
  platform: string;
  platinumName?: string;
}

interface VaultEntry {
  slug: string;
  title: string;
  platform: string;
  platinumName?: string;
  earned: string; // YYYY-MM-DD
  tracked: boolean;
  /** Earned in the Trophy Room, not in the imported library. */
  fresh: boolean;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return m && d ? `${MONTHS[m - 1]} ${d}, ${y}` : iso;
};

export function PlatinumVault({
  psnUser,
  source,
  entries,
  tracked,
}: {
  psnUser: string;
  source?: string;
  entries: PlatinumEntry[];
  tracked: TrackedGameInfo[];
}) {
  const status = usePlatinumStatus(tracked);
  const staticSlugs = new Set(entries.map((e) => e.slug));
  const trackedSlugs = new Set(tracked.map((t) => t.slug));

  /* Tracked games platted in the Trophy Room join the imported library;
     slugs already in the file keep the file's earn date. */
  const merged: VaultEntry[] = [
    ...entries.map((e) => ({
      slug: e.slug,
      title: e.title,
      platform: e.platform,
      platinumName: e.platinumName,
      earned: e.earned,
      tracked: trackedSlugs.has(e.slug),
      fresh: false,
    })),
    ...tracked
      .filter((t) => !staticSlugs.has(t.slug) && status[t.slug]?.done)
      .map((t) => ({
        slug: t.slug,
        title: t.title,
        platform: t.platform,
        platinumName: t.platinumName,
        earned: (status[t.slug].doneAt ?? new Date().toISOString()).slice(0, 10),
        tracked: true,
        fresh: true,
      })),
  ].sort((a, b) => b.earned.localeCompare(a.earned));

  const forging = tracked.filter(
    (t) => !staticSlugs.has(t.slug) && !status[t.slug]?.done
  );

  const byPlatform = merged.reduce<Record<string, number>>((acc, e) => {
    acc[e.platform] = (acc[e.platform] ?? 0) + 1;
    return acc;
  }, {});

  const byYear = new Map<string, VaultEntry[]>();
  for (const e of merged) {
    const year = e.earned.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(e);
  }
  let bestYear = "";
  let bestCount = 0;
  for (const [year, list] of byYear) {
    if (list.length > bestCount) {
      bestYear = year;
      bestCount = list.length;
    }
  }

  const first = merged[merged.length - 1];
  const latest = merged[0];

  return (
    <div className="pvault">
      <div className="glyph-field" aria-hidden="true" />
      <div className="inner">
        <Link href="/" className="back">
          ← Trophy Room
        </Link>

        <header className="hero">
          <p className="hero-count">{merged.length}</p>
          <h1>Platinum Vault</h1>
          <p className="hero-sub">
            {psnUser} — {first ? fmtDate(first.earned) : ""} to{" "}
            {latest ? fmtDate(latest.earned) : ""}. Every game finished all the
            way.
          </p>
          <div className="hero-beam" aria-hidden="true" />
          <div className="stats">
            {Object.entries(byPlatform)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([platform, n]) => (
                <span key={platform} className="stat">
                  {platform} <b>{n}</b>
                </span>
              ))}
            <span className="stat">
              Best year <b>{bestYear}</b> · {bestCount}
            </span>
          </div>
        </header>

        {forging.length > 0 && (
          <div className="forge">
            <span className="forge-label">In the forge</span>
            {forging.map((t) => (
              <Link key={t.slug} href={`/g/${t.slug}`}>
                {t.title}
              </Link>
            ))}
          </div>
        )}

        {[...byYear.entries()].map(([year, list]) => (
          <section key={year} className="year">
            <div className="year-head">
              <h2>{year}</h2>
              <span className="n">
                {list.length} platinum{list.length === 1 ? "" : "s"}
              </span>
            </div>
            {list.map((e) => (
              <div
                key={`${e.slug}-${e.earned}`}
                className={`row${e.fresh ? " fresh" : ""}`}
              >
                <TrophyIcon type="platinum" size={17} />
                <div className="t">
                  <span className="title">
                    {e.tracked ? (
                      <Link href={`/g/${e.slug}`}>{e.title}</Link>
                    ) : (
                      e.title
                    )}
                  </span>
                  {e.platinumName && (
                    <span className="pname">“{e.platinumName}”</span>
                  )}
                </div>
                <span style={{ display: "flex", gap: 6 }}>
                  {e.fresh && <span className="chip new">New</span>}
                  <span
                    className={`chip${e.platform === "PS5" ? " ps5" : ""}`}
                  >
                    {e.platform}
                  </span>
                </span>
                <span className="date">{fmtDate(e.earned)}</span>
              </div>
            ))}
          </section>
        ))}

        <footer className="prov">
          <p>
            Imported from {source ?? "the PSNProfiles platinum log"}. Games
            tracked in the Trophy Room join this list automatically the moment
            their platinum is checked off — no re-import needed.
          </p>
        </footer>
      </div>
    </div>
  );
}
