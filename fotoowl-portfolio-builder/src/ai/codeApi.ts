/**
 * Client API for V2 Code AI — generate a custom React section component.
 */
import type {
  BlueprintNode,
  CustomComponentDefinition,
  PortfolioBlueprint,
} from '../blueprint';
import { createCustomComponentId } from '../components/custom';

const CODE_AI_ENDPOINT = '/api/ai/section/code';

export type SectionCodeAiSuccess = {
  ok: true;
  summary: string;
  definition: CustomComponentDefinition;
  source: 'remote' | 'local';
};

export type SectionCodeAiError = {
  ok: false;
  error: string;
  source?: 'remote' | 'local';
};

export type SectionCodeAiResult = SectionCodeAiSuccess | SectionCodeAiError;

function cssScopeForId(componentId: string): string {
  return `fo-${componentId.replace(/\./g, '-')}`;
}

/**
 * Ask Code AI to generate a brand-new custom component for the selected section.
 */
export async function runSectionCodeAi(
  blueprint: PortfolioBlueprint,
  sectionId: string,
  prompt: string,
): Promise<SectionCodeAiResult> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { ok: false, error: 'Prompt is empty' };
  }

  const section = blueprint.sections.find((s) => s.id === sectionId);
  if (!section) {
    return { ok: false, error: `Section "${sectionId}" not found` };
  }

  const kind =
    section.component?.includes('footer')
      ? 'footer'
      : section.component?.includes('hero')
        ? 'hero'
        : section.component?.includes('gallery')
          ? 'gallery'
          : section.component?.includes('about')
            ? 'about'
            : 'section';

  const componentId = createCustomComponentId(kind);
  const cssScope = cssScopeForId(componentId);

  try {
    const response = await fetch(CODE_AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: trimmed,
        sectionId,
        componentId,
        cssScope,
        section: {
          component: section.component,
          props: section.props ?? {},
        },
        portfolio: {
          id: blueprint.id,
          name: blueprint.name,
          themeId: blueprint.themeId,
        },
      }),
    });

    const data = (await response.json()) as SectionCodeAiResult;
    if (!data || typeof data !== 'object' || !('ok' in data)) {
      return { ok: false, error: 'Invalid Code AI response', source: 'remote' };
    }
    return data;
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : 'Code AI request failed',
      source: 'remote',
    };
  }
}

export function buildReplacePatchForCustomComponent(
  section: BlueprintNode,
  definition: CustomComponentDefinition,
) {
  return {
    op: 'replace' as const,
    targetId: section.id,
    node: {
      id: section.id,
      type: 'section' as const,
      component: definition.id,
      props: {
        ...definition.defaultProps,
      },
      styles: section.styles,
    },
  };
}
