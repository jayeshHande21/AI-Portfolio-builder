import { create } from 'zustand';
import type { Data } from '@puckeditor/core';
import type { PortfolioBlueprint, SectionComponentId } from '../../blueprint';
import {
  findSection,
  updateSectionComponent,
  validateBlueprint,
} from '../../blueprint';
import {
  blueprintToPuckData,
  puckDataToBlueprint,
} from '../../canvas/puck/adapter';
import { isAboutComponentId } from '../../components/registry';
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

  loadTheme: (theme?: PortfolioBlueprint) => void;
  /** Sync from Puck onChange — does not remount. */
  syncFromPuck: (data: Data) => void;
  selectNode: (nodeId: string | null) => void;
  /** POC: flip About between image_left and image_right via Blueprint. */
  flipAboutLayout: () => void;
  setSectionComponent: (
    sectionId: string,
    component: SectionComponentId,
  ) => void;
}

function loadInitialBlueprint(): PortfolioBlueprint {
  const draft = createPortfolioFromTheme(theme01);
  return validateBlueprint(draft);
}

function withSyncLock(set: (partial: Partial<EditorState>) => void) {
  set({ syncLocked: true });
  // Ignore trailing onChange from the Puck instance being unmounted.
  window.setTimeout(() => set({ syncLocked: false }), 100);
}

export const useEditorStore = create<EditorState>((set, get) => ({
  blueprint: loadInitialBlueprint(),
  selectedNodeId: null,
  editorEpoch: 0,
  syncLocked: false,

  loadTheme: (theme = theme01) => {
    const draft = validateBlueprint(createPortfolioFromTheme(theme));
    withSyncLock(set);
    set({
      blueprint: draft,
      selectedNodeId: null,
      editorEpoch: get().editorEpoch + 1,
    });
  },

  syncFromPuck: (data) => {
    if (get().syncLocked) {
      return;
    }
    const next = puckDataToBlueprint(data, get().blueprint);
    const parsed = validateBlueprint(next);
    set({ blueprint: parsed });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  setSectionComponent: (sectionId, component) => {
    const next = validateBlueprint(
      updateSectionComponent(get().blueprint, sectionId, component),
    );
    withSyncLock(set);
    set({
      blueprint: next,
      editorEpoch: get().editorEpoch + 1,
    });
  },

  flipAboutLayout: () => {
    const { blueprint } = get();
    const about = blueprint.sections.find((s) =>
      isAboutComponentId(s.component),
    );
    if (!about || !isAboutComponentId(about.component)) {
      return;
    }
    const nextComponent: SectionComponentId =
      about.component === 'about.image_left'
        ? 'about.image_right'
        : 'about.image_left';
    get().setSectionComponent(about.id, nextComponent);
    get().selectNode(about.id);
  },
}));

export function selectPuckData(blueprint: PortfolioBlueprint): Data {
  return blueprintToPuckData(blueprint);
}

export function selectAboutSection(blueprint: PortfolioBlueprint) {
  const about = blueprint.sections.find((s) =>
    isAboutComponentId(s.component),
  );
  return about ? findSection(blueprint, about.id) : undefined;
}
