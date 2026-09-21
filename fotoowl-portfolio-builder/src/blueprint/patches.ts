/**
 * Structured patch operations applied to the Portfolio Blueprint.
 * Manual edits and AI edits must both use this system.
 *
 * Flow: Patch → Validate → Apply → Validate Blueprint → Canvas
 */
import type { BlueprintNode, PortfolioBlueprint, SectionComponentId } from './types';
import { blueprintNodeSchema } from './schema';
import { validateBlueprint } from './validator';
import {
  blueprintPatchSchema,
  type BlueprintPatchInput,
} from './patchSchema';
import {
  ROOT_SECTIONS_PARENT,
  assertParentExists,
  collectNodeIds,
  collectSubtreeIds,
  findNodeById,
  findNodeLocation,
  getChildren,
  mapChildren,
} from './tree';

export type PatchOp = BlueprintPatchInput['op'];
export type BlueprintPatch = BlueprintPatchInput;

export type PatchSuccess = {
  ok: true;
  blueprint: PortfolioBlueprint;
};

export type PatchFailure = {
  ok: false;
  error: string;
};

export type PatchResult = PatchSuccess | PatchFailure;

function fail(error: string): PatchFailure {
  return { ok: false, error };
}

function ok(blueprint: PortfolioBlueprint): PatchSuccess {
  return { ok: true, blueprint };
}

function parseNode(node: unknown): BlueprintNode | null {
  const parsed = blueprintNodeSchema.safeParse(node);
  if (!parsed.success) return null;
  return parsed.data as BlueprintNode;
}

function insertAt<T>(list: T[], index: number, item: T): T[] {
  const next = [...list];
  const clamped = Math.min(Math.max(index, 0), next.length);
  next.splice(clamped, 0, item);
  return next;
}

function applyAdd(
  blueprint: PortfolioBlueprint,
  patch: Extract<BlueprintPatch, { op: 'add' }>,
): PatchResult {
  const parentError = assertParentExists(blueprint, patch.parentId);
  if (parentError) return fail(parentError);

  const node = parseNode(patch.node);
  if (!node) return fail('Invalid node in add patch');

  const existingIds = collectNodeIds(blueprint.sections);
  const newIds = collectSubtreeIds(node);
  for (const id of newIds) {
    if (existingIds.has(id)) {
      return fail(`Cannot add node: id "${id}" already exists`);
    }
  }

  const siblings = getChildren(blueprint, patch.parentId);
  const index = patch.index ?? siblings.length;
  if (index > siblings.length) {
    return fail(
      `Add index ${index} is out of range (sibling count ${siblings.length})`,
    );
  }

  return ok(
    mapChildren(blueprint, patch.parentId, (children) =>
      insertAt(children, index, node),
    ),
  );
}

function applyUpdate(
  blueprint: PortfolioBlueprint,
  patch: Extract<BlueprintPatch, { op: 'update' }>,
): PatchResult {
  const location = findNodeLocation(blueprint, patch.targetId);
  if (!location) return fail(`Node "${patch.targetId}" not found`);

  const { changes } = patch;
  const updated: BlueprintNode = {
    ...location.node,
    ...changes,
    id: location.node.id,
    props:
      changes.props !== undefined
        ? { ...location.node.props, ...changes.props }
        : location.node.props,
    children: location.node.children,
  };

  return ok(
    mapChildren(blueprint, location.parentId, (children) =>
      children.map((child) =>
        child.id === patch.targetId ? updated : child,
      ),
    ),
  );
}

function applyDelete(
  blueprint: PortfolioBlueprint,
  patch: Extract<BlueprintPatch, { op: 'delete' }>,
): PatchResult {
  const location = findNodeLocation(blueprint, patch.targetId);
  if (!location) return fail(`Node "${patch.targetId}" not found`);

  return ok(
    mapChildren(blueprint, location.parentId, (children) =>
      children.filter((child) => child.id !== patch.targetId),
    ),
  );
}

