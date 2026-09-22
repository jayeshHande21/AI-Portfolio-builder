/**
 * OpenAI-compatible chat client for Portfolio AI.
 * API keys stay on the server — never shipped to the browser.
 */
import {
  PORTFOLIO_AI_SYSTEM_PROMPT,
  buildPortfolioAiUserPrompt,
} from './prompt';
import {
  parseAndValidatePortfolioAiResponse,
  type ValidatedPortfolioAiResult,
} from './validate';
import { readSectionAiLlmConfig } from '../sectionAi/llm';

export type PortfolioAiLlmRequest = {
  prompt: string;
  blueprint: unknown;
};

export async function runPortfolioAiLlm(
  env: Record<string, string | undefined>,
  request: PortfolioAiLlmRequest,
): Promise<ValidatedPortfolioAiResult> {
  const config = readSectionAiLlmConfig(env);
  if (!config) {
    return {
      ok: false,
      error:
        'Portfolio AI LLM is not configured. Set OPENAI_API_KEY in .env (see .env.example).',
      source: 'remote',
    };
  }

  const body: Record<string, unknown> = {
    model: config.model,
    temperature: 0.3,
    messages: [
      { role: 'system', content: PORTFOLIO_AI_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildPortfolioAiUserPrompt(request),
      },
    ],
  };

  if (config.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const baseUrl = config.baseUrl.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let data: {
    choices?: Array<{ message?: { content?: string | null } }>;
    error?: { message?: string };
  };
  try {
    data = JSON.parse(rawText) as typeof data;
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

  return parseAndValidatePortfolioAiResponse(content);
}
