/**
 * Style AI — portfolio look: design tokens + section styles.
 * Called by Portfolio AI orchestrator (local planner or LLM).
 * Does not invent components; only tokens and node.styles / tone-adjacent props.
 */
import type {
  BlueprintNode,
  BlueprintPatch,
  DesignTokens,
  NodeStyles,
  PortfolioBlueprint,
} from '../../blueprint';
import { updateNodePatch } from '../../blueprint';
import { defaultDesignTokens } from '../../themes/tokens';

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/** Deep-merge tokens; override wins per leaf. */
export function mergeDesignTokens(
  base: DesignTokens,
  override: {
    colors?: Partial<DesignTokens['colors']>;
    typography?: Partial<DesignTokens['typography']>;
    spacing?: Partial<DesignTokens['spacing']>;
    radius?: string;
  },
): DesignTokens {
  return {
    colors: {
      ...base.colors,
      ...(override.colors ?? {}),
    },
    typography: {
      ...base.typography,
      ...(override.typography ?? {}),
    },
    spacing: {
      ...base.spacing,
      ...(override.spacing ?? {}),
    },
    radius: override.radius ?? base.radius,
  };
}

export type StylePlan = {
  /** Full token set to apply on the Blueprint (after theme clone if any). */
  tokens?: DesignTokens;
  /** Section-level style (and light copy) patches. */
  patches: BlueprintPatch[];
  summaries: string[];
};

type PaletteId =
  | 'warmer'
  | 'cooler'
  | 'darker'
  | 'lighter'
  | 'ink_black'
  | 'olive'
  | 'slate';

const PALETTES: Record<PaletteId, DesignTokens['colors']> = {
  warmer: {
    ink: '#1a1410',
    paper: '#f2ebe3',
    accent: '#8a5a2b',
    muted: '#6e6258',
  },
  cooler: {
    ink: '#0e1c24',
    paper: '#eef3f5',
    accent: '#2a6f97',
    muted: '#5a7380',
  },
  darker: {
    ink: '#f0ebe4',
    paper: '#12151a',
    accent: '#c9844a',
    muted: '#9a948c',
  },
  lighter: {
    ink: '#1c2228',
    paper: '#faf9f7',
    accent: '#3d6b5a',
    muted: '#6a737c',
  },
  ink_black: {
    ink: '#0b0d10',
    paper: '#e8e6e1',
    accent: '#c45c26',
    muted: '#8a8580',
  },
  olive: {
    ink: '#1a1f16',
    paper: '#f1efe8',
    accent: '#5c6b3a',
    muted: '#6d7264',
  },
  slate: {
    ink: '#16191d',
    paper: '#f4f5f6',
    accent: '#4a5560',
    muted: '#6b737c',
  },
};

function pickPalette(prompt: string): { id: PaletteId; label: string } | null {
  if (includesAny(prompt, ['dark mode', 'darker', 'night', 'moody dark'])) {
    return { id: 'darker', label: 'dark moody palette' };
  }
  if (includesAny(prompt, ['lighter', 'brighter', 'airy', 'high key'])) {
    return { id: 'lighter', label: 'lighter airy palette' };
  }
  if (includesAny(prompt, ['warmer', 'warm palette', 'warm tones', 'golden'])) {
    return { id: 'warmer', label: 'warmer palette' };
  }
  if (includesAny(prompt, ['cooler', 'cool palette', 'cool tones', 'blue tones'])) {
    return { id: 'cooler', label: 'cooler palette' };
  }
  if (includesAny(prompt, ['olive', 'forest', 'earthy green'])) {
    return { id: 'olive', label: 'olive accent palette' };
  }
  if (includesAny(prompt, ['slate', 'neutral grey', 'neutral gray', 'monochrome'])) {
    return { id: 'slate', label: 'slate neutral palette' };
  }
  if (includesAny(prompt, ['ink black', 'high contrast black'])) {
    return { id: 'ink_black', label: 'ink-black studio palette' };
  }
  return null;
}

function pickTypography(
  prompt: string,
): { display: string; body: string; label: string } | null {
  if (includesAny(prompt, ['serif', 'editorial type', 'classic type'])) {
    return {
      display: '"Libre Baskerville", "Times New Roman", serif',
      body: '"Source Sans 3", "Segoe UI", sans-serif',
      label: 'editorial serif display',
    };
  }
  if (includesAny(prompt, ['modern sans', 'geometric type', 'clean type'])) {
    return {
      display: '"Syne", "Avenir Next", sans-serif',
      body: '"Source Sans 3", "Segoe UI", sans-serif',
      label: 'modern sans typography',
    };
  }
  return null;
}

function pickSpacing(
  prompt: string,
): { sectionY: string; label: string } | null {
  if (includesAny(prompt, ['more space', 'more spacing', 'airier', 'looser'])) {
    return {
      sectionY: 'clamp(3.5rem, 10vw, 7rem)',
      label: 'increased section spacing',
    };
  }
  if (includesAny(prompt, ['tighter', 'compact', 'less spacing', 'dense'])) {
    return {
      sectionY: 'clamp(1.75rem, 4vw, 3rem)',
      label: 'tighter section spacing',
    };
  }
  return null;
}

function sectionStylePatch(
  section: BlueprintNode,
  styles: NodeStyles,
  summary: string,
): { patch: BlueprintPatch; summary: string } {
  return {
    patch: updateNodePatch(section.id, {
      styles: {
        ...(section.styles ?? {}),
        ...styles,
        typography: {
          ...(section.styles?.typography ?? {}),
          ...(styles.typography ?? {}),
        },
      },
    }),
    summary,
  };
}