function applyMove(
  blueprint: PortfolioBlueprint,
  patch: Extract<BlueprintPatch, { op: 'move' }>,
): PatchResult {
  const location = findNodeLocation(blueprint, patch.targetId);
  if (!location) return fail(`Node "${patch.targetId}" not found`);

  const parentError = assertParentExists(blueprint, patch.parentId);
  if (parentError) return fail(parentError);

  // Cannot move a node into its own subtree
  if (patch.parentId !== null) {
    const subtree = collectSubtreeIds(location.node);
    if (subtree.has(patch.parentId)) {
      return fail(`Cannot move "${patch.targetId}" into its own subtree`);
    }
  }

  const without = mapChildren(blueprint, location.parentId, (children) =>
    children.filter((child) => child.id !== patch.targetId),
  );

  const destSiblings = getChildren(without, patch.parentId);
  if (patch.index > destSiblings.length) {
    return fail(
      `Move index ${patch.index} is out of range (sibling count ${destSiblings.length})`,
    );
  }

  return ok(
    mapChildren(without, patch.parentId, (children) =>
      insertAt(children, patch.index, location.node),
    ),
  );
}

function applyReorder(
  blueprint: PortfolioBlueprint,
  patch: Extract<BlueprintPatch, { op: 'reorder' }>,
): PatchResult {
  const parentError = assertParentExists(blueprint, patch.parentId);
  if (parentError) return fail(parentError);

  const siblings = getChildren(blueprint, patch.parentId);
  const siblingIds = siblings.map((s) => s.id);

  if (patch.orderedIds.length !== siblingIds.length) {
    return fail('Reorder orderedIds must include every sibling exactly once');
  }

  const orderedSet = new Set(patch.orderedIds);
  if (orderedSet.size !== patch.orderedIds.length) {
    return fail('Reorder orderedIds contains duplicates');
  }

  for (const id of siblingIds) {
    if (!orderedSet.has(id)) {
      return fail(`Reorder missing sibling id "${id}"`);
    }
  }
  for (const id of patch.orderedIds) {
    if (!siblingIds.includes(id)) {
      return fail(`Reorder includes unknown sibling id "${id}"`);
    }
  }

  const byId = new Map(siblings.map((s) => [s.id, s]));
  const reordered = patch.orderedIds.map((id) => byId.get(id)!);

  return ok(mapChildren(blueprint, patch.parentId, () => reordered));
}

function applyReplace(
  blueprint: PortfolioBlueprint,
  patch: Extract<BlueprintPatch, { op: 'replace' }>,
): PatchResult {
  const location = findNodeLocation(blueprint, patch.targetId);
  if (!location) return fail(`Node "${patch.targetId}" not found`);

  const node = parseNode(patch.node);
  if (!node) return fail('Invalid node in replace patch');

  // Replacement may keep the same id or introduce a new one (and subtree).
  const existingIds = collectNodeIds(blueprint.sections);
  existingIds.delete(patch.targetId);
  // Also free ids of the node being replaced (its whole subtree)
  for (const id of collectSubtreeIds(location.node)) {
    existingIds.delete(id);
  }

  for (const id of collectSubtreeIds(node)) {
    if (existingIds.has(id)) {
      return fail(`Cannot replace: id "${id}" already exists elsewhere`);
    }
  }

  return ok(
    mapChildren(blueprint, location.parentId, (children) =>
      children.map((child) => (child.id === patch.targetId ? node : child)),
    ),
  );
}

