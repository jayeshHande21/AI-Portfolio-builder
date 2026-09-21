/**
 * Validate Code AI JSON → CustomComponentDefinition (+ sandbox).
 */
import { z } from 'zod';
import {
  validateCustomComponentCss,
  validateCustomComponentSource,
} from '../../src/components/custom/sandbox';
import type { CustomComponentDefinition } from '../../src/blueprint/types';

const llmComponentSchema = z.object({
  slug: z.string().min(1).optional(),
  label: z.string().min(1),
  description: z.string().optional(),
  source: z.string().min(1),
  css: z.string(),
  defaultProps: z.record(z.string(), z.unknown()).optional(),
});

const llmSuccessSchema = z.object({
  ok: z.literal(true),
  summary: z.string().min(1),
  component: llmComponentSchema,
});

const llmErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string().min(1),
});

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('Code AI response was not valid JSON');
  }
}

export type CodeAiValidated =
  | {
      ok: true;
      summary: string;
      definition: CustomComponentDefinition;
      source: 'remote' | 'local';
    }
  | { ok: false; error: string; source: 'remote' | 'local' };

export function parseAndValidateCodeAiResponse(
  raw: string,
  componentId: string,
  origin: 'remote' | 'local' = 'remote',
): CodeAiValidated {
  let parsed: unknown;
  try {
    parsed = extractJsonObject(raw);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid Code AI JSON',
      source: origin,
    };
  }

  const shape = z.union([llmSuccessSchema, llmErrorSchema]).safeParse(parsed);
  if (!shape.success) {
    return {
      ok: false,
      error: 'Code AI JSON did not match expected shape',
      source: origin,
    };
  }

  if (!shape.data.ok) {
    return { ok: false, error: shape.data.error, source: origin };
  }

  const sourceCheck = validateCustomComponentSource(shape.data.component.source);
  if (!sourceCheck.ok) {
    return { ok: false, error: sourceCheck.error, source: origin };
  }

  const cssCheck = validateCustomComponentCss(shape.data.component.css);
  if (!cssCheck.ok) {
    return { ok: false, error: cssCheck.error, source: origin };
  }

  if (!shape.data.component.source.includes(componentId)) {
    return {
      ok: false,
      error: `Component source must include data-component="${componentId}"`,
      source: origin,
    };
  }

  const definition: CustomComponentDefinition = {
    id: componentId,
    label: shape.data.component.label,
    source: shape.data.component.source,
    css: shape.data.component.css,
    defaultProps: shape.data.component.defaultProps ?? {},
    description: shape.data.component.description,
    createdAt: new Date().toISOString(),
  };

  return {
    ok: true,
    summary: shape.data.summary,
    definition,
    source: origin,
  };
}
