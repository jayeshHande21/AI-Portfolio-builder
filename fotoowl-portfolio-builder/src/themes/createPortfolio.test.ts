import { describe, expect, it } from 'vitest';
import { validateBlueprint } from '../blueprint';
import { createBlankPortfolio, createPortfolioFromTheme, theme01 } from './index';

describe('createBlankPortfolio', () => {
  it('creates a valid empty draft for Flow B', () => {
    const draft = validateBlueprint(createBlankPortfolio());
    expect(draft.sections).toEqual([]);
    expect(draft.name).toBe('Untitled portfolio');
    expect(draft.themeId).toBeUndefined();
    expect(draft.tokens?.colors.ink).toBeTruthy();
  });

  it('stays distinct from theme clones', () => {
    const themed = createPortfolioFromTheme(theme01);
    const blank = createBlankPortfolio();
    expect(blank.sections.length).toBe(0);
    expect(themed.sections.length).toBeGreaterThan(0);
  });
});
