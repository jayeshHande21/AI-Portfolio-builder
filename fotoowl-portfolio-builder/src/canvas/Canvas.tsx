import { useEffect } from 'react';
import { Puck } from '@puckeditor/core';
import type { Data } from '@puckeditor/core';
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  Layers,
  Monitor,
  Redo2,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
} from 'lucide-react';
import {
  selectAboutSection,
  selectPuckData,
  useEditorStore,
} from '../editor/state';
import { canRedo, canUndo } from '../editor/history';
import { isAboutComponentId } from '../components/registry';
import { listThemeSummaries } from '../themes';
import { SectionAiPanel } from '../ai/SectionAiPanel';
import {
  EDITOR_VIEWPORTS,
  type EditorViewportId,
  toPuckViewportUi,
  toPuckViewports,
} from './viewport';
import { puckConfig } from './puck/config';
import { CanvasFrame } from './CanvasFrame';

function BlueprintInspector() {
  const blueprint = useEditorStore((s) => s.blueprint);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const lastPatchError = useEditorStore((s) => s.lastPatchError);
  const history = useEditorStore((s) => s.history);
  const viewportId = useEditorStore((s) => s.viewportId);
  const flipAboutLayout = useEditorStore((s) => s.flipAboutLayout);
  const moveSelectedSection = useEditorStore((s) => s.moveSelectedSection);
  const deleteSelectedSection = useEditorStore((s) => s.deleteSelectedSection);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const setViewport = useEditorStore((s) => s.setViewport);
  const loadThemeById = useEditorStore((s) => s.loadThemeById);
  const themes = listThemeSummaries();

  const about = selectAboutSection(blueprint);
  const selected = blueprint.sections.find((s) => s.id === selectedNodeId);
  const selectedIndex = selected
    ? blueprint.sections.findIndex((s) => s.id === selected.id)
    : -1;
  const undoEnabled = canUndo(history);
  const redoEnabled = canRedo(history);

  return (
    <aside className="fo-inspector" aria-label="Blueprint inspector">
      <header className="fo-inspector__header">
        <Layers size={16} aria-hidden />
        <div>
          <p className="fo-inspector__eyebrow">Portfolio Blueprint</p>
          <h2 className="fo-inspector__title">{blueprint.name}</h2>
        </div>
      </header>

      <div className="fo-inspector__block">
        <p className="fo-inspector__label">Theme</p>
        <select
          className="fo-inspector__select"
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
        <p className="fo-inspector__hint">
          Clones a Blueprint from the registry — source themes are never
          mutated.
        </p>
      </div>

      <div className="fo-inspector__block">
        <p className="fo-inspector__label">Selected</p>
        <p className="fo-inspector__value">
          {selected
            ? `${selected.id} · ${selected.component ?? selected.type}`
            : 'None — click a section in the canvas'}
        </p>
      </div>

      <div className="fo-inspector__block">
        <p className="fo-inspector__label">History</p>
        <div className="fo-inspector__actions">
          <button
            type="button"
            className="fo-inspector__btn fo-inspector__btn--ghost"
            onClick={() => undo()}
            disabled={!undoEnabled}
            title="Undo (⌘Z)"
          >
            <Undo2 size={14} aria-hidden />
            Undo
          </button>
          <button
            type="button"
            className="fo-inspector__btn fo-inspector__btn--ghost"
            onClick={() => redo()}
            disabled={!redoEnabled}
            title="Redo (⌘⇧Z)"
          >
            <Redo2 size={14} aria-hidden />
            Redo
          </button>
        </div>
        <p className="fo-inspector__hint">
          {history.past.length} undo · {history.future.length} redo
        </p>
      </div>

      <div className="fo-inspector__block">
        <p className="fo-inspector__label">Viewport</p>
        <div className="fo-inspector__actions">
          {(Object.keys(EDITOR_VIEWPORTS) as EditorViewportId[]).map((id) => {
            const Icon =
              id === 'mobile' ? Smartphone : id === 'tablet' ? Tablet : Monitor;
            return (
              <button
                key={id}
                type="button"
                className={
                  viewportId === id
                    ? 'fo-inspector__btn fo-inspector__btn--ghost is-active'
                    : 'fo-inspector__btn fo-inspector__btn--ghost'
                }
                onClick={() => setViewport(id)}
                title={EDITOR_VIEWPORTS[id].label}
              >
                <Icon size={14} aria-hidden />
                {EDITOR_VIEWPORTS[id].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fo-inspector__block">
        <p className="fo-inspector__label">Patch actions</p>
        <div className="fo-inspector__actions">
          <button
            type="button"
            className="fo-inspector__btn fo-inspector__btn--ghost"
            onClick={() => moveSelectedSection('up')}
            disabled={!selected || selectedIndex <= 0}
            title="Reorder up via patch"
          >
            <ArrowUp size={14} aria-hidden />
            Up
          </button>
          <button
            type="button"
            className="fo-inspector__btn fo-inspector__btn--ghost"
            onClick={() => moveSelectedSection('down')}
            disabled={
              !selected ||
              selectedIndex < 0 ||
              selectedIndex >= blueprint.sections.length - 1
            }
            title="Reorder down via patch"
          >
            <ArrowDown size={14} aria-hidden />
            Down
          </button>
          <button
            type="button"
            className="fo-inspector__btn fo-inspector__btn--danger"
            onClick={deleteSelectedSection}
            disabled={!selected}
            title="Delete via patch"
          >
            <Trash2 size={14} aria-hidden />
            Delete
          </button>
        </div>
        <button
          type="button"
          className="fo-inspector__btn"
          onClick={flipAboutLayout}
          disabled={!about || !isAboutComponentId(about.component)}
        >
          <ArrowLeftRight size={14} aria-hidden />
          Flip About ({about?.component ?? '—'})
        </button>
        {lastPatchError ? (
          <p className="fo-inspector__error" role="alert">
            {lastPatchError}
          </p>
        ) : null}
      </div>

      <div className="fo-inspector__block fo-inspector__block--grow">
        <p className="fo-inspector__label">Sections</p>
        <ul className="fo-inspector__list">
          {blueprint.sections.map((section) => (
            <li
              key={section.id}
              className={
                section.id === selectedNodeId
                  ? 'fo-inspector__item is-active'
                  : 'fo-inspector__item'
              }
            >
              <span>{section.id}</span>
              <code>{section.component}</code>
            </li>
          ))}
        </ul>
      </div>

      <SectionAiPanel />
    </aside>
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
 */
export function Canvas() {
  const blueprint = useEditorStore((s) => s.blueprint);
  const editorEpoch = useEditorStore((s) => s.editorEpoch);
  const viewportId = useEditorStore((s) => s.viewportId);
  const syncFromPuck = useEditorStore((s) => s.syncFromPuck);
  const selectNode = useEditorStore((s) => s.selectNode);
  const syncViewportFromWidth = useEditorStore((s) => s.syncViewportFromWidth);
  const puckData = selectPuckData(blueprint);

  useHistoryHotkeys();

  return (
    <CanvasFrame tokens={blueprint.tokens}>
      <BlueprintInspector />
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
              selectedIdFromPuckData(appState.data, appState.ui.itemSelector),
            );
            syncViewportFromWidth(appState.ui.viewports.current.width);
          }}
          viewports={toPuckViewports()}
        />
      </div>
    </CanvasFrame>
  );
}
