/**
 * Frontend ↔ Portfolio AI API client.
 * LLM credentials stay on the server — never in the React client.
 *
 * Flow:
 * 1. POST /api/ai/portfolio (Vite middleware → OpenAI-compatible LLM)
 * 2. If LLM is not configured (501), fall back to local keyword planner
 * 3. If LLM is configured but fails, surface the error (no silent keyword fallback)
 */
import type { PortfolioBlueprint } from '../blueprint';
import { planPortfolioPatches } from './portfolio';
import type { PortfolioAiRequest, PortfolioAiResult } from './types';

const PORTFOLIO_AI_ENDPOINT =
  (import.meta.env.VITE_PORTFOLIO_AI_URL as string | undefined)?.trim() ||
  '/api/ai/portfolio';

function buildRequest(
  blueprint: PortfolioBlueprint,
  prompt: string,
): PortfolioAiRequest {
  return {
    scope: 'portfolio',
    prompt,
    blueprint: structuredClone(blueprint),
  };
}

async function requestRemotePortfolioAi(
  payload: PortfolioAiRequest,
): Promise<{ result: PortfolioAiResult | null; allowLocalFallback: boolean }> {
  try {
    const response = await fetch(PORTFOLIO_AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.status === 404 || response.status === 501) {
      return { result: null, allowLocalFallback: true };
    }

    const data = (await response.json()) as PortfolioAiResult & {
      fallback?: boolean;
    };

    if (!data || typeof data !== 'object' || !('ok' in data)) {
      return {
        result: {
          ok: false,
          error: 'Invalid Portfolio AI response shape',
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
    return { result: null, allowLocalFallback: true };
  }
}

/**
 * Run Portfolio AI for the full Blueprint.
 * Returns structured patches (+ optional themeId) — never raw HTML or free JS.
 */
export async function runPortfolioAi(
  blueprint: PortfolioBlueprint,
  prompt: string,
): Promise<PortfolioAiResult> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { ok: false, error: 'Prompt is empty' };
  }

  const request = buildRequest(blueprint, trimmed);
  const remote = await requestRemotePortfolioAi(request);
  if (remote.result) {
    return remote.result;
  }

  if (remote.allowLocalFallback) {
    return planPortfolioPatches(blueprint, trimmed);
  }

  return {
    ok: false,
    error: 'Portfolio AI request failed',
    source: 'remote',
  };
}
