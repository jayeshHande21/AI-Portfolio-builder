/**
 * Structured patch operations applied to the Portfolio Blueprint.
 * Manual edits and AI edits must both use this system.
 *
 * Operations (Phase 5): add | update | delete | move | reorder | replace
 */
export type PatchOp = 'add' | 'update' | 'delete' | 'move' | 'reorder' | 'replace';

export interface BlueprintPatch {
  op: PatchOp;
  path: string;
  value?: unknown;
}

/** Placeholder — apply/validate logic lands with the patch system. */
export function applyPatch(
  _blueprint: unknown,
  _patch: BlueprintPatch,
): unknown {
  throw new Error('applyPatch not implemented yet');
}
