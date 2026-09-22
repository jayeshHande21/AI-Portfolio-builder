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
  it('registers six starter themes', () => {
    expect(listThemes()).toHaveLength(6);
    expect(listThemes().map((t) => t.id)).toEqual([
      'theme-01',
      'theme-02',
      'theme-03',
      'theme-04',
      'theme-05',
      'theme-06',
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
    expect(requireTheme('theme-06').name).toBe('Studio Monochrome');
    expect(requireTheme('theme-06').layouts).toBeUndefined();
    expect(requireTheme('theme-06').palettes).toBeUndefined();
    expect(getDefaultTheme().id).toBe('theme-01');
  });

  it('clones theme-06 with studio paper tokens', () => {
    const draft = createPortfolioFromTheme(requireTheme('theme-06'));
    expect(draft.tokens?.colors.paper).toBe('#E8E8E8');
    expect(draft.sections.some((s) => s.component === 'hero.layered')).toBe(true);
    expect(() => validateBlueprint(draft)).not.toThrow();
  });

  it('reuses shared component registry ids', () => {
    for (const theme of listThemes()) {
      for (const section of theme.blueprint.sections) {
        expect(section.component).toMatch(
          /^(hero|nav|about|work|feature|services|gallery|footer)\./,
        );
      }
    }
  });
});
