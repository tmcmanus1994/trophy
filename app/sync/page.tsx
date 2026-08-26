import Link from "next/link";
import { getAllGames } from "@/lib/content";
import { SyncTool } from "@/components/sync/SyncTool";

export const metadata = { title: "PSN Sync — Trophy Room" };

export default function SyncPage() {
  const games = getAllGames();

  return (
    <div className="guide sync-page">
      <header className="guide-header">
        <Link href="/" className="guide-back">
          ← Library
        </Link>
        <p className="guide-platform">Manual import</p>
        <h1 className="guide-title">PSN Sync</h1>
      </header>
      <main className="sync-main">
        <SyncTool games={games} />
      </main>
    </div>
  );
}
