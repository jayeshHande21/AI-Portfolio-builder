import { describe, expect, it } from 'vitest';
import {
  DEFAULT_VIEWPORT,
  getEditorViewport,
  toPuckViewportUi,
  toPuckViewports,
  viewportIdFromWidth,
} from './index';

describe('editor viewports', () => {
  it('defaults to desktop', () => {
    expect(DEFAULT_VIEWPORT).toBe('desktop');
    expect(getEditorViewport().width).toBe(1280);
  });

  it('maps widths to viewport ids', () => {
    expect(viewportIdFromWidth(360)).toBe('mobile');
    expect(viewportIdFromWidth(768)).toBe('tablet');
    expect(viewportIdFromWidth(1280)).toBe('desktop');
    expect(viewportIdFromWidth('100%')).toBe('desktop');
  });

  it('builds puck viewport config', () => {
    expect(toPuckViewports()).toHaveLength(3);
    expect(toPuckViewportUi('tablet').current.width).toBe(768);
  });
});
