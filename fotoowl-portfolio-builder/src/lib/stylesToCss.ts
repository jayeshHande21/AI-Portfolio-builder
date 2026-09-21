import type { CSSProperties } from 'react';
import type { NodeStyles } from '../blueprint/types';

/**
 * Map Blueprint node styles → React CSS properties for section roots.
 */
export function stylesToCss(styles?: NodeStyles | null): CSSProperties | undefined {
  if (!styles) return undefined;

  const css: CSSProperties = {};
  if (styles.background) css.background = styles.background;
  if (styles.color) css.color = styles.color;
  if (styles.padding) css.padding = styles.padding;
  if (styles.typography?.fontFamily) {
    css.fontFamily = styles.typography.fontFamily;
  }
  if (styles.typography?.fontSize) {
    css.fontSize = styles.typography.fontSize;
  }
  if (styles.typography?.fontWeight !== undefined) {
    css.fontWeight = styles.typography.fontWeight;
  }
  if (styles.typography?.letterSpacing) {
    css.letterSpacing = styles.typography.letterSpacing;
  }

  return Object.keys(css).length > 0 ? css : undefined;
}
