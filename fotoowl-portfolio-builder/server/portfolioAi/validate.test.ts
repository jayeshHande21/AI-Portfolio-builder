/**
 * Validate Portfolio AI LLM response parsing (no network).
 */
import { describe, expect, it } from 'vitest';
import { normalizePortfolioPatch } from './sanitize';
import { parseAndValidatePortfolioAiResponse } from './validate';

describe('Portfolio AI sanitize', () => {
  it('defaults add.parentId to null when omitted', () => {
    const normalized = normalizePortfolioPatch({
      op: 'add',
      node: { id: 'x', type: 'section', component: 'footer.minimal', props: {} },
    }) as { parentId: null };
    expect(normalized.parentId).toBeNull();
  });

  it('fills replace.targetId from node.id', () => {
    const normalized = normalizePortfolioPatch({
      op: 'replace',
      node: {
        id: 'footer_01',
        type: 'section',
        component: 'footer.minimal',
        props: {},
      },
    }) as { targetId: string };
    expect(normalized.targetId).toBe('footer_01');
  });
});

describe('Portfolio AI validate', () => {
  it('accepts themeId-only create responses', () => {
    const result = parseAndValidatePortfolioAiResponse(
      JSON.stringify({
        ok: true,
        summary: 'Built coastal portrait portfolio',
        patches: [],
        themeId: 'theme-02',
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.themeId).toBe('theme-02');
    expect(result.patches).toEqual([]);
  });

  it('accepts tokens-only style responses', () => {
    const result = parseAndValidatePortfolioAiResponse(
      JSON.stringify({
        ok: true,
        summary: 'Warmed the palette',
        patches: [],
        tokens: {
          colors: {
            ink: '#1a1410',
            paper: '#f2ebe3',
            accent: '#8a5a2b',
            muted: '#6e6258',
          },
          typography: {
            display: '"Syne", sans-serif',
            body: '"Source Sans 3", sans-serif',
          },
          spacing: { sectionY: '3rem' },
          radius: '0.35rem',
        },
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens?.colors.accent).toBe('#8a5a2b');
  });

  it('skips invalid patches when themeId is present', () => {
    const result = parseAndValidatePortfolioAiResponse(
      JSON.stringify({
        ok: true,
        summary: 'Wedding portfolio',
        themeId: 'theme-01',
        patches: [
          { op: 'update', changes: { props: { title: 'Hi' } } },
          {
            op: 'update',
            targetId: 'hero_01',
            changes: { props: { title: 'Stories' } },
          },
        ],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.themeId).toBe('theme-01');
    expect(result.patches).toHaveLength(1);
    expect(result.skippedPatchCount).toBe(1);
  });

  it('rejects unsupported-only responses with fallback', () => {
    const result = parseAndValidatePortfolioAiResponse(
      JSON.stringify({
        ok: true,
        summary: 'Bad',
        patches: [
          {
            op: 'replace',
            targetId: 'hero_01',
            node: {
              id: 'hero_01',
              type: 'section',
              component: 'testimonials.grid',
              props: {},
            },
          },
        ],
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fallback).toBe(true);
  });

  it('rejects empty themeId and patches with fallback', () => {
    const result = parseAndValidatePortfolioAiResponse(
      JSON.stringify({
        ok: true,
        summary: 'Nothing',
        patches: [],
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fallback).toBe(true);
  });
});
