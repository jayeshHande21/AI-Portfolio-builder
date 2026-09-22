/**
 * Validate + scope-check LLM Portfolio AI JSON before it reaches the Canvas.
 */
import { z } from 'zod';
import { blueprintPatchSchema } from '../../src/blueprint/patchSchema';
import { designTokensSchema } from '../../src/blueprint/schema';

const ALLOWED_COMPONENTS = [
  'hero.editorial',
  'about.image_left',
  'about.image_right',
  'gallery.masonry',
  'footer.minimal',
] as const;

const ALLOWED_THEMES = [
  'theme-01',
  'theme-02',
  'theme-03',
  'theme-04',
  'theme-05',
] as const;

const llmSuccessSchema = z.object({
  ok: z.literal(true),
  summary: z.string().min(1),
  patches: z.array(z.unknown()).default([]),
  themeId: z.string().optional(),
  tokens: designTokensSchema.optional(),
});

const llmErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string().min(1),
});

const llmResponseSchema = z.union([llmSuccessSchema, llmErrorSchema]);

export type ValidatedPortfolioAiSuccess = {
  ok: true;
  summary: string;
  patches: z.infer<typeof blueprintPatchSchema>[];
  themeId?: string;
  tokens?: z.infer<typeof designTokensSchema>;
  source: 'remote';
};

export type ValidatedPortfolioAiError = {
  ok: false;
  error: string;
  source: 'remote';
};

export type ValidatedPortfolioAiResult =
  | ValidatedPortfolioAiSuccess
  | ValidatedPortfolioAiError;

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
    throw new Error('LLM response was not valid JSON');
  }
}

function assertComponentAllowed(component: string | undefined): string | null {
  if (!component) return null;
  if (!(ALLOWED_COMPONENTS as readonly string[]).includes(component)) {
    return `Unsupported component "${component}"`;
  }
  return null;
}

function assertPatchAllowed(
  patch: z.infer<typeof blueprintPatchSchema>,
): string | null {
  if (patch.op === 'replace') {
    return assertComponentAllowed(patch.node.component);
  }
  if (patch.op === 'add') {
    return assertComponentAllowed(patch.node.component);
  }
  if (patch.op === 'update' && patch.changes.component) {
    return assertComponentAllowed(patch.changes.component);
  }
  return null;
}

/**
 * Parse raw LLM text → validated Portfolio AI result.
 */
export function parseAndValidatePortfolioAiResponse(
  raw: string,
): ValidatedPortfolioAiResult {
  let parsed: unknown;
  try {
    parsed = extractJsonObject(raw);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid LLM JSON',
      source: 'remote',
    };
  }

  const shape = llmResponseSchema.safeParse(parsed);
  if (!shape.success) {
    return {
      ok: false,
      error: 'LLM JSON did not match Portfolio AI response shape',
      source: 'remote',
    };
  }

  if (!shape.data.ok) {
    return { ok: false, error: shape.data.error, source: 'remote' };
  }

  const themeId = shape.data.themeId?.trim();
  if (
    themeId &&
    !(ALLOWED_THEMES as readonly string[]).includes(themeId)
  ) {
    return {
      ok: false,
      error: `Unsupported themeId "${themeId}"`,
      source: 'remote',
    };
  }

  const patches: z.infer<typeof blueprintPatchSchema>[] = [];
  for (const item of shape.data.patches) {
    const patch = blueprintPatchSchema.safeParse(item);
    if (!patch.success) {
      return {
        ok: false,
        error: `Invalid patch: ${patch.error.issues[0]?.message ?? 'schema error'}`,
        source: 'remote',
      };
    }
    const allowed = assertPatchAllowed(patch.data);
    if (allowed) {
      return { ok: false, error: allowed, source: 'remote' };
    }
    patches.push(patch.data);
  }

  const tokens = shape.data.tokens;

  if (!themeId && patches.length === 0 && !tokens) {
    return {
      ok: false,
      error: 'Portfolio AI returned neither themeId, tokens, nor patches',
      source: 'remote',
    };
  }

  return {
    ok: true,
    summary: shape.data.summary,
    patches,
    ...(themeId ? { themeId } : {}),
    ...(tokens ? { tokens } : {}),
    source: 'remote',
  };
}
