import { Puck } from '@puckeditor/core';
import type { Data } from '@puckeditor/core';
import { ArrowLeftRight, Layers } from 'lucide-react';
import {
  selectAboutSection,
  selectPuckData,
  useEditorStore,
} from '../editor/state';
import { isAboutComponentId } from '../components/registry';
import { puckConfig } from './puck/config';
import { CanvasFrame } from './CanvasFrame';

function BlueprintInspector() {
  const blueprint = useEditorStore((s) => s.blueprint);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const flipAboutLayout = useEditorStore((s) => s.flipAboutLayout);
  const about = selectAboutSection(blueprint);
  const selected = blueprint.sections.find((s) => s.id === selectedNodeId);

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
        <p className="fo-inspector__label">Selected</p>
        <p className="fo-inspector__value">
          {selected
            ? `${selected.id} · ${selected.component ?? selected.type}`
            : 'None — click a section in the canvas'}
        </p>
      </div>

      <div className="fo-inspector__block">
        <p className="fo-inspector__label">About layout (POC)</p>
        <p className="fo-inspector__value mono">
          {about?.component ?? '—'}
        </p>
        <button
          type="button"
          className="fo-inspector__btn"
          onClick={flipAboutLayout}
          disabled={!about || !isAboutComponentId(about.component)}
        >
          <ArrowLeftRight size={14} aria-hidden />
          Flip About image side
        </button>
        <p className="fo-inspector__hint">
          Updates Blueprint <code>component</code>, then remounts Puck from
          Blueprint.
        </p>
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
    </aside>
  );
}

function selectedIdFromPuckData(
  data: Data,
  itemSelector: { index: number; zone?: string } | null | undefined,
): string | null {
  if (!itemSelector || itemSelector.zone) {
    // Nested zones not used in POC — only top-level content
    if (!itemSelector) return null;
  }
  const item = data.content[itemSelector.index];
  const id = item?.props.id;
  return typeof id === 'string' ? id : null;
}

/**
 * Interactive portfolio Canvas — Blueprint → Registry → Puck Adapter → Puck.
 */
export function Canvas() {
  const blueprint = useEditorStore((s) => s.blueprint);
  const editorEpoch = useEditorStore((s) => s.editorEpoch);
  const syncFromPuck = useEditorStore((s) => s.syncFromPuck);
  const selectNode = useEditorStore((s) => s.selectNode);
  const puckData = selectPuckData(blueprint);

  return (
    <CanvasFrame>
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
          onChange={syncFromPuck}
          onPublish={syncFromPuck}
          onAction={(_action, appState) => {
            selectNode(
              selectedIdFromPuckData(appState.data, appState.ui.itemSelector),
            );
          }}
          viewports={[
            { width: 360, height: 'auto', icon: 'Smartphone', label: 'Mobile' },
            { width: 768, height: 'auto', icon: 'Tablet', label: 'Tablet' },
            { width: 1280, height: 'auto', icon: 'Monitor', label: 'Desktop' },
          ]}
        />
      </div>
    </CanvasFrame>
  );
}
