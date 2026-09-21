import { describe, expect, it } from 'vitest';
import { applyPatches, validateBlueprint } from '../../blueprint';
import { planSectionPatches } from './planner';
import { createPortfolioFromTheme, theme01 } from '../../themes';

function sample() {
  return validateBlueprint(createPortfolioFromTheme(theme01));
}

describe('Section AI planner', () => {
  it('moves About image to the right via update patch', () => {
    const bp = sample();
    const result = planSectionPatches(
      bp,
      'about_01',
      'Put the image on the right',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const applied = applyPatches(bp, result.patches);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(
      applied.blueprint.sections.find((s) => s.id === 'about_01')?.component,
    ).toBe('about.image_right');
  });

  it('makes About more premium', () => {
    const bp = sample();
    const result = planSectionPatches(bp, 'about_01', 'Make this more premium');
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const applied = applyPatches(bp, result.patches);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    const about = applied.blueprint.sections.find((s) => s.id === 'about_01');
    expect(String(about?.props?.body)).toMatch(/atmosphere|soft light/i);
  });

  it('replaces About with a new structured composition', () => {
    const bp = sample();
    const result = planSectionPatches(
      bp,
      'about_01',
      'Create a completely new About section',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.patches[0]?.op).toBe('replace');

    const applied = applyPatches(bp, result.patches);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(
      applied.blueprint.sections.find((s) => s.id === 'about_01')?.props?.title,
    ).toBe('About the photographer');
  });

  it('updates hero title from prompt', () => {
    const bp = sample();
    const result = planSectionPatches(
      bp,
      'hero_01',
      'Title: Quiet Frames',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const applied = applyPatches(bp, result.patches);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    expect(
      applied.blueprint.sections.find((s) => s.id === 'hero_01')?.props?.title,
    ).toBe('Quiet Frames');
  });

  it('rejects empty prompts and unknown sections', () => {
    const bp = sample();
    expect(planSectionPatches(bp, 'about_01', '   ').ok).toBe(false);
    expect(planSectionPatches(bp, 'missing', 'premium').ok).toBe(false);
  });
});
