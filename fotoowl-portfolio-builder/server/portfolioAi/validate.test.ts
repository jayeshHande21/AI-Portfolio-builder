/**
 * Validate Portfolio AI LLM response parsing (no network).
 */
import { describe, expect, it } from 'vitest';
import { parseAndValidatePortfolioAiResponse } from './validate';

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

  it('rejects unsupported components', () => {
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
  });

  it('rejects empty themeId and patches', () => {
    const result = parseAndValidatePortfolioAiResponse(
      JSON.stringify({
        ok: true,
        summary: 'Nothing',
        patches: [],
      }),
    );
    expect(result.ok).toBe(false);
  });
});
