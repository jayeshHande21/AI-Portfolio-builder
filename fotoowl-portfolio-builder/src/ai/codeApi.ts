/**
 * Client API for V2 Code AI — generate a custom React section component.
 */
import type {
  BlueprintNode,
  BlueprintPatch,
  CustomComponentDefinition,
  PortfolioBlueprint,
} from '../blueprint';
import { addNodePatch, replaceNodePatch } from '../blueprint';
import { createCustomComponentId } from '../components/custom';
import type { PortfolioCodeAiJob } from './portfolio/codeJobs';

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

export type FulfilledCodeAiJob = {
  definition: CustomComponentDefinition;
  patch: BlueprintPatch;
  summary: string;
  source: 'remote' | 'local';
};

function cssScopeForId(componentId: string): string {
  return `fo-${componentId.replace(/\./g, '-')}`;
}

async function requestCodeAi(payload: {
  prompt: string;
  sectionId: string;
  componentId: string;
  cssScope: string;
  section: { component?: string; props?: Record<string, unknown> };
  portfolio: { id: string; name: string; themeId?: string };
}): Promise<SectionCodeAiResult> {
  try {
    const response = await fetch(CODE_AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

  return requestCodeAi({
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
  });
}

/**
 * Fulfill a Portfolio AI → Code AI job (replace or add).
 * Uses the same /api/ai/section/code endpoint as Section Code AI.
 */
export async function fulfillPortfolioCodeAiJob(
  blueprint: PortfolioBlueprint,
  job: PortfolioCodeAiJob,
): Promise<{ ok: true; job: FulfilledCodeAiJob } | SectionCodeAiError> {
  const componentId = createCustomComponentId(job.kind);
  const cssScope = cssScopeForId(componentId);

  if (job.mode === 'replace') {
    const targetId = job.targetSectionId;
    if (!targetId) {
      return { ok: false, error: 'Code AI replace job missing targetSectionId' };
    }
    const section = blueprint.sections.find((s) => s.id === targetId);
    const synthetic: BlueprintNode = section ?? {
      id: targetId,
      type: 'section',
      component:
        job.kind === 'footer'
          ? 'footer.minimal'
          : job.kind === 'hero'
            ? 'hero.editorial'
            : job.kind === 'about'
              ? 'about.image_left'
              : job.kind === 'gallery'
                ? 'gallery.masonry'
                : 'footer.minimal',
      props: {},
    };

    const result = await requestCodeAi({
      prompt: job.prompt,
      sectionId: targetId,
      componentId,
      cssScope,
      section: {
        component: synthetic.component,
        props: synthetic.props ?? {},
      },
      portfolio: {
        id: blueprint.id,
        name: blueprint.name,
        themeId: blueprint.themeId,
      },
    });

    if (!result.ok) return result;

    return {
      ok: true,
      job: {
        definition: result.definition,
        patch: buildReplacePatchForCustomComponent(synthetic, result.definition),
        summary: result.summary,
        source: result.source,
      },
    };
  }

  // add
  const newSectionId = `custom_sec_${Math.random().toString(36).slice(2, 8)}`;
  const result = await requestCodeAi({
    prompt: job.prompt,
    sectionId: newSectionId,
    componentId,
    cssScope,
    section: {
      component:
        job.kind === 'footer' ? 'footer.minimal' : `custom.${job.kind}`,
      props: {},
    },
    portfolio: {
      id: blueprint.id,
      name: blueprint.name,
      themeId: blueprint.themeId,
    },
  });

  if (!result.ok) return result;

  const node: BlueprintNode = {
    id: newSectionId,
    type: 'section',
    component: result.definition.id,
    props: { ...result.definition.defaultProps },
  };

  // Insert before footer when targetSectionId points at footer; else append.
  const footerIndex = blueprint.sections.findIndex(
    (s) =>
      s.id === job.targetSectionId ||
      (s.component ?? '').includes('footer'),
  );
  const index = footerIndex >= 0 ? footerIndex : undefined;

  return {
    ok: true,
    job: {
      definition: result.definition,
      patch: addNodePatch(node, { index }),
      summary: result.summary,
      source: result.source,
    },
  };
}

export function buildReplacePatchForCustomComponent(
  section: BlueprintNode,
  definition: CustomComponentDefinition,
): BlueprintPatch {
  return replaceNodePatch(section.id, {
    id: section.id,
    type: 'section',
    component: definition.id,
    props: {
      ...definition.defaultProps,
    },
    styles: section.styles,
  });
}
