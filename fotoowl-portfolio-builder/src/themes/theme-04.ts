/**
 * Theme 04 — Minimal Brand
 * Shared components; section order Hero → Gallery → About → Footer.
 */
import type { PortfolioBlueprint } from '../blueprint';
import { unsplash } from './media';
import { defaultDesignTokens } from './tokens';
import type { ThemeDefinition } from './types';

const heroImage = unsplash('photo-1470071459604-3b5ec3a7fe05', 1600);

const blueprint: PortfolioBlueprint = {
  id: 'theme-04-source',
  name: 'Minimal Brand',
  themeId: 'theme-04',
  assets: {},
  sections: [
    {
      id: 'hero_01',
      type: 'section',
      component: 'hero.editorial',
      props: {
        eyebrow: 'Brand & product',
        title: 'Quiet Clarity',
        subtitle:
          'Minimal product and brand photography with generous space and precise detail.',
        ctaLabel: 'View work',
        imageUrl: heroImage,
        imageAlt: 'Minimal landscape for brand mood',
      },
    },
    {
      id: 'gallery_01',
      type: 'section',
      component: 'gallery.masonry',
      props: {
        title: 'Selected commissions',
        images: [
          {
            url: unsplash('photo-1441986300917-64674bd600d8'),
            alt: 'Product still',
          },
          {
            url: unsplash('photo-1526170375885-4d8ecf77b99f'),
            alt: 'Object study',
          },
          {
            url: unsplash('photo-1505740420928-5e560c06d30e'),
            alt: 'Detail product',
          },
          {
            url: unsplash('photo-1572635196237-14b3f281503f'),
            alt: 'Lifestyle product',
          },
        ],
      },
    },
    {
      id: 'about_01',
      type: 'section',
      component: 'about.image_right',
      props: {
        title: 'Studio Line',
        body: 'We make calm, durable images for brands that prefer less noise — clean surfaces, honest materials, and careful pacing.',
        imageUrl: unsplash('photo-1438761681033-6461ffad8d80', 900),
        imageAlt: 'Brand photographer',
        ctaLabel: 'Start a project',
      },
    },
    {
      id: 'footer_01',
      type: 'section',
      component: 'footer.minimal',
      props: {
        brand: 'Studio Line',
        tagline: 'Brand & product photography',
        email: 'hello@studioline.example',
        copyright: '© 2026 Studio Line',
      },
    },
  ],
};

export const theme04: ThemeDefinition = {
  id: 'theme-04',
  name: 'Minimal Brand',
  description:
    'Sparse brand portfolio with gallery-first flow and a warm neutral palette.',
  category: 'minimal',
  blueprint,
  tokens: {
    ...defaultDesignTokens,
    colors: {
      ink: '#1c1917',
      paper: '#fafaf9',
      accent: '#a16207',
      muted: '#78716c',
    },
  },
};
