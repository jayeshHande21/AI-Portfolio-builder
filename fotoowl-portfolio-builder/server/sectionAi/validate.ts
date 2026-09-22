/**
 * Validate + scope-check LLM Section AI JSON before it reaches the Canvas.
 */
import { z } from 'zod';
import { blueprintPatchSchema } from '../../src/blueprint/patchSchema';

const llmSuccessSchema = z.object({
  ok: z.literal(true),
  summary: z.string().min(1),
  patches: z.array(z.unknown()).min(1),
});

const llmErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string().min(1),
});

const llmResponseSchema = z.union([llmSuccessSchema, llmErrorSchema]);

export type ValidatedSectionAiSuccess = {
  ok: true;
  summary: string;
  patches: z.infer<typeof blueprintPatchSchema>[];
  source: 'remote';
};

export type ValidatedSectionAiError = {
  ok: false;
  error: string;
  source: 'remote';
};

export type ValidatedSectionAiResult =
  | ValidatedSectionAiSuccess
  | ValidatedSectionAiError;

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

function assertSectionScoped(
  patch: z.infer<typeof blueprintPatchSchema>,
  sectionId: string,
): string | null {
  if (patch.op !== 'update' && patch.op !== 'replace') {
    return `Section AI only allows update/replace (got "${patch.op}")`;
  }
  if (patch.targetId !== sectionId) {
    return `Patch targetId must be "${sectionId}" (got "${patch.targetId}")`;
  }
  if (patch.op === 'replace' && patch.node.id !== sectionId) {
    return `Replace node.id must equal sectionId "${sectionId}"`;
  }
  if (
    patch.op === 'replace' &&
    patch.node.component &&
    ![
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
    ].includes(patch.node.component)
  ) {
    return `Unsupported component "${patch.node.component}"`;
  }
  if (
    patch.op === 'update' &&
    patch.changes.component &&
    ![
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
    ].includes(patch.changes.component)
  ) {
    return `Unsupported component "${patch.changes.component}"`;
  }
  return null;
}

/**
 * Parse raw LLM text → validated Section AI result scoped to sectionId.
 */
export function parseAndValidateSectionAiResponse(
  raw: string,
  sectionId: string,
): ValidatedSectionAiResult {
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
      error: 'LLM JSON did not match Section AI response shape',
      source: 'remote',
    };
  }

  if (!shape.data.ok) {
    return { ok: false, error: shape.data.error, source: 'remote' };
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
    const scoped = assertSectionScoped(patch.data, sectionId);
    if (scoped) {
      return { ok: false, error: scoped, source: 'remote' };
    }
    patches.push(patch.data);
  }

  return {
    ok: true,
    summary: shape.data.summary,
    patches,
    source: 'remote',
  };
}
