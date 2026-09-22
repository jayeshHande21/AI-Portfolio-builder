/**
 * Validate + scope-check LLM Portfolio AI JSON before it reaches the Canvas.
 * Invalid individual patches are skipped when themeId/tokens/other patches remain.
 */
import { z } from 'zod';
import { blueprintPatchSchema } from '../../src/blueprint/patchSchema';
import { designTokensSchema } from '../../src/blueprint/schema';
import {
  formatZodIssue,
  normalizePortfolioPatch,
} from './sanitize';

const ALLOWED_COMPONENTS = [
  'hero.editorial',
  'hero.layered',
  'nav.centered',
  'about.image_left',
  'about.image_right',
  'work.categories',
  'feature.split',
  'services.row',
  'gallery.masonry',
  'gallery.grid',
  'footer.minimal',
] as const;

const ALLOWED_THEMES = [
  'theme-01',
  'theme-02',
  'theme-03',
  'theme-04',
  'theme-05',
  'theme-06',
] as const;

const llmSuccessSchema = z.object({
  ok: z.literal(true),
  summary: z.string().min(1),
  patches: z.array(z.unknown()).default([]),
  themeId: z.string().optional(),
  tokens: designTokensSchema.optional(),
  codeAiJobs: z
    .array(
      z.object({
        mode: z.enum(['replace', 'add']),
        kind: z.enum(['footer', 'hero', 'gallery', 'about', 'section']),
        targetSectionId: z.string().optional(),
        prompt: z.string().min(1),
      }),
    )
    .optional(),
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
  codeAiJobs?: Array<{
    mode: 'replace' | 'add';
    kind: 'footer' | 'hero' | 'gallery' | 'about' | 'section';
    targetSectionId?: string;
    prompt: string;
  }>;
  source: 'remote';
  /** True when some LLM patches were dropped as invalid. */
  skippedPatchCount?: number;
};

export type ValidatedPortfolioAiError = {
  ok: false;
  error: string;
  source: 'remote';
  /** Client may fall back to local planner when true. */
  fallback?: boolean;
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
      fallback: true,
    };
  }

  const shape = llmResponseSchema.safeParse(parsed);
  if (!shape.success) {
    return {
      ok: false,
      error: `LLM JSON did not match Portfolio AI response shape (${formatZodIssue(shape.error.issues[0]!)})`,
      source: 'remote',
      fallback: true,
    };
  }

  if (!shape.data.ok) {
    return {
      ok: false,
      error: shape.data.error,
      source: 'remote',
      fallback: true,
    };
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
      fallback: true,
    };
  }

  const patches: z.infer<typeof blueprintPatchSchema>[] = [];
  let skippedPatchCount = 0;
  const skipReasons: string[] = [];

  for (const item of shape.data.patches) {
    const normalized = normalizePortfolioPatch(item);
    const patch = blueprintPatchSchema.safeParse(normalized);
    if (!patch.success) {
      skippedPatchCount += 1;
      const issue = patch.error.issues[0];
      if (issue) {
        skipReasons.push(formatZodIssue(issue));
      }
      continue;
    }
    const allowed = assertPatchAllowed(patch.data);
    if (allowed) {
      skippedPatchCount += 1;
      skipReasons.push(allowed);
      continue;
    }
    patches.push(patch.data);
  }

  const tokens = shape.data.tokens;
  const codeAiJobs = shape.data.codeAiJobs;

  if (!themeId && patches.length === 0 && !tokens && !codeAiJobs?.length) {
    return {
      ok: false,
      error:
        skipReasons[0] != null
          ? `Invalid patch: ${skipReasons[0]}`
          : 'Portfolio AI returned neither themeId, tokens, codeAiJobs, nor patches',
      source: 'remote',
      fallback: true,
    };
  }

  const summary =
    skippedPatchCount > 0
      ? `${shape.data.summary} (skipped ${skippedPatchCount} invalid patch${skippedPatchCount === 1 ? '' : 'es'})`
      : shape.data.summary;

  return {
    ok: true,
    summary,
    patches,
    ...(themeId ? { themeId } : {}),
    ...(tokens ? { tokens } : {}),
    ...(codeAiJobs?.length ? { codeAiJobs } : {}),
    source: 'remote',
    ...(skippedPatchCount > 0 ? { skippedPatchCount } : {}),
  };
}
