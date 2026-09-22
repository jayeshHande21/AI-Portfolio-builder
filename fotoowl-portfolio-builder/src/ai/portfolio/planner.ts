/**
 * Local Portfolio AI planner — prompt → theme pick + structured Blueprint patches.
 *
 * Phase 9 first slice: works without LLM keys. Remote orchestrator preferred when configured.
 */
import type { BlueprintNode, BlueprintPatch, PortfolioBlueprint } from '../../blueprint';
import { updateNodePatch } from '../../blueprint';
import type { PortfolioAiResult } from '../types';

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function asProps(node: BlueprintNode): Record<string, unknown> {
  return { ...(node.props ?? {}) };
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

type ThemePick = {
  themeId: string;
  label: string;
};

/**
 * Map natural-language portfolio intent → closest catalog theme.
 */
export function pickThemeFromPrompt(prompt: string): ThemePick | null {
  const p = prompt.toLowerCase();

  if (
    includesAny(p, [
      'coastal',
      'shore',
      'beach',
      'portrait lifestyle',
      'natural light portrait',
    ])
  ) {
    return { themeId: 'theme-02', label: 'Coastal Portrait' };
  }
  if (
    includesAny(p, [
      'dark studio',
      'studio',
      'fashion',
      'shadow',
      'black background',
    ])
  ) {
    return { themeId: 'theme-03', label: 'Dark Studio' };
  }
  if (
    includesAny(p, ['minimal', 'clean brand', 'simple brand', 'brand portfolio'])
  ) {
    return { themeId: 'theme-04', label: 'Minimal Brand' };
  }
  if (
    includesAny(p, ['documentary', 'travel', 'reportage', 'on the road'])
  ) {
    return { themeId: 'theme-05', label: 'Documentary Travel' };
  }
  if (
    includesAny(p, [
      'wedding',
      'editorial',
      'cinematic',
      'luxury',
      'couples',
      'fine art',
    ])
  ) {
    return { themeId: 'theme-01', label: 'Editorial Wedding' };
  }

  return null;
}

function wantsCreate(prompt: string): boolean {
  return includesAny(prompt, [
    'create',
    'build me',
    'build a',
    'build an',
    'rebuild',
    'start over',
    'new portfolio',
    'make me a',
    'generate a portfolio',
    'entire portfolio from',
  ]);
}

function wantsPremium(prompt: string): boolean {
  return includesAny(prompt, [
    'premium',
    'luxury',
    'elegant',
    'more refined',
    'cohesive',
    'polished',
  ]);
}

function premiumPatchesForSections(
  sections: BlueprintNode[],
): { patches: BlueprintPatch[]; summaries: string[] } {
  const patches: BlueprintPatch[] = [];
  const summaries: string[] = [];

  for (const section of sections) {
    const props = asProps(section);
    const component = section.component ?? '';

    if (component === 'hero.editorial') {
      patches.push(
        updateNodePatch(section.id, {
          props: {
            ...props,
            eyebrow: text(props.eyebrow) || 'Fine art photography',
            title: text(props.title) || 'Stories Worth Remembering',
            subtitle:
              'An editorial portfolio for couples and brands who want cinema in stillness — restrained, luminous, and deeply human.',
            ctaLabel: text(props.ctaLabel) || 'View the collection',
          },
          styles: {
            ...(section.styles ?? {}),
            typography: {
              ...(section.styles?.typography ?? {}),
              letterSpacing: '-0.02em',
            },
          },
        }),
      );
      summaries.push(`Refined Hero (${section.id})`);
    } else if (
      component === 'about.image_left' ||
      component === 'about.image_right'
    ) {
      patches.push(
        updateNodePatch(section.id, {
          props: {
            ...props,
            title: text(props.title) || 'A quieter kind of portrait',
            body:
              'Crafted for photographers who care about atmosphere as much as likeness — soft light, deliberate pacing, and frames that feel collected rather than produced.',
            ctaLabel: text(props.ctaLabel) || 'Inquire about availability',
          },
        }),
      );
      summaries.push(`Refined About (${section.id})`);
    } else if (component === 'gallery.masonry') {
      patches.push(
        updateNodePatch(section.id, {
          props: {
            ...props,
            title: 'Selected commissions',
          },
        }),
      );
      summaries.push(`Refined Gallery (${section.id})`);
    } else if (component === 'footer.minimal') {
      patches.push(
        updateNodePatch(section.id, {
          props: {
            ...props,
            tagline: 'Fine art photography',
          },
        }),
      );
      summaries.push(`Refined Footer (${section.id})`);
    }
  }

  return { patches, summaries };
}

/**
 * Plan portfolio-scoped changes from a natural-language prompt.
 */
export function planPortfolioPatches(
  blueprint: PortfolioBlueprint,
  promptRaw: string,
): PortfolioAiResult {
  const prompt = promptRaw.trim().toLowerCase();
  if (!prompt) {
    return { ok: false, error: 'Prompt is empty', source: 'local' };
  }

  const create = wantsCreate(prompt);
  const premium = wantsPremium(prompt);
  const themePick = pickThemeFromPrompt(prompt);

  // Create / rebuild → switch theme (or default editorial) + optional premium pass.
  if (create) {
    const pick = themePick ?? {
      themeId: 'theme-01',
      label: 'Editorial Wedding',
    };
    const summaries = [`Switched base to ${pick.label}`];
    let patches: BlueprintPatch[] = [];

    // Premium copy is applied after the client clones the theme (same section ids).
    if (premium || !themePick) {
      // Patches target canonical theme section ids; applied after theme clone.
      const stubSections: BlueprintNode[] = [
        { id: 'hero_01', type: 'section', component: 'hero.editorial', props: {} },
        {
          id: 'about_01',
          type: 'section',
          component: 'about.image_left',
          props: {},
        },
        {
          id: 'gallery_01',
          type: 'section',
          component: 'gallery.masonry',
          props: {},
        },
        {
          id: 'footer_01',
          type: 'section',
          component: 'footer.minimal',
          props: {},
        },
      ];
      const premiumed = premiumPatchesForSections(stubSections);
      patches = premiumed.patches;
      if (premium) {
        summaries.push('Applied premium tone across sections');
      } else {
        summaries.push('Tuned default editorial copy');
      }
    }

    return {
      ok: true,
      summary: summaries.join('. ') + '.',
      patches,
      themeId: pick.themeId,
      source: 'local',
    };
  }

  // Restyle current portfolio (no theme switch unless explicitly matched + "switch").
  if (premium) {
    const { patches, summaries } = premiumPatchesForSections(blueprint.sections);
    if (patches.length === 0) {
      return {
        ok: false,
        error:
          'No editable built-in sections found to restyle. Try rebuilding with a theme prompt.',
        source: 'local',
      };
    }

    const wantsThemeSwitch = includesAny(prompt, [
      'switch theme',
      'change theme',
      'use the',
      'as a',
    ]);
    const themeId =
      wantsThemeSwitch && themePick ? themePick.themeId : undefined;

    return {
      ok: true,
      summary:
        (themeId
          ? `Switched theme then made the portfolio more premium. `
          : '') +
        summaries.join('. ') +
        '.',
      patches,
      themeId,
      source: 'local',
    };
  }

  // Explicit theme switch without "create"
  if (
    themePick &&
    includesAny(prompt, [
      'switch',
      'change to',
      'use theme',
      'make it',
      'feel like',
    ])
  ) {
    return {
      ok: true,
      summary: `Switched base to ${themePick.label}.`,
      patches: [],
      themeId: themePick.themeId,
      source: 'local',
    };
  }

  return {
    ok: false,
    error:
      'Could not map that prompt to a portfolio change. Try: “Create a premium wedding portfolio”, “Make the entire portfolio more premium”, or “Switch to a dark studio look”.',
    source: 'local',
  };
}
