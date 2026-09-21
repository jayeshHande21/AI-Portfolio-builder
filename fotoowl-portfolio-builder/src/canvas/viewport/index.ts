/**
 * Viewport helpers (desktop / tablet / mobile preview widths).
 * Editor runtime concern — not stored in the Portfolio Blueprint.
 */
import type { Viewports } from '@puckeditor/core';

export type EditorViewportId = 'mobile' | 'tablet' | 'desktop';

export type EditorViewport = {
  id: EditorViewportId;
  width: number;
  height: 'auto';
  label: string;
  icon: 'Smartphone' | 'Tablet' | 'Monitor';
};

export const EDITOR_VIEWPORTS: Record<EditorViewportId, EditorViewport> = {
  mobile: {
    id: 'mobile',
    width: 360,
    height: 'auto',
    label: 'Mobile',
    icon: 'Smartphone',
  },
  tablet: {
    id: 'tablet',
    width: 768,
    height: 'auto',
    label: 'Tablet',
    icon: 'Tablet',
  },
  desktop: {
    id: 'desktop',
    width: 1280,
    height: 'auto',
    label: 'Desktop',
    icon: 'Monitor',
  },
};

export const DEFAULT_VIEWPORT: EditorViewportId = 'desktop';

export function getEditorViewport(
  id: EditorViewportId = DEFAULT_VIEWPORT,
): EditorViewport {
  return EDITOR_VIEWPORTS[id];
}

/** Puck `viewports` prop — shared options list. */
export function toPuckViewports(): Viewports {
  return (Object.values(EDITOR_VIEWPORTS) as EditorViewport[]).map((v) => ({
    width: v.width,
    height: v.height,
    label: v.label,
    icon: v.icon,
  }));
}

/** Initial Puck UI viewport selection from our editor state. */
export function toPuckViewportUi(id: EditorViewportId) {
  const viewport = getEditorViewport(id);
  return {
    current: {
      width: viewport.width,
      height: viewport.height,
    },
    controlsVisible: true,
    options: toPuckViewports(),
  };
}

export function viewportIdFromWidth(width: number | '100%'): EditorViewportId {
  if (width === '100%' || width >= 1024) return 'desktop';
  if (width >= 600) return 'tablet';
  return 'mobile';
}
