import { create } from 'zustand';
import type { Data } from '@puckeditor/core';
import { runSectionAi } from '../../ai';
import type {
  BlueprintPatch,
  PortfolioBlueprint,
  SectionComponentId,
} from '../../blueprint';
import {
  applyPatch,
  applyPatches,
  findSection,
  updateNodePatch,
  validateBlueprint,
} from '../../blueprint';
import {
  blueprintToPuckData,
  puckDataToBlueprint,
} from '../../canvas/puck/adapter';
import {
  DEFAULT_VIEWPORT,
  type EditorViewportId,
  viewportIdFromWidth,
} from '../../canvas/viewport';
import { createFlipAboutLayoutPatch } from '../commands';
import {
  blueprintsEqualForHistory,
  canRedo,
  canUndo,
  createEmptyHistory,
  createHistoryEntry,
  type HistoryState,
  pushHistoryEntry,
  redoHistory,
  undoHistory,
} from '../history';
import {
  createPortfolioFromTheme,
  getDefaultTheme,
  requireTheme,
  type ThemeDefinition,
} from '../../themes';

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
  /** Last patch / AI error (editor UI can surface this). */
  lastPatchError: string | null;
  /** Undo/redo stack (editor runtime). */
  history: HistoryState;
  /** Responsive preview mode (editor runtime). */
  viewportId: EditorViewportId;
  /** Section AI in-flight flag (editor runtime). */
  sectionAiLoading: boolean;

  /** Load a theme by registry id (clones — never mutates the theme source). */
  loadThemeById: (themeId: string) => void;
  loadTheme: (theme?: ThemeDefinition) => void;
  /** Sync from Puck onChange — records history when Blueprint changes. */
  syncFromPuck: (data: Data) => void;
  selectNode: (nodeId: string | null) => void;
  applyBlueprintPatch: (patch: BlueprintPatch, label?: string) => boolean;
  applyBlueprintPatches: (patches: BlueprintPatch[], label?: string) => boolean;
  /** Section AI → patches → Blueprint (same mutation path as manual edits). */
  runSectionAiPrompt: (prompt: string) => Promise<{
    ok: boolean;
    summary?: string;
    error?: string;
  }>;
  undo: () => boolean;
  redo: () => boolean;
  setViewport: (viewportId: EditorViewportId) => void;
  /** Sync viewport id when user switches via Puck's built-in controls. */
  syncViewportFromWidth: (width: number | '100%') => void;
  flipAboutLayout: () => void;
  setSectionComponent: (
    sectionId: string,
    component: SectionComponentId,
  ) => void;
  moveSelectedSection: (direction: 'up' | 'down') => void;
  deleteSelectedSection: () => void;
}

function loadInitialBlueprint(): PortfolioBlueprint {
  return validateBlueprint(createPortfolioFromTheme(getDefaultTheme()));
}

function withSyncLock(set: (partial: Partial<EditorState>) => void) {
  set({ syncLocked: true });
  window.setTimeout(() => set({ syncLocked: false }), 100);
}

function commitBlueprintChange(
  set: (
    partial:
      | Partial<EditorState>
      | ((state: EditorState) => Partial<EditorState>),
  ) => void,
  get: () => EditorState,
  params: {
    before: PortfolioBlueprint;
    after: PortfolioBlueprint;
    label: string;
    patch?: BlueprintPatch;
    remount?: boolean;
    selectedNodeId?: string | null;
  },
) {
  if (blueprintsEqualForHistory(params.before, params.after)) {
    return;
  }

  const entry = createHistoryEntry({
    before: params.before,
    after: params.after,
    label: params.label,
    patch: params.patch,
  });

  withSyncLock(set);
  set({
    blueprint: params.after,
    history: pushHistoryEntry(get().history, entry),
    editorEpoch:
      params.remount === false ? get().editorEpoch : get().editorEpoch + 1,
    lastPatchError: null,
    ...(params.selectedNodeId !== undefined
      ? { selectedNodeId: params.selectedNodeId }
      : {}),
  });
}

