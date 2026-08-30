import Link from "next/link";
import { getAllGames } from "@/lib/content";
import { getPlatinumLibrary } from "@/lib/platinums";
import { LibraryView } from "@/components/library/LibraryView";
import { ProfileChip } from "@/components/library/ProfileChip";

/* The four PlayStation button glyphs — the circle carries the hint of red. */
function Glyphs() {
  return (
    <div className="library-glyphs" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4 3.5 19.5h17L12 4Z"
          stroke="var(--ps-blue-bright)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="var(--ps-red)" strokeWidth="2.2" />
      </svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="m5 5 14 14M19 5 5 19"
          stroke="var(--ps-blue-bright)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="4.5"
          y="4.5"
          width="15"
          height="15"
          stroke="var(--ps-blue-bright)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function Library() {
  const games = getAllGames();
  const platinumCount = getPlatinumLibrary()?.entries.length ?? 0;

  return (
    <div className="library">
      <div className="glyph-field" aria-hidden="true" />
      <ProfileChip />
      <div className="library-inner">
        <header className="library-hero">
          <Glyphs />
          <h1 className="library-wordmark">Trophy Room</h1>
          <p className="library-tagline">
            Every guide, every checkbox, synced everywhere.
          </p>
          <div className="library-beam" aria-hidden="true" />
          {platinumCount > 0 && (
            <Link href="/platinums" className="library-vault-link">
              <span className="vault-diamond" aria-hidden="true" />
              Platinum Vault — {platinumCount} and counting
            </Link>
          )}
        </header>

        {games.length === 0 ? (
          <div className="library-empty">
            <p>No guides yet.</p>
            <p>
              Add one at <code>content/games/&lt;slug&gt;.md</code> and it
              shows up here with progress tracking built in.
            </p>
          </div>
        ) : (
          <LibraryView games={games} />
        )}

        <footer className="library-footer">
          <Link href="/sync">PSN Sync</Link>
          <Link href="/platinums">Platinum Vault</Link>
        </footer>
      </div>
    </div>
  );
}
