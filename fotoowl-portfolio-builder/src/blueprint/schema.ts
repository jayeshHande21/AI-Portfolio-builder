/**
 * Zod schemas for Portfolio Blueprint runtime validation.
 * Keep in sync with types.ts.
 */
import { z } from 'zod';

/** Placeholder schema — expand in Phase 2. */
export const portfolioBlueprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  sections: z.array(z.unknown()),
});

export type PortfolioBlueprintInput = z.infer<typeof portfolioBlueprintSchema>;
