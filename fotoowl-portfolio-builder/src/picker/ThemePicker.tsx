import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { ThemeCategory } from '../themes';
import { listThemePreviews } from './previewFromTheme';
import { ThemePreviewCard } from './ThemePreviewCard';

type FilterId = 'all' | ThemeCategory;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'View All' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'portrait', label: 'Portrait' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'studio', label: 'Studio' },
  { id: 'minimal', label: 'Minimal' },
];

interface ThemePickerProps {
  selectedThemeId: string | null;
  canGoBack: boolean;
  onSelect: (themeId: string) => void;
  onApply: (themeId: string) => void;
  onBack?: () => void;
}

export function ThemePicker({
  selectedThemeId,
  canGoBack,
  onSelect,
  onApply,
  onBack,
}: ThemePickerProps) {
  const [filter, setFilter] = useState<FilterId>('all');
  const previews = useMemo(() => listThemePreviews(), []);

  const filtered = useMemo(() => {
    if (filter === 'all') return previews;
    return previews.filter((preview) => preview.category === filter);
  }, [filter, previews]);

  const sectionLabel =
    filter === 'all'
      ? 'All templates'
      : (FILTERS.find((item) => item.id === filter)?.label ?? 'Templates');

  const applyDisabled = !selectedThemeId;

  return (
    <div className="fo-picker">
      <header className="fo-picker__header">
        <div className="fo-picker__header-side">
          {canGoBack ? (
            <button
              type="button"
              className="fo-picker__icon-btn"
              onClick={onBack}
              aria-label="Back to editor"
            >
              <ArrowLeft size={18} strokeWidth={1.75} />
            </button>
          ) : (
            <span className="fo-picker__brand">FotoOwl</span>
          )}
        </div>
        <h1 className="fo-picker__title">Choose Page Template</h1>
        <div className="fo-picker__header-side fo-picker__header-side--end">
          <button
            type="button"
            className="fo-picker__apply"
            disabled={applyDisabled}
            onClick={() => {
              if (selectedThemeId) onApply(selectedThemeId);
            }}
          >
            Apply Template
          </button>
        </div>
      </header>

      <div className="fo-picker__body">
        <nav className="fo-picker__nav" aria-label="Template categories">
          <ul>
            {FILTERS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`fo-picker__nav-item${filter === item.id ? ' is-active' : ''}`}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section className="fo-picker__main" aria-label={sectionLabel}>
          <header className="fo-picker__section-head">
            <h2>{sectionLabel}</h2>
            <p>Pick a starting look. You can refine every section in the editor.</p>
          </header>

          {filtered.length === 0 ? (
            <p className="fo-picker__empty">No templates in this category yet.</p>
          ) : (
            <div className="fo-picker__grid">
              {filtered.map((preview, index) => (
                <div
                  key={preview.id}
                  className="fo-picker__grid-item"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <ThemePreviewCard
                    preview={preview}
                    selected={selectedThemeId === preview.id}
                    onSelect={onSelect}
                    onApply={onApply}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
