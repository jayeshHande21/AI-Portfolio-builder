/**
 * Validate Blueprint payloads before they reach the Canvas or storage.
 */
import { portfolioBlueprintSchema } from './schema';
import type { PortfolioBlueprint } from './types';

export function validateBlueprint(data: unknown): PortfolioBlueprint {
  return portfolioBlueprintSchema.parse(data) as PortfolioBlueprint;
}

export function isValidBlueprint(data: unknown): boolean {
  return portfolioBlueprintSchema.safeParse(data).success;
}

export function safeParseBlueprint(data: unknown) {
  return portfolioBlueprintSchema.safeParse(data);
}
