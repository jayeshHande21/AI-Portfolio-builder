/**
 * OpenAI-compatible Code AI client for V2 custom section components.
 */
import { readSectionAiLlmConfig, type SectionAiLlmConfig } from '../sectionAi/llm';
import { buildLocalCustomComponent } from './localTemplate';
import { CODE_AI_SYSTEM_PROMPT, buildCodeAiUserPrompt } from './prompt';
import {
  parseAndValidateCodeAiResponse,
  type CodeAiValidated,
} from './validate';

export type CodeAiRequest = {
  prompt: string;
  sectionId: string;
  componentId: string;
  cssScope: string;
  section: { component?: string; props?: Record<string, unknown> };
  portfolio: { id: string; name: string; themeId?: string };
};

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function runCodeAi(
  env: Record<string, string | undefined>,
  request: CodeAiRequest,
): Promise<CodeAiValidated> {
  const config = readSectionAiLlmConfig(env);
  if (!config) {
    const local = buildLocalCustomComponent(request);
    const check = parseAndValidateCodeAiResponse(
      JSON.stringify({
        ok: true,
        summary: local.summary,
        component: {
          label: local.definition.label,
          description: local.definition.description,
          source: local.definition.source,
          css: local.definition.css,
          defaultProps: local.definition.defaultProps,
        },
      }),
      request.componentId,
      'local',
    );
    return check;
  }

  return runCodeAiLlm(config, request);
}

async function runCodeAiLlm(
  config: SectionAiLlmConfig,
  request: CodeAiRequest,
): Promise<CodeAiValidated> {
  const body: Record<string, unknown> = {
    model: config.model,
    temperature: 0.35,
    messages: [
      { role: 'system', content: CODE_AI_SYSTEM_PROMPT },
      { role: 'user', content: buildCodeAiUserPrompt(request) },
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
      error: data.error?.message || `LLM provider error (${response.status})`,
      source: 'remote',
    };
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    return {
      ok: false,
      error: 'Code AI returned an empty message',
      source: 'remote',
    };
  }

  return parseAndValidateCodeAiResponse(content, request.componentId, 'remote');
}

export { readSectionAiLlmConfig };
