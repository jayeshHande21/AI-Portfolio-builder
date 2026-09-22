import { describe, expect, it } from 'vitest';
import { applyPatches, validateBlueprint } from '../../blueprint';
import {
  createPortfolioFromTheme,
  requireTheme,
  theme01,
  theme03,
} from '../../themes';
import { pickThemeFromPrompt, planPortfolioPatches } from './planner';

function sample() {
  return validateBlueprint(createPortfolioFromTheme(theme01));
}

describe('Portfolio AI planner', () => {
  it('picks themes from keywords', () => {
    expect(pickThemeFromPrompt('dark studio fashion')?.themeId).toBe(
      'theme-03',
    );
    expect(pickThemeFromPrompt('coastal portrait')?.themeId).toBe('theme-02');
    expect(pickThemeFromPrompt('luxury wedding cinematic')?.themeId).toBe(
      'theme-01',
    );
  });

  it('creates a wedding portfolio via theme switch', () => {
    const bp = sample();
    const result = planPortfolioPatches(
      bp,
      'Create a premium wedding photography portfolio',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.themeId).toBe('theme-01');
    expect(result.patches.length).toBeGreaterThan(0);

    const base = validateBlueprint(
      createPortfolioFromTheme(requireTheme(result.themeId!)),
    );
    const applied = applyPatches(base, result.patches);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(
      String(
        applied.blueprint.sections.find((s) => s.id === 'hero_01')?.props
          ?.subtitle,
      ),
    ).toMatch(/editorial|cinema|stillness/i);
  });

  it('makes the entire current portfolio more premium', () => {
    const bp = sample();
    const result = planPortfolioPatches(
      bp,
      'Make the entire portfolio more premium',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.themeId).toBeUndefined();
    expect(result.patches.length).toBeGreaterThanOrEqual(3);

    const applied = applyPatches(bp, result.patches);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(
      String(
        applied.blueprint.sections.find((s) => s.id === 'gallery_01')?.props
          ?.title,
      ),
    ).toMatch(/selected commissions/i);
  });

  it('switches to dark studio on explicit switch phrasing', () => {
    const bp = validateBlueprint(createPortfolioFromTheme(theme03));
    const result = planPortfolioPatches(
      bp,
      'Switch to a dark studio look',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.themeId).toBe('theme-03');
  });

  it('applies Style AI warmer palette without theme switch', () => {
    const bp = sample();
    const result = planPortfolioPatches(bp, 'Make the palette warmer');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.themeId).toBeUndefined();
    expect(result.tokens?.colors.accent).toBe('#8a5a2b');
  });

  it('rejects empty / unmapped prompts', () => {
    const bp = sample();
    expect(planPortfolioPatches(bp, '   ').ok).toBe(false);
    expect(planPortfolioPatches(bp, 'add a contact form widget').ok).toBe(
      false,
    );
  });
});
