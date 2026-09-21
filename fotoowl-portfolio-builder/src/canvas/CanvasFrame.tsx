import type { ReactNode } from 'react';

/**
 * Canvas shell — isolates editor chrome from the portfolio preview surface.
 */
export function CanvasFrame({ children }: { children: ReactNode }) {
  return <div className="fo-canvas">{children}</div>;
}
