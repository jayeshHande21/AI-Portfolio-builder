import { Canvas } from './canvas/Canvas';
import { ThemePicker } from './picker';
import { useEditorStore } from './editor/state';
import '@puckeditor/core/puck.css';
import './styles/editor.css';
import './styles/portfolio.css';
import './styles/picker.css';

export default function App() {
  const appPhase = useEditorStore((s) => s.appPhase);
  const selectedThemeId = useEditorStore((s) => s.selectedThemeId);
  const hasEnteredEditor = useEditorStore((s) => s.hasEnteredEditor);
  const selectThemePreview = useEditorStore((s) => s.selectThemePreview);
  const applyThemeAndEnterEditor = useEditorStore(
    (s) => s.applyThemeAndEnterEditor,
  );
  const returnToEditor = useEditorStore((s) => s.returnToEditor);

  return (
    <main className="fo-app">
      {appPhase === 'picker' ? (
        <ThemePicker
          selectedThemeId={selectedThemeId}
          canGoBack={hasEnteredEditor}
          onSelect={selectThemePreview}
          onApply={applyThemeAndEnterEditor}
          onBack={returnToEditor}
        />
      ) : (
        <Canvas />
      )}
    </main>
  );
}
