import type { DesignTokens, PortfolioBlueprint } from '../blueprint';

export type ThemeCategory =
  | 'wedding'
  | 'portrait'
  | 'editorial'
  | 'studio'
  | 'minimal';

/** Reorder sections by id for alternate arrangements of the same theme. */
export interface ThemeLayoutOption {
  id: string;
  name: string;
  description: string;
  /** Section ids from the theme blueprint, in display order. */
  sectionOrder: string[];
}

/** Light → dark (or other) color options applied at clone time. */
export interface ThemePaletteOption {
  id: string;
  name: string;
  /** Short label for the strip UI (e.g. Light, Mid, Dark). */
  swatchLabel: string;
  colors: DesignTokens['colors'];
}

/**
 * A theme is a reusable starting configuration — not a separate website impl.
 * Always clone via createPortfolioFromTheme; never mutate the source theme.
 */
export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  /** Shared Component Registry variants + content defaults. */
  blueprint: PortfolioBlueprint;
  tokens: DesignTokens;
  /** Optional layout arrangements shown in the theme picker. */
  layouts?: ThemeLayoutOption[];
  /** Optional palettes shown in the theme picker (prefer light → dark order). */
  palettes?: ThemePaletteOption[];
}

export interface CreatePortfolioOptions {
  layoutId?: string;
  paletteId?: string;
}

export interface ThemeSummary {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  sectionCount: number;
  components: string[];
}

export interface ThemeSummary {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  sectionCount: number;
  components: string[];
}
