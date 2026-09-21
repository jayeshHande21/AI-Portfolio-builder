import type { DesignTokens, PortfolioBlueprint } from '../blueprint';

export type ThemeCategory =
  | 'wedding'
  | 'portrait'
  | 'editorial'
  | 'studio'
  | 'minimal';

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
}

export interface ThemeSummary {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  sectionCount: number;
  components: string[];
}
