import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { gameFrontMatterSchema } from "./schema";
import type { Game } from "./types";

const GAMES_DIR = path.join(process.cwd(), "content", "games");

function parseGameFile(filePath: string): Game {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const result = gameFrontMatterSchema.safeParse(data);

  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid guide front-matter in ${path.basename(filePath)}:\n${details}`
    );
  }

  const expectedSlug = path.basename(filePath, ".md");
  if (result.data.slug !== expectedSlug) {
    throw new Error(
      `Guide ${path.basename(filePath)}: front-matter slug "${result.data.slug}" must match the filename`
    );
  }

  return { ...result.data, intro: content.trim() };
}

export function getAllGames(): Game[] {
  if (!fs.existsSync(GAMES_DIR)) return [];
  return fs
    .readdirSync(GAMES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseGameFile(path.join(GAMES_DIR, f)))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getGame(slug: string): Game | null {
  const filePath = path.join(GAMES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return parseGameFile(filePath);
}
