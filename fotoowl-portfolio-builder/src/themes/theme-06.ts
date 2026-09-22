/**
 * Theme 06 — Studio Monochrome
 * GAZU-inspired minimal studio layout adapted for photographers.
 * Components: nav.centered, hero.layered, work.categories, feature.split,
 * services.row, gallery.grid, footer.minimal
 */
import type { PortfolioBlueprint } from '../blueprint';
import heroCutoutUrl from '../assets/hero-studio-cutout.jpg';
import { unsplash } from './media';
import type { ThemeDefinition } from './types';

/** Studio seamless paper — pairs with cutout hero (black bg keyed out via CSS). */
const STUDIO_PAPER = '#E8E8E8';

const heroPortrait = heroCutoutUrl;
const catWedding = unsplash('photo-1519741497674-611481863552', 800);
const catPortrait = unsplash('photo-1531746020798-e6953c6e8e04', 800);
const catEditorial = unsplash('photo-1469334031218-e382a71b716b', 800);
const featureImg = unsplash('photo-1492562080023-ab3db95bfbce', 1200);
const g1 = unsplash('photo-1511285560929-80b456fe0c7f', 800);
const g2 = unsplash('photo-1529636798458-92182e662485', 800);
const g3 = unsplash('photo-1465495976277-4387d4b0b4c6', 800);
const g4 = unsplash('photo-1519225421980-715cb0215aed', 800);

const SECTION_IDS = {
  nav: 'nav_06',
  hero: 'hero_06',
  categories: 'categories_06',
  feature: 'feature_06',
  services: 'services_06',
  gallery: 'gallery_06',
  footer: 'footer_06',
} as const;

const blueprint: PortfolioBlueprint = {
  id: 'theme-06-source',
  name: 'Studio Monochrome',
  themeId: 'theme-06',
  assets: {
    asset_hero: {
      id: 'asset_hero',
      url: heroPortrait,
      alt: 'Editorial full-body portrait cutout',
    },
    asset_feature: {
      id: 'asset_feature',
      url: featureImg,
      alt: 'Editorial portrait session',
    },
  },
  sections: [
    {
      id: SECTION_IDS.nav,
      type: 'section',
      component: 'nav.centered',
      props: {
        brand: 'NOVA',
        leftLinks: ['Work', 'Weddings', 'Portraits'],
        rightLinks: ['About', 'Contact', 'Book'],
      },
    },
    {
      id: SECTION_IDS.hero,
      type: 'section',
      component: 'hero.layered',
      props: {
        brandMark: 'NOVA',
        eyebrow: 'Stories in light & shadow',
        ctaLabel: 'View portfolio',
        secondaryCtaLabel: 'Explore sessions',
        metaLabel: 'New sessions 2026',
        imageUrl: heroPortrait,
        imageAlt: 'Editorial full-body portrait cutout',
      },
    },
    {
      id: SECTION_IDS.categories,
      type: 'section',
      component: 'work.categories',
      props: {
        items: [
          {
            title: 'Weddings',
            body: 'Quiet ceremonies and receptions told with an editorial eye.',
            linkLabel: 'View weddings',
            imageUrl: catWedding,
            imageAlt: 'Wedding ceremony moment',
          },
          {
            title: 'Portraits',
            body: 'Studio and location portraits shaped by soft, honest light.',
            linkLabel: 'View portraits',
            imageUrl: catPortrait,
            imageAlt: 'Portrait session',
          },
          {
            title: 'Editorial',
            body: 'Campaign and fashion frames for brands that value craft.',
            linkLabel: 'View editorial',
            imageUrl: catEditorial,
            imageAlt: 'Editorial fashion frame',
          },
        ],
      },
    },
    {
      id: SECTION_IDS.feature,
      type: 'section',
      component: 'feature.split',
      props: {
        eyebrow: 'Featured story',
        title: 'Light that stays',
        body: 'A recent session shaped by quiet rooms, soft windows, and the people who filled them. Documentary warmth with a studio finish.',
        ctaLabel: 'Explore the story',
        imageUrl: featureImg,
        imageAlt: 'Editorial portrait session',
      },
    },
    {
      id: SECTION_IDS.services,
      type: 'section',
      component: 'services.row',
      props: {
        items: [
          {
            icon: 'camera',
            title: 'Full-day coverage',
            body: 'Ceremonies to last dance, shot with care',
          },
          {
            icon: 'clock',
            title: 'Fast turnaround',
            body: 'Preview gallery within two weeks',
          },
          {
            icon: 'gallery',
            title: 'Online gallery',
            body: 'High-res downloads for you and guests',
          },
          {
            icon: 'secure',
            title: 'Secure booking',
            body: 'Simple contracts and private client access',
          },
        ],
      },
    },
    {
      id: SECTION_IDS.gallery,
      type: 'section',
      component: 'gallery.grid',
      props: {
        title: 'Selected work',
        viewAllLabel: 'View all',
        images: [
          { url: g1, alt: 'Portrait session' },
          { url: g2, alt: 'Reception dance' },
          { url: g3, alt: 'Detail ring shot' },
          { url: g4, alt: 'Couple portrait' },
        ],
      },
    },
    {
      id: SECTION_IDS.footer,
      type: 'section',
      component: 'footer.minimal',
      props: {
        brand: 'Nova Studio',
        tagline: 'Wedding, portrait & editorial photography',
        email: 'hello@nova-studio.example',
        copyright: '© 2026 Nova Studio',
      },
    },
  ],
};

export const theme06: ThemeDefinition = {
  id: 'theme-06',
  name: 'Studio Monochrome',
  description:
    'Minimal high-contrast studio portfolio with layered hero, work categories, and selected shoots.',
  category: 'studio',
  blueprint,
  tokens: {
    colors: {
      ink: '#111111',
      paper: STUDIO_PAPER,
      accent: '#1a1a1a',
      muted: '#6e6e6e',
    },
    typography: {
      display: '"Syne", "Avenir Next", sans-serif',
      body: '"Source Sans 3", "Segoe UI", sans-serif',
    },
    spacing: {
      sectionY: 'clamp(2.5rem, 7vw, 5rem)',
    },
    radius: '0',
  },
};
