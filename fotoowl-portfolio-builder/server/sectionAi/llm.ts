/**
 * OpenAI-compatible chat client for Section AI.
 * API keys stay on the server — never shipped to the browser.
 */
import {
  SECTION_AI_SYSTEM_PROMPT,
  buildSectionAiUserPrompt,
} from './prompt';
import {
  parseAndValidateSectionAiResponse,
  type ValidatedSectionAiResult,
} from './validate';

export type SectionAiLlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  /** Some providers reject response_format — disable via env if needed. */
  jsonMode: boolean;
};

export type SectionAiLlmRequest = {
  prompt: string;
  sectionId: string;
  section: unknown;
  portfolio: { id: string; name: string; themeId?: string };
};

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function readSectionAiLlmConfig(
  env: Record<string, string | undefined>,
): SectionAiLlmConfig | null {
  const apiKey = env.OPENAI_API_KEY?.trim() || env.SECTION_AI_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: (
      env.OPENAI_BASE_URL?.trim() ||
      env.SECTION_AI_BASE_URL?.trim() ||
      'https://api.openai.com/v1'
    ).replace(/\/$/, ''),
    model:
      env.OPENAI_MODEL?.trim() ||
      env.SECTION_AI_MODEL?.trim() ||
      'gpt-4o-mini',
    jsonMode: (env.SECTION_AI_JSON_MODE ?? 'true').toLowerCase() !== 'false',
  };
}

type ChatCompletionResponse = {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
  error?: { message?: string };
};

export async function runSectionAiLlm(
  config: SectionAiLlmConfig,
  request: SectionAiLlmRequest,
): Promise<ValidatedSectionAiResult> {
  const body: Record<string, unknown> = {
    model: config.model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: SECTION_AI_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildSectionAiUserPrompt(request),
      },
    ],
  };

  if (config.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(joinUrl(config.baseUrl, 'chat/completions'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let data: ChatCompletionResponse;
  try {
    data = JSON.parse(rawText) as ChatCompletionResponse;
  } catch {
    return {
      ok: false,
      error: `LLM provider returned non-JSON (${response.status})`,
      source: 'remote',
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      error:
        data.error?.message ||
        `LLM provider error (${response.status})`,
      source: 'remote',
    };
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    return {
      ok: false,
      error: 'LLM returned an empty message',
      source: 'remote',
    };
  }

  return parseAndValidateSectionAiResponse(content, request.sectionId);
}
