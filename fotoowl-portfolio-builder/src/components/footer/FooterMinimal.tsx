import type { NodeStyles } from '../../blueprint/types';
import { stylesToCss } from '../../lib/stylesToCss';
import { FO_STYLES_PROP } from '../../canvas/puck/styleProp';

export interface FooterMinimalProps {
  brand?: string;
  tagline?: string;
  email?: string;
  copyright?: string;
  [FO_STYLES_PROP]?: NodeStyles;
}

export function FooterMinimal({
  brand = 'FotoOwl',
  tagline = 'Made for photographers',
  email = 'hello@studio.example',
  copyright = `© ${new Date().getFullYear()}`,
  [FO_STYLES_PROP]: foStyles,
}: FooterMinimalProps) {
  return (
    <footer
      className="fo-footer"
      data-component="footer.minimal"
      style={stylesToCss(foStyles)}
    >
      <div className="fo-footer__brand">
        <p className="fo-footer__name">{brand}</p>
        <p className="fo-footer__tagline">{tagline}</p>
      </div>
      <div className="fo-footer__meta">
        <a className="fo-footer__email" href={`mailto:${email}`}>
          {email}
        </a>
        <p className="fo-footer__copy">{copyright}</p>
      </div>
    </footer>
  );
}
