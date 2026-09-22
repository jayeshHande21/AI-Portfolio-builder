import type { CSSProperties } from 'react';
import type { NodeStyles } from '../../blueprint/types';
import { stylesToCss } from '../../lib/stylesToCss';
import { FO_STYLES_PROP } from '../../canvas/puck/styleProp';

export interface HeroLayeredProps {
  brandMark?: string;
  eyebrow?: string;
  ctaLabel?: string;
  secondaryCtaLabel?: string;
  metaLabel?: string;
  imageUrl?: string;
  imageAlt?: string;
  [FO_STYLES_PROP]?: NodeStyles;
}

export function HeroLayered({
  brandMark = 'STUDIO',
  eyebrow = 'Stories in light & shadow',
  ctaLabel = 'View portfolio',
  secondaryCtaLabel = 'Explore sessions',
  metaLabel = 'Available worldwide',
  imageUrl,
  imageAlt = '',
  [FO_STYLES_PROP]: foStyles,
}: HeroLayeredProps) {
  const style = {
    ...stylesToCss(foStyles),
  } as CSSProperties;

  return (
    <section
      className="fo-hero-layered"
      style={style}
      data-component="hero.layered"
    >
      <div className="fo-hero-layered__stage">
        {imageUrl ? (
          <img
            className="fo-hero-layered__figure"
            src={imageUrl}
            alt={imageAlt}
          />
        ) : (
          <div className="fo-hero-layered__placeholder" aria-hidden />
        )}
        <p className="fo-hero-layered__mark" aria-hidden>
          {brandMark}
        </p>
      </div>

      {eyebrow ? (
        <p className="fo-hero-layered__eyebrow">{eyebrow}</p>
      ) : null}

      <div className="fo-hero-layered__actions">
        {ctaLabel ? (
          <button type="button" className="fo-hero-layered__cta">
            {ctaLabel}
          </button>
        ) : null}
        {secondaryCtaLabel ? (
          <button type="button" className="fo-hero-layered__link">
            {secondaryCtaLabel}
          </button>
        ) : null}
      </div>

      {metaLabel ? (
        <p className="fo-hero-layered__meta">{metaLabel}</p>
      ) : null}
    </section>
  );
}
