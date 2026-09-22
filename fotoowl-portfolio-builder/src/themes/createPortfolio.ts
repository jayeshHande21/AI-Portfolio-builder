import type { PortfolioBlueprint } from '../blueprint';
import { defaultDesignTokens } from './tokens';
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

/**
 * Empty draft for Flow B — build the whole portfolio with Portfolio AI.
 * No sections yet; Canvas opens blank and Portfolio AI fills the Blueprint.
 */
export function createBlankPortfolio(): PortfolioBlueprint {
  return {
    id: `portfolio-blank-${Date.now().toString(36)}`,
    name: 'Untitled portfolio',
    assets: {},
    sections: [],
    tokens: structuredClone(defaultDesignTokens),
  };
}
