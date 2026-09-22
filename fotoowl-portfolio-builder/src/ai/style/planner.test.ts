import { describe, expect, it } from 'vitest';
import { applyPatches, validateBlueprint } from '../../blueprint';
import { createPortfolioFromTheme, theme01 } from '../../themes';
import {
  isStyleIntent,
  mergeDesignTokens,
  planStyleChanges,
} from './planner';
import { defaultDesignTokens } from '../../themes/tokens';

function sample() {
  return validateBlueprint(createPortfolioFromTheme(theme01));
}

describe('Style AI planner', () => {
  it('merges design tokens leaf-wise', () => {
    const merged = mergeDesignTokens(defaultDesignTokens, {
      colors: { accent: '#ff0000' },
    });
    expect(merged.colors.accent).toBe('#ff0000');
    expect(merged.colors.ink).toBe(defaultDesignTokens.colors.ink);
  });

  it('applies a warmer palette via tokens', () => {
    const bp = sample();
    const plan = planStyleChanges(bp, 'Make the palette warmer');
    expect(plan).not.toBeNull();
    expect(plan?.tokens?.colors.accent).toBe('#8a5a2b');
    expect(plan?.summaries.some((s) => /warmer/i.test(s))).toBe(true);
  });

  it('applies darker palette and section polish patches', () => {
    const bp = sample();
    const plan = planStyleChanges(
      bp,
      'Use a darker moody palette and polish the look',
    );
    expect(plan).not.toBeNull();
    expect(plan?.tokens?.colors.paper).toBe('#12151a');
    expect(plan!.patches.length).toBeGreaterThan(0);

    const withTokens = validateBlueprint({
      ...bp,
      tokens: plan!.tokens,
    });
    const applied = applyPatches(withTokens, plan!.patches);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    const hero = applied.blueprint.sections.find((s) => s.id === 'hero_01');
    expect(hero?.styles?.padding).toBeTruthy();
  });

  it('detects style intents', () => {
    expect(isStyleIntent('warmer palette please')).toBe(true);
    expect(isStyleIntent('add more spacing')).toBe(true);
    expect(isStyleIntent('create a wedding portfolio')).toBe(false);
  });
});
