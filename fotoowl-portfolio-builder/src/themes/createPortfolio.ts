import type { PortfolioBlueprint } from '../blueprint';
import { defaultDesignTokens } from './tokens';
import type { CreatePortfolioOptions, ThemeDefinition } from './types';

export function applyThemeLayout(
  blueprint: PortfolioBlueprint,
  theme: ThemeDefinition,
  layoutId: string | undefined,
): PortfolioBlueprint {
  if (!layoutId || !theme.layouts?.length) return blueprint;
  const layout = theme.layouts.find((item) => item.id === layoutId);
  if (!layout) return blueprint;

  const byId = new Map(blueprint.sections.map((section) => [section.id, section]));
  const ordered = layout.sectionOrder
    .map((id) => byId.get(id))
    .filter((section): section is NonNullable<typeof section> => Boolean(section));

  const used = new Set(ordered.map((section) => section.id));
  const rest = blueprint.sections.filter((section) => !used.has(section.id));

  return {
    ...blueprint,
    sections: [...ordered, ...rest],
  };
}

export function applyThemePalette(
  blueprint: PortfolioBlueprint,
  theme: ThemeDefinition,
  paletteId: string | undefined,
): PortfolioBlueprint {
  const baseTokens = structuredClone(
    blueprint.tokens ?? theme.tokens ?? defaultDesignTokens,
  );
  if (!paletteId || !theme.palettes?.length) {
    return { ...blueprint, tokens: baseTokens };
  }
  const palette = theme.palettes.find((item) => item.id === paletteId);
  if (!palette) {
    return { ...blueprint, tokens: baseTokens };
  }
  return {
    ...blueprint,
    tokens: {
      ...baseTokens,
      colors: { ...palette.colors },
    },
  };
}

/**
 * Clone a theme into a fresh portfolio draft.
 * The original theme module/registry entry is never mutated.
 */
export function createPortfolioFromTheme(
  theme: ThemeDefinition,
  options: CreatePortfolioOptions = {},
): PortfolioBlueprint {
  let blueprint = structuredClone(theme.blueprint);
  blueprint = {
    ...blueprint,
    id: `portfolio-${theme.id}-draft`,
    name: theme.name,
    themeId: theme.id,
  };
  blueprint = applyThemeLayout(blueprint, theme, options.layoutId);
  blueprint = applyThemePalette(blueprint, theme, options.paletteId);
  return blueprint;
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
