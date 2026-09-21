import type { CSSProperties } from 'react';
import type { NodeStyles } from '../../blueprint/types';
import { stylesToCss } from '../../lib/stylesToCss';
import { FO_STYLES_PROP } from '../../canvas/puck/styleProp';

export interface HeroEditorialProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  imageUrl?: string;
  imageAlt?: string;
  [FO_STYLES_PROP]?: NodeStyles;
}

export function HeroEditorial({
  eyebrow = 'Photography',
  title = 'Stories Worth Remembering',
  subtitle = 'Cinematic wedding and editorial photography.',
  ctaLabel = 'View work',
  imageUrl,
  imageAlt = '',
  [FO_STYLES_PROP]: foStyles,
}: HeroEditorialProps) {
  const style = {
    ...stylesToCss(foStyles),
    '--hero-image': imageUrl ? `url(${imageUrl})` : undefined,
  } as CSSProperties;

  return (
    <section className="fo-hero" style={style} data-component="hero.editorial">
      <div className="fo-hero__media" role="img" aria-label={imageAlt} />
      <div className="fo-hero__content">
        {eyebrow ? <p className="fo-hero__eyebrow">{eyebrow}</p> : null}
        <h1 className="fo-hero__title">{title}</h1>
        {subtitle ? <p className="fo-hero__subtitle">{subtitle}</p> : null}
        {ctaLabel ? (
          <button type="button" className="fo-hero__cta">
            {ctaLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
