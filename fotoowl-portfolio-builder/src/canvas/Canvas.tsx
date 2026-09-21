import { useEffect } from 'react';
import { Puck } from '@puckeditor/core';
import type { Data } from '@puckeditor/core';
import {
  selectPuckData,
  useEditorStore,
} from '../editor/state';
import { listThemeSummaries } from '../themes';
import { SectionAiPanel } from '../ai/SectionAiPanel';
import {
  toPuckViewportUi,
  toPuckViewports,
} from './viewport';
import { puckConfig } from './puck/config';
import { CanvasFrame } from './CanvasFrame';

function EditorToolbar() {
  const blueprint = useEditorStore((s) => s.blueprint);
  const loadThemeById = useEditorStore((s) => s.loadThemeById);
  const themes = listThemeSummaries();

  return (
    <header className="fo-toolbar" aria-label="Editor toolbar">
      <div className="fo-toolbar__brand">
        <p className="fo-toolbar__eyebrow">FotoOwl</p>
        <h1 className="fo-toolbar__title">{blueprint.name}</h1>
      </div>
      <label className="fo-toolbar__theme">
        <span className="fo-toolbar__theme-label">Theme</span>
        <select
          className="fo-toolbar__select"
          value={blueprint.themeId ?? ''}
          onChange={(event) => loadThemeById(event.target.value)}
          aria-label="Select theme"
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </label>
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
 * Layout: toolbar + canvas | Section AI (right).
 */
export function Canvas() {
  const blueprint = useEditorStore((s) => s.blueprint);
  const editorEpoch = useEditorStore((s) => s.editorEpoch);
  const viewportId = useEditorStore((s) => s.viewportId);
  const syncFromPuck = useEditorStore((s) => s.syncFromPuck);
  const selectNode = useEditorStore((s) => s.selectNode);
  const syncViewportFromWidth = useEditorStore((s) => s.syncViewportFromWidth);
  const lastPatchError = useEditorStore((s) => s.lastPatchError);
  const puckData = selectPuckData(blueprint);

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
              }}
              onChange={syncFromPuck}
              onPublish={syncFromPuck}
              onAction={(_action, appState) => {
                selectNode(
                  selectedIdFromPuckData(
                    appState.data,
                    appState.ui.itemSelector,
                  ),
                );
                syncViewportFromWidth(appState.ui.viewports.current.width);
              }}
              viewports={toPuckViewports()}
            />
          </div>
          <aside className="fo-ai-rail" aria-label="Section AI">
            <SectionAiPanel />
            {lastPatchError ? (
              <p className="fo-ai-rail__error" role="alert">
                {lastPatchError}
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </CanvasFrame>
  );
}
