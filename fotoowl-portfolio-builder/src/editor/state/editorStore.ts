import { create } from 'zustand';
import type { Data } from '@puckeditor/core';
import type {
  BlueprintPatch,
  PortfolioBlueprint,
  SectionComponentId,
} from '../../blueprint';
import {
  applyPatch,
  findSection,
  updateNodePatch,
  validateBlueprint,
} from '../../blueprint';
import {
  blueprintToPuckData,
  puckDataToBlueprint,
} from '../../canvas/puck/adapter';
import { createFlipAboutLayoutPatch } from '../commands';
import {
  createPortfolioFromTheme,
  theme01,
} from '../../themes/theme-01';

interface EditorState {
  /** Persistent portfolio state — source of truth. */
  blueprint: PortfolioBlueprint;
  /** Temporary editor selection (not part of Blueprint). */
  selectedNodeId: string | null;
  /**
   * Bumped when Blueprint is mutated outside Puck so the editor remounts.
   * Puck `data` is initial-only once mounted.
   */
  editorEpoch: number;
  /** Blocks Puck onChange echoes while Blueprint-driven remounts settle. */
  syncLocked: boolean;
  /** Last patch error (editor UI can surface this). */
  lastPatchError: string | null;

  loadTheme: (theme?: PortfolioBlueprint) => void;
  /** Sync from Puck onChange — does not remount. */
  syncFromPuck: (data: Data) => void;
  selectNode: (nodeId: string | null) => void;
  /**
   * Apply a validated Blueprint patch (manual + AI share this path).
   * Remounts Puck when structure/content changes via patch.
   */
  applyBlueprintPatch: (patch: BlueprintPatch) => boolean;
  flipAboutLayout: () => void;
  setSectionComponent: (
    sectionId: string,
    component: SectionComponentId,
  ) => void;
  moveSelectedSection: (direction: 'up' | 'down') => void;
  deleteSelectedSection: () => void;
}

function loadInitialBlueprint(): PortfolioBlueprint {
  const draft = createPortfolioFromTheme(theme01);
  return validateBlueprint(draft);
}

function withSyncLock(set: (partial: Partial<EditorState>) => void) {
  set({ syncLocked: true });
  window.setTimeout(() => set({ syncLocked: false }), 100);
}

export const useEditorStore = create<EditorState>((set, get) => ({
  blueprint: loadInitialBlueprint(),
  selectedNodeId: null,
  editorEpoch: 0,
  syncLocked: false,
  lastPatchError: null,

  loadTheme: (theme = theme01) => {
    const draft = validateBlueprint(createPortfolioFromTheme(theme));
    withSyncLock(set);
    set({
      blueprint: draft,
      selectedNodeId: null,
      editorEpoch: get().editorEpoch + 1,
      lastPatchError: null,
    });
  },

  syncFromPuck: (data) => {
    if (get().syncLocked) {
      return;
    }
    const next = puckDataToBlueprint(data, get().blueprint);
    const parsed = validateBlueprint(next);
    set({ blueprint: parsed, lastPatchError: null });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  applyBlueprintPatch: (patch) => {
    const result = applyPatch(get().blueprint, patch);
    if (!result.ok) {
      set({ lastPatchError: result.error });
      return false;
    }

    withSyncLock(set);
    set({
      blueprint: result.blueprint,
      editorEpoch: get().editorEpoch + 1,
      lastPatchError: null,
    });
    return true;
  },

  setSectionComponent: (sectionId, component) => {
    get().applyBlueprintPatch(updateNodePatch(sectionId, { component }));
  },

  flipAboutLayout: () => {
    const patch = createFlipAboutLayoutPatch(get().blueprint);
    if (!patch) return;
    const targetId =
      patch.op === 'update' ? patch.targetId : null;
    if (get().applyBlueprintPatch(patch) && targetId) {
      get().selectNode(targetId);
    }
  },

  moveSelectedSection: (direction) => {
    const { blueprint, selectedNodeId } = get();
    if (!selectedNodeId) {
      set({ lastPatchError: 'No section selected' });
      return;
    }
    const ids = blueprint.sections.map((s) => s.id);
    const index = ids.indexOf(selectedNodeId);
    if (index === -1) {
      set({ lastPatchError: `Section "${selectedNodeId}" not found` });
      return;
    }
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= ids.length) {
      set({ lastPatchError: `Cannot move section ${direction}` });
      return;
    }
    const orderedIds = [...ids];
    const a = orderedIds[index]!;
    const b = orderedIds[swapWith]!;
    orderedIds[index] = b;
    orderedIds[swapWith] = a;
    get().applyBlueprintPatch({
      op: 'reorder',
      parentId: null,
      orderedIds,
    });
  },

  deleteSelectedSection: () => {
    const { selectedNodeId } = get();
    if (!selectedNodeId) {
      set({ lastPatchError: 'No section selected' });
      return;
    }
    if (get().applyBlueprintPatch({ op: 'delete', targetId: selectedNodeId })) {
      set({ selectedNodeId: null });
    }
  },
}));

export function selectPuckData(blueprint: PortfolioBlueprint): Data {
  return blueprintToPuckData(blueprint);
}

export function selectAboutSection(blueprint: PortfolioBlueprint) {
  const about = blueprint.sections.find((s) =>
    s.component === 'about.image_left' || s.component === 'about.image_right',
  );
  return about ? findSection(blueprint, about.id) : undefined;
}
