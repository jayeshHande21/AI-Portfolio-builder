/**
 * Frontend ↔ backend AI API client.
 * LLM credentials stay on the server — never in the React client.
 *
 * Flow:
 * 1. If `VITE_SECTION_AI_URL` is set, POST there
 * 2. Otherwise use the local Section AI planner (architecture POC)
 */
import type { BlueprintNode, PortfolioBlueprint } from '../blueprint';
import { planSectionPatches } from './section';
import type { SectionAiRequest, SectionAiResult } from './types';

const SECTION_AI_ENDPOINT =
  (import.meta.env.VITE_SECTION_AI_URL as string | undefined)?.trim() || '';

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
): Promise<SectionAiResult | null> {
  if (!SECTION_AI_ENDPOINT) {
    return null;
  }

  try {
    const response = await fetch(SECTION_AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const message = await response.text();
      return {
        ok: false,
        error: message || `Section AI failed (${response.status})`,
        source: 'remote',
      };
    }

    const data = (await response.json()) as SectionAiResult;
    if (!data || typeof data !== 'object' || !('ok' in data)) {
      return {
        ok: false,
        error: 'Invalid Section AI response shape',
        source: 'remote',
      };
    }
    return { ...data, source: 'remote' };
  } catch {
    return null;
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
  if (remote) {
    return remote;
  }

  return planSectionPatches(blueprint, sectionId, trimmed);
}
