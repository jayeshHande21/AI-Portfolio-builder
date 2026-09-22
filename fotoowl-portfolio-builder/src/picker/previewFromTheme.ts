import type { DesignTokens } from '../blueprint';
import { listThemes } from '../themes';
import type { ThemeCategory } from '../themes';

export type PreviewLayout =
  | 'editorial-masonry'
  | 'coastal-grid'
  | 'studio-dark'
  | 'minimal-type'
  | 'documentary';

export interface ThemePreview {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  layout: PreviewLayout;
  tokens: DesignTokens;
  heroTitle: string;
  heroSubtitle: string;
  heroEyebrow: string;
  heroImage: string;
  galleryImages: string[];
  brand: string;
}

const LAYOUT_BY_THEME: Record<string, PreviewLayout> = {
  'theme-01': 'editorial-masonry',
  'theme-02': 'coastal-grid',
  'theme-03': 'studio-dark',
  'theme-04': 'minimal-type',
  'theme-05': 'documentary',
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function galleryUrls(props: Record<string, unknown> | undefined): string[] {
  const images = props?.images;
  if (!Array.isArray(images)) return [];
  return images
    .map((item) => {
      if (item && typeof item === 'object' && 'url' in item) {
        return asString((item as { url: unknown }).url);
      }
      return '';
    })
    .filter(Boolean);
}

export function listThemePreviews(): ThemePreview[] {
  return listThemes().map((theme) => {
    const hero = theme.blueprint.sections.find((s) =>
      s.component?.startsWith('hero'),
    );
    const gallery = theme.blueprint.sections.find((s) =>
      s.component?.startsWith('gallery'),
    );
    const footer = theme.blueprint.sections.find((s) =>
      s.component?.startsWith('footer'),
    );
    const heroProps = hero?.props ?? {};
    const footerProps = footer?.props ?? {};

    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      category: theme.category,
      layout: LAYOUT_BY_THEME[theme.id] ?? 'editorial-masonry',
      tokens: theme.tokens,
      heroTitle: asString(heroProps.title, theme.name),
      heroSubtitle: asString(heroProps.subtitle),
      heroEyebrow: asString(heroProps.eyebrow),
      heroImage: asString(heroProps.imageUrl),
      galleryImages: galleryUrls(gallery?.props),
      brand: asString(footerProps.brand, theme.name),
    };
  });
}
