import { getAllGames } from "@/lib/content";
import { GameCard } from "@/components/library/GameCard";

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

  return (
    <div className="library">
      <div className="glyph-field" aria-hidden="true" />
      <div className="library-inner">
        <header className="library-hero">
          <Glyphs />
          <h1 className="library-wordmark">Trophy Room</h1>
          <p className="library-tagline">
            Every guide, every checkbox, synced everywhere.
          </p>
          <div className="library-beam" aria-hidden="true" />
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
          <main className="library-grid">
            {games.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </main>
        )}
      </div>
    </div>
  );
}
