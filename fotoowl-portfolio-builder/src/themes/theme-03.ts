/**
 * Theme 03 — Dark Studio
 * Shared components; darker tokens; gallery-first emphasis in copy.
 */
import type { PortfolioBlueprint } from '../blueprint';
import { unsplash } from './media';
import { defaultDesignTokens } from './tokens';
import type { ThemeDefinition } from './types';

const heroImage = unsplash('photo-1554048612-b6a482bc67e5', 1600);

const blueprint: PortfolioBlueprint = {
  id: 'theme-03-source',
  name: 'Dark Studio',
  themeId: 'theme-03',
  assets: {},
  sections: [
    {
      id: 'hero_01',
      type: 'section',
      component: 'hero.editorial',
      props: {
        eyebrow: 'Studio & fashion',
        title: 'Shadows & Structure',
        subtitle:
          'Controlled light, sharp silhouette, and quiet drama for fashion and brand work.',
        ctaLabel: 'See the portfolio',
        imageUrl: heroImage,
        imageAlt: 'Studio fashion frame',
      },
    },
    {
      id: 'gallery_01',
      type: 'section',
      component: 'gallery.masonry',
      props: {
        title: 'Studio frames',
        images: [
          {
            url: unsplash('photo-1469334031218-e382a71b716b'),
            alt: 'Fashion studio',
          },
          {
            url: unsplash('photo-1509631179647-0177331693ae'),
            alt: 'Editorial look',
          },
          {
            url: unsplash('photo-1483985988355-763728e1935b'),
            alt: 'Runway mood',
          },
          {
            url: unsplash('photo-1515886657613-9f3515b0c78f'),
            alt: 'Portrait study',
          },
        ],
      },
    },
    {
      id: 'about_01',
      type: 'section',
      component: 'about.image_left',
      props: {
        title: 'Noa Atelier',
        body: 'A small studio practice focused on fashion stills and brand campaigns — precise light, restrained color, and strong geometry.',
        imageUrl: unsplash('photo-1507003211169-0a1dd7228f2d', 900),
        imageAlt: 'Studio photographer',
        ctaLabel: 'Request a treatment',
      },
    },
    {
      id: 'footer_01',
      type: 'section',
      component: 'footer.minimal',
      props: {
        brand: 'Noa Atelier',
        tagline: 'Studio & fashion photography',
        email: 'studio@noa-atelier.example',
        copyright: '© 2026 Noa Atelier',
      },
    },
  ],
};

export const theme03: ThemeDefinition = {
  id: 'theme-03',
  name: 'Dark Studio',
  description:
    'Fashion-forward studio layout with gallery emphasis and a dark ink palette.',
  category: 'studio',
  blueprint,
  tokens: {
    ...defaultDesignTokens,
    colors: {
      ink: '#0b0d10',
      paper: '#e8e6e1',
      accent: '#c45c26',
      muted: '#8a8580',
    },
  },
};
