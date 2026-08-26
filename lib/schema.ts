import { z } from "zod";

const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const idSchema = z
  .string()
  .min(1)
  .regex(kebab, "ids must be kebab-case (lowercase letters, digits, hyphens)");

const stepSchema = z.object({
  id: idSchema,
  text: z.string().min(1),
  // Optional richer fields for checklist-heavy trophies (one-off guides):
  detail: z.string().optional(),   // sub-description under the text
  code: z.string().optional(),     // password / input sequence
  tags: z.array(z.string().min(1)).optional(),
  group: idSchema.optional(),      // references the trophy's stepGroups
});

const stepGroupSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  summary: z.string().optional(),
});

const trophySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  type: z.enum(["bronze", "silver", "gold", "platinum"]),
  description: z.string().min(1),
  phase: idSchema.optional(),
  missable: z.boolean().default(false),
  dlc: z.boolean().default(false),
  requires: z.array(idSchema).default([]),
  stepGroups: z.array(stepGroupSchema).optional(),
  steps: z.array(stepSchema).optional(),
  note: z.string().optional(),
});

const phaseSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  summary: z.string().optional(),
});

export const gameFrontMatterSchema = z
  .object({
    slug: idSchema,
    title: z.string().min(1),
    platform: z.string().min(1),
    developer: z.string().optional(),
    // YAML parses bare dates into Date objects; accept either and normalize.
    released: z
      .union([z.string(), z.date()])
      .optional()
      .transform((v) =>
        v instanceof Date ? v.toISOString().slice(0, 10) : v
      ),
    platinumName: z.string().optional(),
    difficulty: z.number().int().min(1).max(10).optional(),
    hoursToPlat: z.number().positive().optional(),
    playthroughs: z.number().int().positive().optional(),
    missableCount: z.number().int().min(0).optional(),
    psnProfilesGameId: z.number().int().positive().optional(),
    accent: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "accent must be a #rrggbb hex color")
      .optional(),
    coverImage: z.string().optional(),
    phases: z.array(phaseSchema).optional(),
    trophies: z.array(trophySchema).min(1),
  })
  .superRefine((game, ctx) => {
    const trophyIds = new Set<string>();
    for (const t of game.trophies) {
      if (trophyIds.has(t.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `duplicate trophy id "${t.id}"`,
          path: ["trophies"],
        });
      }
      trophyIds.add(t.id);
    }

    const phaseIds = new Set((game.phases ?? []).map((p) => p.id));
    for (const t of game.trophies) {
      if (t.phase && !phaseIds.has(t.phase)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `trophy "${t.id}" references unknown phase "${t.phase}"`,
          path: ["trophies"],
        });
      }
      for (const req of t.requires) {
        if (!trophyIds.has(req)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `trophy "${t.id}" requires unknown trophy "${req}"`,
            path: ["trophies"],
          });
        }
      }
      if (t.steps) {
        const stepIds = new Set<string>();
        const groupIds = new Set((t.stepGroups ?? []).map((g) => g.id));
        for (const s of t.steps) {
          if (stepIds.has(s.id)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `trophy "${t.id}" has duplicate step id "${s.id}"`,
              path: ["trophies"],
            });
          }
          stepIds.add(s.id);
          if (s.group && !groupIds.has(s.group)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `trophy "${t.id}" step "${s.id}" references unknown group "${s.group}"`,
              path: ["trophies"],
            });
          }
        }
      }
    }
  });

export type GameFrontMatter = z.infer<typeof gameFrontMatterSchema>;
