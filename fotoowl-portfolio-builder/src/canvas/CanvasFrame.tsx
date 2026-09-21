import type { CSSProperties, ReactNode } from 'react';
import type { DesignTokens } from '../blueprint';
import { tokensToCssVars } from '../themes';

/**
 * Canvas shell — isolates editor chrome from the portfolio preview surface.
 * Applies theme design tokens as CSS variables for the preview.
 */
export function CanvasFrame({
  children,
  tokens,
}: {
  children: ReactNode;
  tokens?: DesignTokens;
}) {
  const style = tokens
    ? (tokensToCssVars(tokens) as CSSProperties)
    : undefined;

  return (
    <div className="fo-canvas" style={style}>
      {children}
    </div>
  );
}
