/**
 * Sample theme 01 — starting Portfolio Blueprint for the Canvas POC.
 * Themes are starting points; user portfolios must not mutate theme source data.
 */
import type { PortfolioBlueprint } from '../blueprint';
import heroUrl from '../assets/hero.png';

const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const theme01: PortfolioBlueprint = {
  id: 'portfolio-theme-01-draft',
  name: 'Sample Theme 01',
  themeId: 'theme-01',
  assets: {
    asset_hero: {
      id: 'asset_hero',
      url: heroUrl,
      alt: 'Couple walking through soft evening light',
    },
    asset_portrait: {
      id: 'asset_portrait',
      url: unsplash('photo-1554048612-b6a482bc67e5', 900),
      alt: 'Photographer portrait',
    },
    asset_g1: {
      id: 'asset_g1',
      url: unsplash('photo-1519741497674-611481863552'),
      alt: 'Wedding ceremony',
    },
    asset_g2: {
      id: 'asset_g2',
      url: unsplash('photo-1465495976277-4387d4b0b4c6'),
      alt: 'Detail ring shot',
    },
    asset_g3: {
      id: 'asset_g3',
      url: unsplash('photo-1529636798458-92182e662485'),
      alt: 'Reception dance',
    },
    asset_g4: {
      id: 'asset_g4',
      url: unsplash('photo-1511285560929-80b456fe0c7f'),
      alt: 'Portrait session',
    },
  },
  sections: [
    {
      id: 'hero_01',
      type: 'section',
      component: 'hero.editorial',
      props: {
        eyebrow: 'Wedding & editorial',
        title: 'Stories Worth Remembering',
        subtitle:
          'Cinematic photography for couples who want their day to feel as quiet and honest as it was lived.',
        ctaLabel: 'View selected work',
        imageUrl: heroUrl,
        imageAlt: 'Couple walking through soft evening light',
      },
    },
    {
      id: 'about_01',
      type: 'section',
      component: 'about.image_left',
      props: {
        title: 'Hello, I’m Maya',
        body: 'I photograph weddings and portraits with an editorial eye — soft light, real moments, and rooms that still feel like rooms. Based in Lisbon, available worldwide.',
        imageUrl: unsplash('photo-1554048612-b6a482bc67e5', 900),
        imageAlt: 'Photographer portrait',
        ctaLabel: 'Book a discovery call',
      },
    },
    {
      id: 'gallery_01',
      type: 'section',
      component: 'gallery.masonry',
      props: {
        title: 'Selected work',
        images: [
          {
            url: unsplash('photo-1519741497674-611481863552'),
            alt: 'Wedding ceremony',
          },
          {
            url: unsplash('photo-1465495976277-4387d4b0b4c6'),
            alt: 'Detail ring shot',
          },
          {
            url: unsplash('photo-1529636798458-92182e662485'),
            alt: 'Reception dance',
          },
          {
            url: unsplash('photo-1511285560929-80b456fe0c7f'),
            alt: 'Portrait session',
          },
        ],
      },
    },
    {
      id: 'footer_01',
      type: 'section',
      component: 'footer.minimal',
      props: {
        brand: 'Maya Atelier',
        tagline: 'Wedding & editorial photography',
        email: 'hello@maya-atelier.example',
        copyright: '© 2026 Maya Atelier',
      },
    },
  ],
};

/** Clone theme into a fresh portfolio draft (never mutate the theme module). */
export function createPortfolioFromTheme(
  theme: PortfolioBlueprint,
): PortfolioBlueprint {
  return structuredClone(theme);
}