function applyValidatedPatch(
  blueprint: PortfolioBlueprint,
  patch: BlueprintPatch,
): PatchResult {
  switch (patch.op) {
    case 'add':
      return applyAdd(blueprint, patch);
    case 'update':
      return applyUpdate(blueprint, patch);
    case 'delete':
      return applyDelete(blueprint, patch);
    case 'move':
      return applyMove(blueprint, patch);
    case 'reorder':
      return applyReorder(blueprint, patch);
    case 'replace':
      return applyReplace(blueprint, patch);
    default: {
      const _exhaustive: never = patch;
      return fail(`Unsupported patch op: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

/**
 * Validate a patch payload, apply it, then re-validate the Blueprint.
 */
export function applyPatch(
  blueprint: PortfolioBlueprint,
  patchInput: unknown,
): PatchResult {
  const parsed = blueprintPatchSchema.safeParse(patchInput);
  if (!parsed.success) {
    return fail(`Invalid patch: ${parsed.error.issues[0]?.message ?? 'schema error'}`);
  }

  const applied = applyValidatedPatch(blueprint, parsed.data);
  if (!applied.ok) return applied;

  try {
    return ok(validateBlueprint(applied.blueprint));
  } catch (error) {
    return fail(
      error instanceof Error
        ? `Blueprint invalid after patch: ${error.message}`
        : 'Blueprint invalid after patch',
    );
  }
}

/** Apply multiple patches sequentially. Stops on first failure. */
export function applyPatches(
  blueprint: PortfolioBlueprint,
  patches: unknown[],
): PatchResult {
  let current = blueprint;
  for (let i = 0; i < patches.length; i += 1) {
    const result = applyPatch(current, patches[i]);
    if (!result.ok) {
      return fail(`Patch[${i}] failed: ${result.error}`);
    }
    current = result.blueprint;
  }
  return ok(current);
}

export function validatePatch(patchInput: unknown): PatchResult | { ok: true; patch: BlueprintPatch } {
  const parsed = blueprintPatchSchema.safeParse(patchInput);
  if (!parsed.success) {
    return fail(`Invalid patch: ${parsed.error.issues[0]?.message ?? 'schema error'}`);
  }
  return { ok: true, patch: parsed.data };
}

/* -------------------------------------------------------------------------- */
/* Convenience patch builders (ID-based)                                       */
/* -------------------------------------------------------------------------- */

export function updateNodePatch(
  targetId: string,
  changes: Extract<BlueprintPatch, { op: 'update' }>['changes'],
): BlueprintPatch {
  return { op: 'update', targetId, changes };
}

export function addNodePatch(
  node: BlueprintNode,
  options?: { parentId?: string | null; index?: number },
): BlueprintPatch {
  return {
    op: 'add',
    parentId: options?.parentId ?? ROOT_SECTIONS_PARENT,
    index: options?.index,
    node,
  };
}

export function deleteNodePatch(targetId: string): BlueprintPatch {
  return { op: 'delete', targetId };
}

export function moveNodePatch(
  targetId: string,
  index: number,
  parentId: string | null = ROOT_SECTIONS_PARENT,
): BlueprintPatch {
  return { op: 'move', targetId, parentId, index };
}

export function reorderSiblingsPatch(
  orderedIds: string[],
  parentId: string | null = ROOT_SECTIONS_PARENT,
): BlueprintPatch {
  return { op: 'reorder', parentId, orderedIds };
}

export function replaceNodePatch(
  targetId: string,
  node: BlueprintNode,
): BlueprintPatch {
  return { op: 'replace', targetId, node };
}

/** Update a section's registered component id (e.g. about.image_left → about.image_right). */
export function updateSectionComponent(
  blueprint: PortfolioBlueprint,
  sectionId: string,
  component: SectionComponentId,
): PortfolioBlueprint {
  const result = applyPatch(
    blueprint,
    updateNodePatch(sectionId, { component }),
  );
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.blueprint;
}

/** Shallow-merge props onto a section node. */
export function updateSectionProps(
  blueprint: PortfolioBlueprint,
  sectionId: string,
  props: Record<string, unknown>,
): PortfolioBlueprint {
  const result = applyPatch(blueprint, updateNodePatch(sectionId, { props }));
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.blueprint;
}

export function findSection(
  blueprint: PortfolioBlueprint,
  sectionId: string,
): BlueprintNode | undefined {
  return findNodeById(blueprint, sectionId);
}

/** Move a root section up/down by one position. */
export function reorderSectionRelative(
  blueprint: PortfolioBlueprint,
  sectionId: string,
  direction: 'up' | 'down',
): PatchResult {
  const ids = blueprint.sections.map((s) => s.id);
  const index = ids.indexOf(sectionId);
  if (index === -1) return fail(`Section "${sectionId}" not found`);

  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ids.length) {
    return fail(`Cannot move section ${direction}`);
  }

  const orderedIds = [...ids];
  const a = orderedIds[index]!;
  const b = orderedIds[swapWith]!;
  orderedIds[index] = b;
  orderedIds[swapWith] = a;

  return applyPatch(blueprint, reorderSiblingsPatch(orderedIds));
}
