import type { CSSProperties, ReactNode } from 'react';
import type { ThemePreview } from './previewFromTheme';

interface ThemePreviewCardProps {
  preview: ThemePreview;
  selected: boolean;
  onSelect: (themeId: string) => void;
  onApply: (themeId: string) => void;
}

function PreviewChrome({
  preview,
  children,
}: {
  preview: ThemePreview;
  children: ReactNode;
}) {
  const { tokens } = preview;
  return (
    <div
      className="fo-preview-page"
      style={
        {
          '--pv-ink': tokens.colors.ink,
          '--pv-paper': tokens.colors.paper,
          '--pv-accent': tokens.colors.accent,
          '--pv-muted': tokens.colors.muted,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

function EditorialMasonry({ preview }: { preview: ThemePreview }) {
  const [a, b, c, d] = preview.galleryImages;
  return (
    <PreviewChrome preview={preview}>
      <div className="fo-preview-hero fo-preview-hero--overlay">
        {preview.heroImage ? (
          <img src={preview.heroImage} alt="" loading="lazy" />
        ) : null}
        <div className="fo-preview-hero__veil" />
        <p className="fo-preview-hero__title fo-preview-hero__title--serif">
          {preview.heroTitle}
        </p>
      </div>
      <div className="fo-preview-masonry">
        {a ? <img src={a} alt="" loading="lazy" /> : null}
        {b ? <img src={b} alt="" loading="lazy" className="fo-preview-masonry__tall" /> : null}
        {c ? <img src={c} alt="" loading="lazy" /> : null}
        {d ? <img src={d} alt="" loading="lazy" /> : null}
      </div>
      <p className="fo-preview-quote">“Quiet light. Honest rooms. Stories that stay.”</p>
      <div className="fo-preview-brands">
        <span>VOGUE</span>
        <span>ELLE</span>
        <span>BRIDES</span>
      </div>
    </PreviewChrome>
  );
}

function CoastalGrid({ preview }: { preview: ThemePreview }) {
  return (
    <PreviewChrome preview={preview}>
      <div className="fo-preview-hero fo-preview-hero--landscape">
        {preview.heroImage ? (
          <img src={preview.heroImage} alt="" loading="lazy" />
        ) : null}
      </div>
      <p className="fo-preview-kicker">{preview.heroEyebrow}</p>
      <p className="fo-preview-title-sm">{preview.heroTitle}</p>
      <div className="fo-preview-grid">
        {preview.galleryImages.slice(0, 8).map((url) => (
          <img key={url} src={url} alt="" loading="lazy" />
        ))}
      </div>
      <div className="fo-preview-cta">
        <p>Are you ready for your session?</p>
        <span>Let&apos;s do it</span>
      </div>
      <div className="fo-preview-thumbs">
        {preview.galleryImages.slice(0, 5).map((url) => (
          <img key={`t-${url}`} src={url} alt="" loading="lazy" />
        ))}
      </div>
    </PreviewChrome>
  );
}

function StudioDark({ preview }: { preview: ThemePreview }) {
  return (
    <PreviewChrome preview={preview}>
      <div className="fo-preview-hero fo-preview-hero--dark">
        {preview.heroImage ? (
          <img src={preview.heroImage} alt="" loading="lazy" />
        ) : null}
        <div className="fo-preview-hero__veil fo-preview-hero__veil--heavy" />
        <div className="fo-preview-hero__copy">
          <p className="fo-preview-kicker fo-preview-kicker--light">
            {preview.heroEyebrow}
          </p>
          <p className="fo-preview-hero__title fo-preview-hero__title--light">
            {preview.heroTitle}
          </p>
        </div>
      </div>
      <div className="fo-preview-grid fo-preview-grid--tight">
        {preview.galleryImages.slice(0, 4).map((url) => (
          <img key={url} src={url} alt="" loading="lazy" />
        ))}
      </div>
      <p className="fo-preview-brand-foot">{preview.brand}</p>
    </PreviewChrome>
  );
}

function MinimalType({ preview }: { preview: ThemePreview }) {
  const [a, b, c, d] = preview.galleryImages;
  return (
    <PreviewChrome preview={preview}>
      <div className="fo-preview-type-hero">
        <p className="fo-preview-hero__title fo-preview-hero__title--serif fo-preview-hero__title--ink">
          {preview.heroTitle}
        </p>
        <p className="fo-preview-sub">{preview.heroSubtitle}</p>
      </div>
      <div className="fo-preview-airy">
        {a ? <img src={a} alt="" loading="lazy" className="fo-preview-airy__wide" /> : null}
        {b ? <img src={b} alt="" loading="lazy" /> : null}
        {c ? <img src={c} alt="" loading="lazy" className="fo-preview-airy__offset" /> : null}
        {d ? <img src={d} alt="" loading="lazy" /> : null}
      </div>
      <div className="fo-preview-links">
        <span>About</span>
        <span>Info &amp; Pricing</span>
        <span>Contact</span>
      </div>
    </PreviewChrome>
  );
}

function Documentary({ preview }: { preview: ThemePreview }) {
  return (
    <PreviewChrome preview={preview}>
      <div className="fo-preview-type-hero fo-preview-type-hero--compact">
        <p className="fo-preview-kicker">{preview.heroEyebrow}</p>
        <p className="fo-preview-hero__title fo-preview-hero__title--serif fo-preview-hero__title--ink">
          {preview.heroTitle}
        </p>
      </div>
      <div className="fo-preview-hero fo-preview-hero--landscape">
        {preview.heroImage ? (
          <img src={preview.heroImage} alt="" loading="lazy" />
        ) : null}
      </div>
      <div className="fo-preview-masonry fo-preview-masonry--loose">
        {preview.galleryImages.slice(0, 4).map((url, index) => (
          <img
            key={url}
            src={url}
            alt=""
            loading="lazy"
            className={index === 1 ? 'fo-preview-masonry__tall' : undefined}
          />
        ))}
      </div>
      <div className="fo-preview-thumbs">
        {preview.galleryImages.slice(0, 6).map((url) => (
          <img key={`d-${url}`} src={url} alt="" loading="lazy" />
        ))}
      </div>
    </PreviewChrome>
  );
}

function PreviewBody({ preview }: { preview: ThemePreview }) {
  switch (preview.layout) {
    case 'coastal-grid':
      return <CoastalGrid preview={preview} />;
    case 'studio-dark':
      return <StudioDark preview={preview} />;
    case 'minimal-type':
      return <MinimalType preview={preview} />;
    case 'documentary':
      return <Documentary preview={preview} />;
    case 'editorial-masonry':
    default:
      return <EditorialMasonry preview={preview} />;
  }
}

export function ThemePreviewCard({
  preview,
  selected,
  onSelect,
  onApply,
}: ThemePreviewCardProps) {
  return (
    <article
      className={`fo-theme-card${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
    >
      <button
        type="button"
        className="fo-theme-card__hit"
        onClick={() => onSelect(preview.id)}
        onDoubleClick={() => onApply(preview.id)}
        aria-label={`Select ${preview.name}`}
      >
        <div className="fo-theme-card__viewport">
          <PreviewBody preview={preview} />
        </div>
      </button>
      <div className="fo-theme-card__meta">
        <div>
          <p className="fo-theme-card__name">{preview.name}</p>
          <p className="fo-theme-card__desc">{preview.description}</p>
        </div>
        <button
          type="button"
          className="fo-theme-card__use"
          onClick={() => onApply(preview.id)}
        >
          Use
        </button>
      </div>
    </article>
  );
}
