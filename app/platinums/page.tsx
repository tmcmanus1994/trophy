import type { Metadata } from "next";
import { getAllGames } from "@/lib/content";
import { getPlatinumLibrary } from "@/lib/platinums";
import {
  PlatinumVault,
  type TrackedGameInfo,
} from "@/components/platinums/PlatinumVault";

export const metadata: Metadata = {
  title: "Platinum Vault — Trophy Room",
  description: "Every platinum, first to latest.",
};

export default function PlatinumsPage() {
  const library = getPlatinumLibrary();
  const tracked: TrackedGameInfo[] = getAllGames().flatMap((g) => {
    const plat = g.trophies.find((t) => t.type === "platinum");
    return plat
      ? [
          {
            slug: g.slug,
            platinumId: plat.id,
            title: g.title,
            platform: g.platform,
            platinumName: g.platinumName ?? plat.name,
          },
        ]
      : [];
  });

  return (
    <PlatinumVault
      psnUser={library?.psnUser ?? "—"}
      source={library?.source}
      entries={library?.entries ?? []}
      tracked={tracked}
    />
  );
}
