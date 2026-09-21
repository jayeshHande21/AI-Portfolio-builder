import type { DesignTokens } from '../blueprint';

/** Default FotoOwl token structure — themes override values, not shape. */
export const defaultDesignTokens: DesignTokens = {
  colors: {
    ink: '#14181c',
    paper: '#f3f1ec',
    accent: '#0f6e6a',
    muted: '#5b656e',
  },
  typography: {
    display: '"Syne", "Avenir Next", sans-serif',
    body: '"Source Sans 3", "Segoe UI", sans-serif',
  },
  spacing: {
    sectionY: 'clamp(2.5rem, 7vw, 5rem)',
  },
  radius: '0.35rem',
};

/** Map tokens → CSS custom properties for the preview surface. */
export function tokensToCssVars(
  tokens: DesignTokens,
): Record<string, string> {
  return {
    '--fo-ink': tokens.colors.ink,
    '--fo-paper': tokens.colors.paper,
    '--fo-accent': tokens.colors.accent,
    '--fo-muted': tokens.colors.muted,
    '--fo-font-display': tokens.typography.display,
    '--fo-font-body': tokens.typography.body,
    '--fo-section-y': tokens.spacing.sectionY,
    '--fo-radius': tokens.radius,
  };
}
