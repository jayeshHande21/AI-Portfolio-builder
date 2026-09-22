import { useEffect } from 'react';
import { Puck } from '@puckeditor/core';
import type { Data } from '@puckeditor/core';
import {
  selectPuckData,
  useEditorStore,
} from '../editor/state';
import { SectionAiPanel } from '../ai/SectionAiPanel';
import {
  toPuckViewportUi,
  toPuckViewports,
} from './viewport';
import { puckConfig } from './puck/config';
import { SectionAiActionBar } from './puck/SectionAiActionBar';
import { CanvasFrame } from './CanvasFrame';

function EditorToolbar() {
  const blueprint = useEditorStore((s) => s.blueprint);
  const openThemePicker = useEditorStore((s) => s.openThemePicker);

  return (
    <header className="fo-toolbar" aria-label="Editor toolbar">
      <div className="fo-toolbar__brand">
        <p className="fo-toolbar__eyebrow">FotoOwl</p>
        <h1 className="fo-toolbar__title">{blueprint.name}</h1>
      </div>
      <div className="fo-toolbar__actions">
        <button
          type="button"
          className="fo-toolbar__ghost"
          onClick={openThemePicker}
        >
          Change template
        </button>
      </div>
    </header>
  );
}

function selectedIdFromPuckData(
  data: Data,
  itemSelector: { index: number; zone?: string } | null | undefined,
): string | null {
  if (!itemSelector) return null;
  const item = data.content[itemSelector.index];
  const id = item?.props.id;
  return typeof id === 'string' ? id : null;
}

function itemSelectorForNodeId(
  data: Data,
  nodeId: string | null,
): { index: number } | undefined {
  if (!nodeId) return undefined;
  const index = data.content.findIndex((item) => item.props.id === nodeId);
  return index >= 0 ? { index } : undefined;
}

function useHistoryHotkeys() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod || event.key.toLowerCase() !== 'z') return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);
}

/**
 * Interactive portfolio Canvas — Blueprint → Registry → Puck Adapter → Puck.
 * Layout: toolbar + canvas | Section AI (right, opened from section action bar).
 */
export function Canvas() {
  const blueprint = useEditorStore((s) => s.blueprint);
  const editorEpoch = useEditorStore((s) => s.editorEpoch);
  const viewportId = useEditorStore((s) => s.viewportId);
  const sectionAiOpen = useEditorStore((s) => s.sectionAiOpen);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const syncFromPuck = useEditorStore((s) => s.syncFromPuck);
  const selectNode = useEditorStore((s) => s.selectNode);
  const syncViewportFromWidth = useEditorStore((s) => s.syncViewportFromWidth);
  const lastPatchError = useEditorStore((s) => s.lastPatchError);
  const puckData = selectPuckData(blueprint);
  const itemSelector = itemSelectorForNodeId(puckData, selectedNodeId);

  useHistoryHotkeys();

  return (
    <CanvasFrame tokens={blueprint.tokens}>
      <div className="fo-shell">
        <EditorToolbar />
        <div className="fo-shell__main">
          <div className="fo-canvas__puck">
            <Puck
              key={editorEpoch}
              config={puckConfig}
              data={puckData}
              headerTitle="FotoOwl Portfolio"
              headerPath={`/${blueprint.themeId ?? 'draft'}`}
              height="100%"
              iframe={{ enabled: true }}
              ui={{
                viewports: toPuckViewportUi(viewportId),
                ...(itemSelector ? { itemSelector } : {}),
              }}
              overrides={{
                actionBar: SectionAiActionBar,
              }}
              onChange={syncFromPuck}
              onPublish={syncFromPuck}
              onAction={(_action, appState) => {
                const id = selectedIdFromPuckData(
                  appState.data,
                  appState.ui.itemSelector,
                );
                // Remount after AI clears Puck selection briefly — keep store
                // selection while the Section AI rail is open.
                if (id) {
                  selectNode(id);
                } else if (!useEditorStore.getState().sectionAiOpen) {
                  selectNode(null);
                }
                syncViewportFromWidth(appState.ui.viewports.current.width);
              }}
              viewports={toPuckViewports()}
            />
          </div>
          {sectionAiOpen ? (
            <aside className="fo-ai-rail" aria-label="Section AI">
              <SectionAiPanel />
              {lastPatchError ? (
                <p className="fo-ai-rail__error" role="alert">
                  {lastPatchError}
                </p>
              ) : null}
            </aside>
          ) : null}
        </div>
      </div>
    </CanvasFrame>
  );
}
