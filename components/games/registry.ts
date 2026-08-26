import type { ComponentType } from "react";
import type { GuideProps } from "@/lib/types";
import DefaultGuide from "./_default/Guide";

/**
 * slug -> custom guide component. A game with no entry here still renders
 * and still tracks progress via the default layout — a custom component
 * is an upgrade, never a prerequisite.
 */
export const guides: Record<string, ComponentType<GuideProps>> = {
  // 'elden-ring': EldenRingGuide,
};

export const getGuide = (slug: string): ComponentType<GuideProps> =>
  guides[slug] ?? DefaultGuide;
