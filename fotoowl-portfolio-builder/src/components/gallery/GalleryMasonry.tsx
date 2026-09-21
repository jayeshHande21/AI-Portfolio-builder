export interface GalleryImage {
  url: string;
  alt?: string;
}

export interface GalleryMasonryProps {
  title?: string;
  images?: GalleryImage[];
}

export function GalleryMasonry({
  title = 'Selected work',
  images = [],
}: GalleryMasonryProps) {
  return (
    <section className="fo-gallery" data-component="gallery.masonry">
      <h2 className="fo-gallery__title">{title}</h2>
      <div className="fo-gallery__grid">
        {images.length === 0 ? (
          <div className="fo-gallery__empty">Add gallery images via Blueprint assets.</div>
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
