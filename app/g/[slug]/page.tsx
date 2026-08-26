import { notFound } from "next/navigation";
import { getAllGames, getGame } from "@/lib/content";
import { getGuide } from "@/components/games/registry";

export function generateStaticParams() {
  return getAllGames().map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  return { title: game ? `${game.title} — Trophy Room` : "Trophy Room" };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const Guide = getGuide(slug);
  return <Guide game={game} />;
}
