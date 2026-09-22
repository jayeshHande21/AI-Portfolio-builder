/**
 * Sanitize LLM patch payloads before Zod validation.
 * Models often omit required strings or include explicit undefined/null leaves.
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined) as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (nested === undefined) continue;
      const cleaned = stripUndefinedDeep(nested);
      if (cleaned !== undefined) {
        out[key] = cleaned;
      }
    }
    return out as T;
  }
  return value;
}

/**
 * Apply common Portfolio AI LLM fixes before schema parse.
 */
export function normalizePortfolioPatch(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return raw;
  }

  const patch = stripUndefinedDeep({ ...(raw as Record<string, unknown>) });
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return patch;
  }

  const p = patch as Record<string, unknown>;

  // add: parentId must be string | null (LLM often omits it)
  if (p.op === 'add' && !('parentId' in p)) {
    p.parentId = null;
  }

  // replace/update: ensure node.id matches targetId when missing
  if (
    (p.op === 'replace' || p.op === 'update') &&
    typeof p.targetId === 'string' &&
    p.targetId &&
    p.node &&
    typeof p.node === 'object' &&
    !Array.isArray(p.node)
  ) {
    const node = p.node as Record<string, unknown>;
    if (typeof node.id !== 'string' || !node.id) {
      node.id = p.targetId;
    }
  }

  // replace without targetId but node.id present
  if (
    p.op === 'replace' &&
    (typeof p.targetId !== 'string' || !p.targetId) &&
    p.node &&
    typeof p.node === 'object' &&
    !Array.isArray(p.node)
  ) {
    const node = p.node as Record<string, unknown>;
    if (typeof node.id === 'string' && node.id) {
      p.targetId = node.id;
    }
  }

  return p;
}

export function formatZodIssue(
  issue: { message: string; path: PropertyKey[] },
): string {
  const path = issue.path.map(String).filter(Boolean).join('.');
  return path ? `${path}: ${issue.message}` : issue.message;
}
