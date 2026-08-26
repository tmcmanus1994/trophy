import type { ComponentType } from "react";
import type { GuideProps } from "@/lib/types";
import DefaultGuide from "./_default/Guide";
import DispatchGuide from "./dispatch/Guide";
import DetroitGuide from "./detroit-become-human/Guide";

/**
 * slug -> custom guide component. A game with no entry here still renders
 * and still tracks progress via the default layout — a custom component
 * is an upgrade, never a prerequisite.
 */
export const guides: Record<string, ComponentType<GuideProps>> = {
  dispatch: DispatchGuide,
  "detroit-become-human": DetroitGuide,
};

export const getGuide = (slug: string): ComponentType<GuideProps> =>
  guides[slug] ?? DefaultGuide;
