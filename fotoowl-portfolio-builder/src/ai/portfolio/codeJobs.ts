/**
 * Portfolio → Code AI job planning.
 * Detects when Full Portfolio AI should generate sandboxed custom.* components.
 */
import type { PortfolioBlueprint } from '../../blueprint';

export type CodeAiKind = 'footer' | 'hero' | 'gallery' | 'about' | 'section';

export type PortfolioCodeAiJob = {
  /** replace an existing section, or add a new root section */
  mode: 'replace' | 'add';
  kind: CodeAiKind;
  /** Required for replace; for add, optional footer id used as insert-before hint */
  targetSectionId?: string;
  /** Prompt forwarded to Code AI */
  prompt: string;
};

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/** Shared trigger phrases (Section AI + Portfolio AI). */
export function wantsCodeAi(promptRaw: string): boolean {
  const p = promptRaw.toLowerCase();
  return [
    'brand-new custom',
    'new custom component',
    'generate a new component',
    'generate a brand-new',
    'completely new component',
    'custom react component',
    'create a custom component',
    'create a custom footer',
    'create a custom section',
    'brand new custom',
    'custom footer',
    'custom hero',
    'custom gallery',
    'custom about',
    'add a custom section',
    'add a brand-new custom',
    'generate a custom section',
    'generate a custom footer',
  ].some((needle) => p.includes(needle));
}

function inferKind(prompt: string): CodeAiKind {
  if (includesAny(prompt, ['footer'])) return 'footer';
  if (includesAny(prompt, ['hero'])) return 'hero';
  if (includesAny(prompt, ['gallery'])) return 'gallery';
  if (includesAny(prompt, ['about'])) return 'about';
  return 'section';
}

function findSectionIdByKind(
  blueprint: PortfolioBlueprint,
  kind: CodeAiKind,
): string | undefined {
  const match = blueprint.sections.find((s) => {
    const c = s.component ?? '';
    if (kind === 'footer') return c.includes('footer');
    if (kind === 'hero') return c.includes('hero');
    if (kind === 'gallery') return c.includes('gallery');
    if (kind === 'about') return c.includes('about');
    return false;
  });
  return match?.id;
}

function defaultIdForKind(kind: CodeAiKind): string {
  switch (kind) {
    case 'hero':
      return 'hero_01';
    case 'about':
      return 'about_01';
    case 'gallery':
      return 'gallery_01';
    case 'footer':
      return 'footer_01';
    default:
      return 'footer_01';
  }
}

/**
 * Plan zero or more Code AI jobs for a portfolio-scoped prompt.
 */
export function planPortfolioCodeAiJobs(
  blueprint: PortfolioBlueprint,
  promptRaw: string,
): PortfolioCodeAiJob[] {
  const prompt = promptRaw.trim();
  if (!prompt || !wantsCodeAi(prompt)) return [];

  const lower = prompt.toLowerCase();
  const kind = inferKind(lower);
  const wantsAdd = includesAny(lower, [
    'add a custom',
    'add a brand-new',
    'insert a custom',
    'another custom',
  ]);

  // Named family without "add" → replace that section.
  if (!wantsAdd && kind !== 'section') {
    const target =
      findSectionIdByKind(blueprint, kind) ?? defaultIdForKind(kind);
    return [
      {
        mode: 'replace',
        kind,
        targetSectionId: target,
        prompt,
      },
    ];
  }

  // Generic / explicit add → insert a new custom section (before footer).
  return [
    {
      mode: 'add',
      kind: kind === 'section' ? 'section' : kind,
      targetSectionId:
        findSectionIdByKind(blueprint, 'footer') ?? 'footer_01',
      prompt,
    },
  ];
}
