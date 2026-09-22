import type { NodeStyles } from '../../blueprint/types';
import { stylesToCss } from '../../lib/stylesToCss';
import { FO_STYLES_PROP } from '../../canvas/puck/styleProp';

export interface GalleryGridImage {
  url: string;
  alt?: string;
}

export interface GalleryGridProps {
  title?: string;
  viewAllLabel?: string;
  images?: GalleryGridImage[];
  [FO_STYLES_PROP]?: NodeStyles;
}

export function GalleryGrid({
  title = 'Selected work',
  viewAllLabel = 'View all',
  images = [],
  [FO_STYLES_PROP]: foStyles,
}: GalleryGridProps) {
  return (
    <section
      className="fo-gallery-grid"
      data-component="gallery.grid"
      style={stylesToCss(foStyles)}
    >
      <header className="fo-gallery-grid__head">
        <h2 className="fo-gallery-grid__title">{title}</h2>
        {viewAllLabel ? (
          <button type="button" className="fo-gallery-grid__view-all">
            {viewAllLabel}
          </button>
        ) : null}
      </header>
      <div className="fo-gallery-grid__row">
        {images.length === 0 ? (
          <div className="fo-gallery-grid__empty">
            Add featured images to this gallery.
          </div>
        ) : (
          images.map((image, index) => (
            <figure key={`${image.url}-${index}`} className="fo-gallery-grid__item">
              <img src={image.url} alt={image.alt ?? ''} loading="lazy" />
            </figure>
          ))
        )}
      </div>
    </section>
  );
}
