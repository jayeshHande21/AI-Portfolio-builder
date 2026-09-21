export type AboutLayout = 'image_left' | 'image_right';

export interface AboutSectionProps {
  layout?: AboutLayout;
  title?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaLabel?: string;
}

export function AboutSection({
  layout = 'image_left',
  title = 'About the photographer',
  body = 'I create quiet, cinematic frames for people who care about the feeling of a day — not just how it looked.',
  imageUrl,
  imageAlt = '',
  ctaLabel = 'Get in touch',
}: AboutSectionProps) {
  const componentId =
    layout === 'image_right' ? 'about.image_right' : 'about.image_left';

  return (
    <section
      className={`fo-about fo-about--${layout}`}
      data-component={componentId}
    >
      <div className="fo-about__media">
        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt} className="fo-about__image" />
        ) : (
          <div className="fo-about__placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="fo-about__copy">
        <h2 className="fo-about__title">{title}</h2>
        <p className="fo-about__body">{body}</p>
        {ctaLabel ? (
          <button type="button" className="fo-about__cta">
            {ctaLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
