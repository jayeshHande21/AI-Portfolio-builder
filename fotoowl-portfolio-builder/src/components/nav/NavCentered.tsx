import type { NodeStyles } from '../../blueprint/types';
import { stylesToCss } from '../../lib/stylesToCss';
import { FO_STYLES_PROP } from '../../canvas/puck/styleProp';

export interface NavCenteredProps {
  brand?: string;
  leftLinks?: Array<string | { label?: string }>;
  rightLinks?: Array<string | { label?: string }>;
  [FO_STYLES_PROP]?: NodeStyles;
}

function normalizeLinks(
  links: Array<string | { label?: string }> | undefined,
  fallback: string[],
): string[] {
  if (!links?.length) return fallback;
  return links
    .map((item) => (typeof item === 'string' ? item : (item.label ?? '')))
    .filter(Boolean);
}

export function NavCentered({
  brand = 'STUDIO',
  leftLinks,
  rightLinks,
  [FO_STYLES_PROP]: foStyles,
}: NavCenteredProps) {
  const left = normalizeLinks(leftLinks, ['Work', 'Weddings', 'Portraits']);
  const right = normalizeLinks(rightLinks, ['About', 'Contact', 'Book']);

  return (
    <header
      className="fo-nav"
      data-component="nav.centered"
      style={stylesToCss(foStyles)}
    >
      <nav className="fo-nav__bar" aria-label="Primary">
        <ul className="fo-nav__links fo-nav__links--left">
          {left.map((label) => (
            <li key={label}>
              <a href={`#${label.toLowerCase()}`}>{label}</a>
            </li>
          ))}
        </ul>
        <p className="fo-nav__brand">{brand}</p>
        <ul className="fo-nav__links fo-nav__links--right">
          {right.map((label) => (
            <li key={label}>
              <a href={`#${label.toLowerCase()}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