export const useEditorStore = create<EditorState>((set, get) => ({
  blueprint: loadInitialBlueprint(),
  selectedNodeId: null,
  editorEpoch: 0,
  syncLocked: false,
  lastPatchError: null,
  history: createEmptyHistory(),
  viewportId: DEFAULT_VIEWPORT,
  sectionAiLoading: false,

  loadThemeById: (themeId) => {
    get().loadTheme(requireTheme(themeId));
  },

  loadTheme: (theme = getDefaultTheme()) => {
    const draft = validateBlueprint(createPortfolioFromTheme(theme));
    withSyncLock(set);
    set({
      blueprint: draft,
      selectedNodeId: null,
      editorEpoch: get().editorEpoch + 1,
      lastPatchError: null,
      history: createEmptyHistory(),
    });
  },

  syncFromPuck: (data) => {
    if (get().syncLocked) {
      return;
    }
    const before = get().blueprint;
    const next = validateBlueprint(puckDataToBlueprint(data, before));
    commitBlueprintChange(set, get, {
      before,
      after: next,
      label: 'Manual edit',
      remount: false,
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  applyBlueprintPatch: (patch, label = `Patch:${patch.op}`) => {
    const before = get().blueprint;
    const result = applyPatch(before, patch);
    if (!result.ok) {
      set({ lastPatchError: result.error });
      return false;
    }

    commitBlueprintChange(set, get, {
      before,
      after: result.blueprint,
      label,
      patch,
      remount: true,
    });
    return true;
  },

  applyBlueprintPatches: (patches, label = 'Section AI') => {
    if (patches.length === 0) {
      set({ lastPatchError: 'No patches to apply' });
      return false;
    }
    const before = get().blueprint;
    const result = applyPatches(before, patches);
    if (!result.ok) {
      set({ lastPatchError: result.error });
      return false;
    }

    commitBlueprintChange(set, get, {
      before,
      after: result.blueprint,
      label,
      patch: patches[0],
      remount: true,
    });
    return true;
  },

  runSectionAiPrompt: async (prompt) => {
    const { blueprint, selectedNodeId } = get();
    if (!selectedNodeId) {
      const error = 'Select a section before using Section AI';
      set({ lastPatchError: error });
      return { ok: false, error };
    }

    set({ sectionAiLoading: true, lastPatchError: null });
    try {
      const result = await runSectionAi(blueprint, selectedNodeId, prompt);
      if (!result.ok) {
        set({ lastPatchError: result.error, sectionAiLoading: false });
        return { ok: false, error: result.error };
      }

      const applied = get().applyBlueprintPatches(
        result.patches,
        `Section AI: ${result.summary}`,
      );
      set({ sectionAiLoading: false });
      if (!applied) {
        return {
          ok: false,
          error: get().lastPatchError ?? 'Failed to apply AI patches',
        };
      }
      return { ok: true, summary: result.summary };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Section AI failed';
      set({ lastPatchError: message, sectionAiLoading: false });
      return { ok: false, error: message };
    }
  },

  undo: () => {
    const stepped = undoHistory(get().history);
    if (!stepped) return false;
    withSyncLock(set);
    set({
      blueprint: stepped.blueprint,
      history: stepped.history,
      editorEpoch: get().editorEpoch + 1,
      lastPatchError: null,
    });
    return true;
  },

  redo: () => {
    const stepped = redoHistory(get().history);
    if (!stepped) return false;
    withSyncLock(set);
    set({
      blueprint: stepped.blueprint,
      history: stepped.history,
      editorEpoch: get().editorEpoch + 1,
      lastPatchError: null,
    });
    return true;
  },

  setViewport: (viewportId) => {
    if (get().viewportId === viewportId) return;
    set({
      viewportId,
      editorEpoch: get().editorEpoch + 1,
    });
  },

  syncViewportFromWidth: (width) => {
    const next = viewportIdFromWidth(width);
    if (next !== get().viewportId) {
      set({ viewportId: next });
    }
  },

  setSectionComponent: (sectionId, component) => {
    get().applyBlueprintPatch(
      updateNodePatch(sectionId, { component }),
      'Update component',
    );
  },

  flipAboutLayout: () => {
    const patch = createFlipAboutLayoutPatch(get().blueprint);
    if (!patch) return;
    const targetId = patch.op === 'update' ? patch.targetId : null;
    if (get().applyBlueprintPatch(patch, 'Flip About layout') && targetId) {
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
    get().applyBlueprintPatch(
      { op: 'reorder', parentId: null, orderedIds },
      `Reorder section ${direction}`,
    );
  },

  deleteSelectedSection: () => {
    const { selectedNodeId } = get();
    if (!selectedNodeId) {
      set({ lastPatchError: 'No section selected' });
      return;
    }
    if (
      get().applyBlueprintPatch(
        { op: 'delete', targetId: selectedNodeId },
        'Delete section',
      )
    ) {
      set({ selectedNodeId: null });
    }
  },
}));

export function selectPuckData(blueprint: PortfolioBlueprint): Data {
  return blueprintToPuckData(blueprint);
}

export function selectAboutSection(blueprint: PortfolioBlueprint) {
  const about = blueprint.sections.find(
    (s) =>
      s.component === 'about.image_left' ||
      s.component === 'about.image_right',
  );
  return about ? findSection(blueprint, about.id) : undefined;
}

export function selectCanUndo(): boolean {
  return canUndo(useEditorStore.getState().history);
}

export function selectCanRedo(): boolean {
  return canRedo(useEditorStore.getState().history);
}
