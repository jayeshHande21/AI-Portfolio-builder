/**
 * Frontend ↔ Section AI API client.
 * LLM credentials stay on the server — never in the React client.
 *
 * Flow:
 * 1. POST /api/ai/section (Vite middleware → OpenAI-compatible LLM)
 * 2. If LLM is not configured (501), fall back to local keyword planner
 * 3. If LLM is configured but fails, surface the error (no silent keyword fallback)
 */
import type { BlueprintNode, PortfolioBlueprint } from '../blueprint';
import { planSectionPatches } from './section';
import type { SectionAiRequest, SectionAiResult } from './types';

const SECTION_AI_ENDPOINT =
  (import.meta.env.VITE_SECTION_AI_URL as string | undefined)?.trim() ||
  '/api/ai/section';

function buildRequest(
  blueprint: PortfolioBlueprint,
  sectionId: string,
  prompt: string,
): SectionAiRequest | SectionAiResult {
  const section = blueprint.sections.find((s) => s.id === sectionId);
  if (!section) {
    return { ok: false, error: `Section "${sectionId}" not found` };
  }

  return {
    scope: 'section',
    prompt,
    sectionId,
    section: structuredClone(section) as BlueprintNode,
    portfolio: {
      id: blueprint.id,
      name: blueprint.name,
      themeId: blueprint.themeId,
    },
  };
}

async function requestRemoteSectionAi(
  payload: SectionAiRequest,
): Promise<{ result: SectionAiResult | null; allowLocalFallback: boolean }> {
  try {
    const response = await fetch(SECTION_AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // No route / not configured → local planner.
    if (response.status === 404 || response.status === 501) {
      return { result: null, allowLocalFallback: true };
    }

    const data = (await response.json()) as SectionAiResult & {
      fallback?: boolean;
    };

    if (!data || typeof data !== 'object' || !('ok' in data)) {
      return {
        result: {
          ok: false,
          error: 'Invalid Section AI response shape',
          source: 'remote',
        },
        allowLocalFallback: false,
      };
    }

    if (data.fallback) {
      return { result: null, allowLocalFallback: true };
    }

    return {
      result: { ...data, source: 'remote' },
      allowLocalFallback: false,
    };
  } catch {
    // Dev server restart / offline — local fallback.
    return { result: null, allowLocalFallback: true };
  }
}

/**
 * Run Section AI for the selected node.
 * Returns structured patches only — never raw HTML or free JS.
 */
export async function runSectionAi(
  blueprint: PortfolioBlueprint,
  sectionId: string,
  prompt: string,
): Promise<SectionAiResult> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { ok: false, error: 'Prompt is empty' };
  }

  const request = buildRequest(blueprint, sectionId, trimmed);
  if ('ok' in request && request.ok === false) {
    return request;
  }

  const remote = await requestRemoteSectionAi(request as SectionAiRequest);
  if (remote.result) {
    return remote.result;
  }

  if (remote.allowLocalFallback) {
    return planSectionPatches(blueprint, sectionId, trimmed);
  }

  return {
    ok: false,
    error: 'Section AI request failed',
    source: 'remote',
  };
}
