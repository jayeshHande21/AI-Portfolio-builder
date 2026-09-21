import { describe, expect, it } from 'vitest';
import { validateBlueprint } from '../blueprint';
import {
  createPortfolioFromTheme,
  getDefaultTheme,
  getTheme,
  listThemes,
  requireTheme,
  theme01,
} from '../themes';

describe('theme registry', () => {
  it('registers five starter themes', () => {
    expect(listThemes()).toHaveLength(5);
    expect(listThemes().map((t) => t.id)).toEqual([
      'theme-01',
      'theme-02',
      'theme-03',
      'theme-04',
      'theme-05',
    ]);
  });

  it('clones a theme without mutating the source', () => {
    const originalTitle = theme01.blueprint.sections[0]?.props?.title;
    const draft = createPortfolioFromTheme(theme01);
    draft.sections[0]!.props = { ...draft.sections[0]!.props, title: 'Changed' };

    expect(theme01.blueprint.sections[0]?.props?.title).toBe(originalTitle);
    expect(draft.themeId).toBe('theme-01');
    expect(draft.tokens).toEqual(theme01.tokens);
    expect(() => validateBlueprint(draft)).not.toThrow();
  });

  it('loads themes by id', () => {
    expect(getTheme('theme-03')?.name).toBe('Dark Studio');
    expect(requireTheme('theme-05').category).toBe('editorial');
    expect(getDefaultTheme().id).toBe('theme-01');
  });

  it('reuses shared component registry ids', () => {
    for (const theme of listThemes()) {
      for (const section of theme.blueprint.sections) {
        expect(section.component).toMatch(
          /^(hero|about|gallery|footer)\./,
        );
      }
    }
  });
});