function wantsSectionStyles(prompt: string): boolean {
  return includesAny(prompt, [
    'section background',
    'hero background',
    'padded',
    'more padding',
    'less padding',
    'letter spacing',
    'tracking',
    'restyle sections',
    'visual polish',
    'polish the look',
    'style the sections',
  ]);
}

function premiumSectionStyles(
  sections: BlueprintNode[],
): { patches: BlueprintPatch[]; summaries: string[] } {
  const patches: BlueprintPatch[] = [];
  const summaries: string[] = [];

  for (const section of sections) {
    const component = section.component ?? '';
    if (component === 'hero.editorial') {
      const { patch, summary } = sectionStylePatch(
        section,
        {
          padding: 'clamp(3rem, 8vw, 6rem) clamp(1.25rem, 4vw, 3rem)',
          typography: { letterSpacing: '-0.03em', fontWeight: 600 },
        },
        `Polished Hero spacing (${section.id})`,
      );
      patches.push(patch);
      summaries.push(summary);
    } else if (
      component === 'about.image_left' ||
      component === 'about.image_right'
    ) {
      const { patch, summary } = sectionStylePatch(
        section,
        {
          padding: 'clamp(2.5rem, 6vw, 4.5rem) clamp(1.25rem, 4vw, 2.5rem)',
        },
        `Polished About spacing (${section.id})`,
      );
      patches.push(patch);
      summaries.push(summary);
    } else if (component === 'gallery.masonry') {
      const { patch, summary } = sectionStylePatch(
        section,
        {
          padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
        },
        `Polished Gallery spacing (${section.id})`,
      );
      patches.push(patch);
      summaries.push(summary);
    } else if (component === 'footer.minimal') {
      const { patch, summary } = sectionStylePatch(
        section,
        {
          padding: '1.75rem clamp(1rem, 3vw, 2rem)',
          typography: { letterSpacing: '0.04em' },
        },
        `Polished Footer spacing (${section.id})`,
      );
      patches.push(patch);
      summaries.push(summary);
    }
  }

  return { patches, summaries };
}

function explicitSectionBackgroundPatches(
  sections: BlueprintNode[],
  prompt: string,
): { patches: BlueprintPatch[]; summaries: string[] } {
  const patches: BlueprintPatch[] = [];
  const summaries: string[] = [];

  let background: string | null = null;
  if (includesAny(prompt, ['soft paper', 'warm paper background'])) {
    background = '#f2ebe3';
  } else if (includesAny(prompt, ['cool paper', 'blue paper background'])) {
    background = '#eef3f5';
  } else if (includesAny(prompt, ['dark background', 'charcoal background'])) {
    background = '#12151a';
  }

  if (!background) return { patches, summaries };

  const hero = sections.find((s) => s.component === 'hero.editorial');
  if (hero && includesAny(prompt, ['hero', 'section background', 'background'])) {
    const { patch, summary } = sectionStylePatch(
      hero,
      { background },
      `Set Hero background (${hero.id})`,
    );
    patches.push(patch);
    summaries.push(summary);
  } else if (hero && includesAny(prompt, ['background'])) {
    const { patch, summary } = sectionStylePatch(
      hero,
      { background },
      `Set Hero background (${hero.id})`,
    );
    patches.push(patch);
    summaries.push(summary);
  }

  return { patches, summaries };
}

/**
 * Plan Style AI changes from a natural-language portfolio prompt.
 * Returns null when the prompt has no style intent.
 */
export function planStyleChanges(
  blueprint: PortfolioBlueprint,
  promptRaw: string,
): StylePlan | null {
  const prompt = promptRaw.trim().toLowerCase();
  if (!prompt) return null;

  const baseTokens = blueprint.tokens ?? defaultDesignTokens;
  let tokens: DesignTokens | undefined;
  const summaries: string[] = [];
  const patches: BlueprintPatch[] = [];

  const palette = pickPalette(prompt);
  if (palette) {
    tokens = mergeDesignTokens(baseTokens, { colors: PALETTES[palette.id] });
    summaries.push(`Applied ${palette.label}`);
  }

  const typography = pickTypography(prompt);
  if (typography) {
    tokens = mergeDesignTokens(tokens ?? baseTokens, {
      typography: {
        display: typography.display,
        body: typography.body,
      },
    });
    summaries.push(`Set ${typography.label}`);
  }

  const spacing = pickSpacing(prompt);
  if (spacing) {
    tokens = mergeDesignTokens(tokens ?? baseTokens, {
      spacing: { sectionY: spacing.sectionY },
    });
    summaries.push(`Set ${spacing.label}`);
  }

  const premiumLook = includesAny(prompt, [
    'premium',
    'luxury',
    'elegant',
    'polished',
    'visual polish',
    'polish the look',
    'cohesive',
  ]);

  if (premiumLook || wantsSectionStyles(prompt)) {
    const polished = premiumSectionStyles(blueprint.sections);
    patches.push(...polished.patches);
    summaries.push(...polished.summaries);
  }

  const bg = explicitSectionBackgroundPatches(blueprint.sections, prompt);
  patches.push(...bg.patches);
  summaries.push(...bg.summaries);

  if (!tokens && patches.length === 0) {
    return null;
  }

  return { tokens, patches, summaries };
}

/** True when prompt is primarily a style/token request (for planner routing). */
export function isStyleIntent(promptRaw: string): boolean {
  const prompt = promptRaw.trim().toLowerCase();
  return Boolean(
    pickPalette(prompt) ||
      pickTypography(prompt) ||
      pickSpacing(prompt) ||
      wantsSectionStyles(prompt) ||
      includesAny(prompt, [
        'palette',
        'color scheme',
        'colours',
        'colors',
        'typography',
        'typeface',
        'look and feel',
        'visual style',
        'restyle',
      ]),
  );
}
