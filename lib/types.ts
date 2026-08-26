export type TrophyType = "bronze" | "silver" | "gold" | "platinum";

export interface TrophyStep {
  id: string;
  text: string;
  detail?: string;
  code?: string;
  tags?: string[];
  group?: string;
  target?: number;
}

export interface StepGroup {
  id: string;
  title: string;
  summary?: string;
}

export interface Trophy {
  id: string;
  name: string;
  type: TrophyType;
  description: string;
  phase?: string;
  missable: boolean;
  dlc: boolean;
  requires: string[];
  counter?: number;
  stepGroups?: StepGroup[];
  steps?: TrophyStep[];
  note?: string;
}

export interface Phase {
  id: string;
  title: string;
  summary?: string;
}

export interface Game {
  slug: string;
  title: string;
  platform: string;
  developer?: string;
  released?: string;
  platinumName?: string;
  difficulty?: number;
  hoursToPlat?: number;
  playthroughs?: number;
  missableCount?: number;
  psnProfilesGameId?: number;
  accent?: string;
  coverImage?: string;
  phases?: Phase[];
  trophies: Trophy[];
  /** Markdown body of the guide file — intro prose rendered above the list. */
  intro: string;
}

export interface GuideProps {
  game: Game;
}

export interface ProgressEntry {
  done: boolean;
  done_at: string | null;
  updated_at: string;
  source: "manual" | "psnprofiles";
  /** Numeric progress toward a counter trophy/step (e.g. 59 of 100 suits). */
  value?: number;
}

export type ProgressMap = Record<string, ProgressEntry>;

export type SyncState = "synced" | "syncing" | "offline" | "local";

export interface Completion {
  earned: number;
  total: number;
  percent: number;
  byType: Record<TrophyType, { earned: number; total: number }>;
}
