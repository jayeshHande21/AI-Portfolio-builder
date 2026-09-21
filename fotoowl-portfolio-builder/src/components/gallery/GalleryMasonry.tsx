import type { NodeStyles } from '../../blueprint/types';
import { stylesToCss } from '../../lib/stylesToCss';
import { FO_STYLES_PROP } from '../../canvas/puck/styleProp';

export interface GalleryImage {
  url: string;
  alt?: string;
}

export interface GalleryMasonryProps {
  title?: string;
  images?: GalleryImage[];
  [FO_STYLES_PROP]?: NodeStyles;
}

export function GalleryMasonry({
  title = 'Selected work',
  images = [],
  [FO_STYLES_PROP]: foStyles,
}: GalleryMasonryProps) {
  return (
    <section
      className="fo-gallery"
      data-component="gallery.masonry"
      style={stylesToCss(foStyles)}
    >
      <h2 className="fo-gallery__title">{title}</h2>
      <div className="fo-gallery__grid">
        {images.length === 0 ? (
          <div className="fo-gallery__empty">
            Add gallery images via Blueprint assets.
          </div>
        ) : (
          images.map((image, index) => (
            <figure
              key={`${image.url}-${index}`}
              className={`fo-gallery__item fo-gallery__item--${(index % 3) + 1}`}
            >
              <img src={image.url} alt={image.alt ?? ''} loading="lazy" />
            </figure>
          ))
        )}
      </div>
    </section>
  );
}
