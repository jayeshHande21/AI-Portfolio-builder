/**
 * Theme 02 — Coastal Portrait
 * Same registry components; About uses image_right; cooler token palette.
 */
import type { PortfolioBlueprint } from '../blueprint';
import { unsplash } from './media';
import { defaultDesignTokens } from './tokens';
import type { ThemeDefinition } from './types';

const heroImage = unsplash('photo-1494790108377-be9c29b29330', 1600);

const blueprint: PortfolioBlueprint = {
  id: 'theme-02-source',
  name: 'Coastal Portrait',
  themeId: 'theme-02',
  assets: {},
  sections: [
    {
      id: 'hero_01',
      type: 'section',
      component: 'hero.editorial',
      props: {
        eyebrow: 'Portrait & lifestyle',
        title: 'Light Along the Shore',
        subtitle:
          'Natural-light portraits for people who feel most themselves near the water.',
        ctaLabel: 'Browse portraits',
        imageUrl: heroImage,
        imageAlt: 'Portrait near coastal light',
      },
    },
    {
      id: 'about_01',
      type: 'section',
      component: 'about.image_right',
      props: {
        title: 'I’m Elena',
        body: 'I shoot relaxed, wind-in-the-hair sessions along the Atlantic coast — unhurried, honest, and full of soft blue hour.',
        imageUrl: unsplash('photo-1534528741775-53994a69daeb', 900),
        imageAlt: 'Photographer portrait',
        ctaLabel: 'Plan a session',
      },
    },
    {
      id: 'gallery_01',
      type: 'section',
      component: 'gallery.masonry',
      props: {
        title: 'Recent sessions',
        images: [
          {
            url: unsplash('photo-1529626455594-4ff0802cfb7e'),
            alt: 'Coastal portrait',
          },
          {
            url: unsplash('photo-1517841905240-472988babdf9'),
            alt: 'Lifestyle portrait',
          },
          {
            url: unsplash('photo-1531746020798-e6953c6e8e04'),
            alt: 'Golden hour',
          },
          {
            url: unsplash('photo-1524504388940-b1c1722653e1'),
            alt: 'Studio soft light',
          },
        ],
      },
    },
    {
      id: 'footer_01',
      type: 'section',
      component: 'footer.minimal',
      props: {
        brand: 'Elena Coast',
        tagline: 'Portrait photography',
        email: 'hello@elenacoast.example',
        copyright: '© 2026 Elena Coast',
      },
    },
  ],
};

export const theme02: ThemeDefinition = {
  id: 'theme-02',
  name: 'Coastal Portrait',
  description:
    'Airy portrait portfolio with image-right About and a cool coastal palette.',
  category: 'portrait',
  blueprint,
  tokens: {
    ...defaultDesignTokens,
    colors: {
      ink: '#10212b',
      paper: '#eef3f5',
      accent: '#2a6f97',
      muted: '#5a7380',
    },
  },
};
