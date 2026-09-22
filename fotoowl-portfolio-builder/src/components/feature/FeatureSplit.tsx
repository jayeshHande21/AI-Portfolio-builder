import type { NodeStyles } from '../../blueprint/types';
import { stylesToCss } from '../../lib/stylesToCss';
import { FO_STYLES_PROP } from '../../canvas/puck/styleProp';

export interface FeatureSplitProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  imageUrl?: string;
  imageAlt?: string;
  [FO_STYLES_PROP]?: NodeStyles;
}

export function FeatureSplit({
  eyebrow = 'Featured story',
  title = 'Light that stays',
  body = 'A recent session shaped by quiet rooms, soft windows, and the people who filled them.',
  ctaLabel = 'Explore the story',
  imageUrl,
  imageAlt = '',
  [FO_STYLES_PROP]: foStyles,
}: FeatureSplitProps) {
  return (
    <section
      className="fo-feature"
      data-component="feature.split"
      style={stylesToCss(foStyles)}
    >
      <div className="fo-feature__copy">
        {eyebrow ? <p className="fo-feature__eyebrow">{eyebrow}</p> : null}
        <h2 className="fo-feature__title">{title}</h2>
        {body ? <p className="fo-feature__body">{body}</p> : null}
        {ctaLabel ? (
          <button type="button" className="fo-feature__cta">
            {ctaLabel}
          </button>
        ) : null}
      </div>
      <div className="fo-feature__media">
        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt} loading="lazy" />
        ) : (
          <div className="fo-feature__placeholder" aria-hidden />
        )}
      </div>
    </section>
  );
}
