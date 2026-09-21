/**
 * Theme 05 — Documentary Travel
 * Shared components; warm documentary palette; story-led About.
 */
import type { PortfolioBlueprint } from '../blueprint';
import { unsplash } from './media';
import { defaultDesignTokens } from './tokens';
import type { ThemeDefinition } from './types';

const heroImage = unsplash('photo-1469854523086-cc02fe5d8800', 1600);

const blueprint: PortfolioBlueprint = {
  id: 'theme-05-source',
  name: 'Documentary Travel',
  themeId: 'theme-05',
  assets: {},
  sections: [
    {
      id: 'hero_01',
      type: 'section',
      component: 'hero.editorial',
      props: {
        eyebrow: 'Travel & documentary',
        title: 'Places That Stay With You',
        subtitle:
          'Documentary travel photography for magazines, brands, and personal archives — street, ritual, and quiet in-between hours.',
        ctaLabel: 'Explore stories',
        imageUrl: heroImage,
        imageAlt: 'Travel road through mountains',
      },
    },
    {
      id: 'about_01',
      type: 'section',
      component: 'about.image_left',
      props: {
        title: 'I’m Arun',
        body: 'I work slowly in new places — listening first, then photographing. Assignments and personal projects across South Asia, the Middle East, and Southern Europe.',
        imageUrl: unsplash('photo-1506794778202-cad84cf45f1d', 900),
        imageAlt: 'Documentary photographer',
        ctaLabel: 'Commission a story',
      },
    },
    {
      id: 'gallery_01',
      type: 'section',
      component: 'gallery.masonry',
      props: {
        title: 'Field notes',
        images: [
          {
            url: unsplash('photo-1488646953014-85cb44e25828'),
            alt: 'Market street',
          },
          {
            url: unsplash('photo-1506929562872-bb421503ef21'),
            alt: 'Coastal town',
          },
          {
            url: unsplash('photo-1476514525535-07fb3b4ae5f1'),
            alt: 'Lake at dusk',
          },
          {
            url: unsplash('photo-1501785888041-af3ef285b470'),
            alt: 'Mountain path',
          },
        ],
      },
    },
    {
      id: 'footer_01',
      type: 'section',
      component: 'footer.minimal',
      props: {
        brand: 'Arun Field',
        tagline: 'Documentary & travel photography',
        email: 'hello@arunfield.example',
        copyright: '© 2026 Arun Field',
      },
    },
  ],
};

export const theme05: ThemeDefinition = {
  id: 'theme-05',
  name: 'Documentary Travel',
  description:
    'Travel documentary portfolio with warm field tones and story-first About.',
  category: 'editorial',
  blueprint,
  tokens: {
    ...defaultDesignTokens,
    colors: {
      ink: '#1a1510',
      paper: '#f6f0e6',
      accent: '#9a3412',
      muted: '#7c6f60',
    },
  },
};
