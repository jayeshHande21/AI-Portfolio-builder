import { describe, expect, it } from 'vitest';
import { validateBlueprint } from '../blueprint';
import {
  blueprintToPuckData,
  puckDataToBlueprint,
} from '../canvas/puck/adapter';
import { theme01, createPortfolioFromTheme } from '../themes';

describe('Blueprint ↔ Puck adapter', () => {
  it('validates the sample theme', () => {
    const draft = createPortfolioFromTheme(theme01);
    expect(() => validateBlueprint(draft)).not.toThrow();
  });

  it('round-trips sections and preserves About component id', () => {
    const original = validateBlueprint(createPortfolioFromTheme(theme01));
    const puckData = blueprintToPuckData(original);
    const restored = puckDataToBlueprint(puckData, original);

    expect(restored.sections.map((s) => s.component)).toEqual(
      original.sections.map((s) => s.component),
    );
    expect(restored.sections.map((s) => s.id)).toEqual(
      original.sections.map((s) => s.id),
    );
    expect(restored.assets).toEqual(original.assets);
  });

  it('maps about.image_right through Puck layout', () => {
    const original = validateBlueprint(createPortfolioFromTheme(theme01));
    original.sections = original.sections.map((section) =>
      section.id === 'about_01'
        ? { ...section, component: 'about.image_right' }
        : section,
    );

    const puckData = blueprintToPuckData(original);
    const aboutItem = puckData.content.find((item) => item.type === 'About');
    expect(aboutItem?.props).toMatchObject({
      id: 'about_01',
      layout: 'image_right',
    });

    const restored = puckDataToBlueprint(puckData, original);
    const about = restored.sections.find((s) => s.id === 'about_01');
    expect(about?.component).toBe('about.image_right');
  });
});
