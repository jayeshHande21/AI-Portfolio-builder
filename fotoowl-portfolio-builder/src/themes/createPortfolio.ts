import type { PortfolioBlueprint } from '../blueprint';
import type { ThemeDefinition } from './types';

/**
 * Clone a theme into a fresh portfolio draft.
 * The original theme module/registry entry is never mutated.
 */
export function createPortfolioFromTheme(
  theme: ThemeDefinition,
): PortfolioBlueprint {
  const blueprint = structuredClone(theme.blueprint);
  return {
    ...blueprint,
    id: `portfolio-${theme.id}-draft`,
    name: theme.name,
    themeId: theme.id,
    tokens: structuredClone(theme.tokens),
  };
}
