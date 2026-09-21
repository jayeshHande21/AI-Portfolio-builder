/**
 * Theme registry — extendable catalog of starting Blueprints.
 * Five themes for now; scale toward ~30–40 later. All share Component Registry.
 */
import { theme01 } from './theme-01';
import { theme02 } from './theme-02';
import { theme03 } from './theme-03';
import { theme04 } from './theme-04';
import { theme05 } from './theme-05';
import type { ThemeDefinition, ThemeSummary } from './types';

export const DEFAULT_THEME_ID = 'theme-01';

const themesById: Record<string, ThemeDefinition> = {
  [theme01.id]: theme01,
  [theme02.id]: theme02,
  [theme03.id]: theme03,
  [theme04.id]: theme04,
  [theme05.id]: theme05,
};

/** Ordered catalog for pickers. */
export const themeRegistry: ThemeDefinition[] = [
  theme01,
  theme02,
  theme03,
  theme04,
  theme05,
];

export function listThemes(): ThemeDefinition[] {
  return [...themeRegistry];
}

export function listThemeSummaries(): ThemeSummary[] {
  return themeRegistry.map((theme) => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    category: theme.category,
    sectionCount: theme.blueprint.sections.length,
    components: theme.blueprint.sections
      .map((s) => s.component)
      .filter((c): c is string => Boolean(c)),
  }));
}

export function getTheme(themeId: string): ThemeDefinition | undefined {
  return themesById[themeId];
}

export function requireTheme(themeId: string): ThemeDefinition {
  const theme = getTheme(themeId);
  if (!theme) {
    throw new Error(`Unknown theme id: ${themeId}`);
  }
  return theme;
}

export function getDefaultTheme(): ThemeDefinition {
  return requireTheme(DEFAULT_THEME_ID);
}
