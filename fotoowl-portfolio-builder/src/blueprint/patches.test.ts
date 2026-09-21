import { describe, expect, it } from 'vitest';
import {
  addNodePatch,
  applyPatch,
  applyPatches,
  deleteNodePatch,
  moveNodePatch,
  reorderSiblingsPatch,
  replaceNodePatch,
  updateNodePatch,
  validateBlueprint,
} from './index';
import { createPortfolioFromTheme, theme01 } from '../themes/theme-01';

function sampleBlueprint() {
  return validateBlueprint(createPortfolioFromTheme(theme01));
}

describe('Blueprint patch system', () => {
  it('rejects invalid patch payloads', () => {
    const bp = sampleBlueprint();
    const result = applyPatch(bp, { op: 'update', targetId: '' });
    expect(result.ok).toBe(false);
  });

  it('updates a section by stable id', () => {
    const bp = sampleBlueprint();
    const result = applyPatch(
      bp,
      updateNodePatch('about_01', {
        component: 'about.image_right',
        props: { title: 'Updated About' },
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const about = result.blueprint.sections.find((s) => s.id === 'about_01');
    expect(about?.component).toBe('about.image_right');
    expect(about?.props?.title).toBe('Updated About');
    // Other props preserved
    expect(about?.props?.ctaLabel).toBeTruthy();
  });

  it('adds a section at an index without mutating source theme ids', () => {
    const bp = sampleBlueprint();
    const result = applyPatch(
      bp,
      addNodePatch(
        {
          id: 'services_01',
          type: 'section',
          component: 'footer.minimal',
          props: { brand: 'Temp Services' },
        },
        { index: 2 },
      ),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.blueprint.sections.map((s) => s.id)).toEqual([
      'hero_01',
      'about_01',
      'services_01',
      'gallery_01',
      'footer_01',
    ]);
  });

  it('rejects add when id already exists', () => {
    const bp = sampleBlueprint();
    const result = applyPatch(
      bp,
      addNodePatch({
        id: 'about_01',
        type: 'section',
        component: 'about.image_left',
        props: {},
      }),
    );
    expect(result.ok).toBe(false);
  });

  it('deletes a section by id', () => {
    const bp = sampleBlueprint();
    const result = applyPatch(bp, deleteNodePatch('gallery_01'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.blueprint.sections.map((s) => s.id)).toEqual([
      'hero_01',
      'about_01',
      'footer_01',
    ]);
  });

  it('reorders root sections by orderedIds', () => {
    const bp = sampleBlueprint();
    const result = applyPatch(
      bp,
      reorderSiblingsPatch([
        'footer_01',
        'hero_01',
        'about_01',
        'gallery_01',
      ]),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.blueprint.sections.map((s) => s.id)).toEqual([
      'footer_01',
      'hero_01',
      'about_01',
      'gallery_01',
    ]);
  });

  it('rejects reorder that omits a sibling', () => {
    const bp = sampleBlueprint();
    const result = applyPatch(
      bp,
      reorderSiblingsPatch(['hero_01', 'about_01', 'gallery_01']),
    );
    expect(result.ok).toBe(false);
  });

  it('moves a section to a new index', () => {
    const bp = sampleBlueprint();
    const result = applyPatch(bp, moveNodePatch('footer_01', 0));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.blueprint.sections[0]?.id).toBe('footer_01');
  });

  it('replaces a section while preserving sibling structure', () => {
    const bp = sampleBlueprint();
    const result = applyPatch(
      bp,
      replaceNodePatch('about_01', {
        id: 'about_01',
        type: 'section',
        component: 'about.image_right',
        props: {
          title: 'Replaced About',
          body: 'New body',
          layout: 'image_right',
        },
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const about = result.blueprint.sections.find((s) => s.id === 'about_01');
    expect(about?.props?.title).toBe('Replaced About');
    expect(result.blueprint.sections).toHaveLength(4);
  });

  it('applies a patch sequence', () => {
    const bp = sampleBlueprint();
    const result = applyPatches(bp, [
      updateNodePatch('hero_01', { props: { title: 'New Hero' } }),
      deleteNodePatch('footer_01'),
      reorderSiblingsPatch(['gallery_01', 'hero_01', 'about_01']),
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.blueprint.sections.map((s) => s.id)).toEqual([
      'gallery_01',
      'hero_01',
      'about_01',
    ]);
    expect(result.blueprint.sections[1]?.props?.title).toBe('New Hero');
  });
});
