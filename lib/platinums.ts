import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/**
 * The platinum library: content/platinums.md holds the historical haul
 * imported from PSNProfiles. Tracked games merge in live on the client —
 * a game platted in the Trophy Room appears here automatically, so the
 * file never needs to be re-imported.
 */

const dateish = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v));

const platinumEntrySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  platform: z.string().min(1),
  region: z.string().optional(),
  psnProfilesGameId: z.number().int().positive().optional(),
  platinumName: z.string().optional(),
  earned: dateish,
});

const platinumLibrarySchema = z
  .object({
    psnUser: z.string().min(1),
    generated: dateish.optional(),
    source: z.string().optional(),
    platinums: z.array(platinumEntrySchema).min(1),
  })
  .passthrough();

export type PlatinumEntry = z.infer<typeof platinumEntrySchema>;

export interface PlatinumLibrary {
  psnUser: string;
  source?: string;
  entries: PlatinumEntry[];
}

const FILE = path.join(process.cwd(), "content", "platinums.md");

export function getPlatinumLibrary(): PlatinumLibrary | null {
  if (!fs.existsSync(FILE)) return null;
  const { data } = matter(fs.readFileSync(FILE, "utf8"));
  const result = platinumLibrarySchema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid front-matter in content/platinums.md:\n${details}`);
  }
  return {
    psnUser: result.data.psnUser,
    source: result.data.source,
    entries: result.data.platinums,
  };
}
