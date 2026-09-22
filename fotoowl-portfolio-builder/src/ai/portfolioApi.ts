/**
 * Frontend ↔ Portfolio AI API client.
 * LLM credentials stay on the server — never in the React client.
 *
 * Flow:
 * 1. POST /api/ai/portfolio (Vite middleware → OpenAI-compatible LLM)
 * 2. If LLM is not configured (501), fall back to local keyword planner
 * 3. If LLM returns invalid patches (422 / fallback), fall back to local planner
 * 4. Fulfill any Code AI jobs via /api/ai/section/code
 */
import type {
  CustomComponentDefinition,
  PortfolioBlueprint,
} from '../blueprint';
import { applyPatch } from '../blueprint';
import { createPortfolioFromTheme, requireTheme } from '../themes';
import { fulfillPortfolioCodeAiJob } from './codeApi';
import { planPortfolioPatches } from './portfolio';
import { planPortfolioCodeAiJobs } from './portfolio/codeJobs';
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

    // Not configured / missing route → local planner.
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
        allowLocalFallback: true,
      };
    }

    // Server asks for local fallback (invalid LLM patches, etc.).
    if (data.fallback || response.status === 422) {
      return { result: null, allowLocalFallback: true };
    }

    if (!data.ok) {
      return {
        result: { ...data, source: 'remote' },
        allowLocalFallback: true,
      };
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
 * Resolve Code AI jobs against the Blueprint that will exist after theme clone.
 */
async function fulfillCodeAiJobs(
  baseBlueprint: PortfolioBlueprint,
  result: Extract<PortfolioAiResult, { ok: true }>,
  prompt: string,
): Promise<PortfolioAiResult> {
  let jobs = result.codeAiJobs ?? [];
  if (jobs.length === 0) {
    jobs = planPortfolioCodeAiJobs(baseBlueprint, prompt);
  }
  if (jobs.length === 0) {
    return result;
  }

  // Jobs target section ids from the post-theme tree when themeId is set.
  let working: PortfolioBlueprint = baseBlueprint;
  if (result.themeId) {
    working = {
      ...createPortfolioFromTheme(requireTheme(result.themeId)),
      id: baseBlueprint.id,
    };
  }

  const customComponents: Record<string, CustomComponentDefinition> = {
    ...(result.customComponents ?? {}),
  };
  const patches = [...result.patches];
  const summaries = [result.summary];

  for (const job of jobs) {
    const fulfilled = await fulfillPortfolioCodeAiJob(working, job);
    if (!fulfilled.ok) {
      // Code AI failure should not wipe a successful theme/style plan.
      summaries.push(`Code AI skipped: ${fulfilled.error}`);
      continue;
    }
    customComponents[fulfilled.job.definition.id] = fulfilled.job.definition;
    patches.push(fulfilled.job.patch);
    summaries.push(fulfilled.job.summary);

    const applied = applyPatch(working, fulfilled.job.patch);
    if (applied.ok) {
      working = applied.blueprint;
    }
  }

  return {
    ok: true,
    summary: summaries.filter(Boolean).join(' '),
    patches,
    themeId: result.themeId,
    tokens: result.tokens,
    customComponents,
    source: result.source,
  };
}

/**
 * Run Portfolio AI for the full Blueprint.
 * Returns structured patches (+ optional themeId / tokens / customComponents).
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

  let result: PortfolioAiResult;
  if (remote.result?.ok) {
    result = remote.result;
  } else if (remote.allowLocalFallback) {
    result = planPortfolioPatches(blueprint, trimmed);
  } else if (remote.result) {
    return remote.result;
  } else {
    return {
      ok: false,
      error: 'Portfolio AI request failed',
      source: 'remote',
    };
  }

  if (!result.ok) return result;

  return fulfillCodeAiJobs(blueprint, result, trimmed);
}
