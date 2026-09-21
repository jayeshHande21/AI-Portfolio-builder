/**
 * Puck Config — editor-facing component definitions.
 * Renders via FotoOwl Component Registry implementations.
 */
import type { Config } from '@puckeditor/core';
import { AboutSection } from '../../components/about';
import { FooterMinimal } from '../../components/footer';
import { GalleryMasonry } from '../../components/gallery';
import { HeroEditorial } from '../../components/hero';

export type PuckComponents = {
  HeroEditorial: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    imageUrl: string;
    imageAlt: string;
  };
  About: {
    layout: 'image_left' | 'image_right';
    title: string;
    body: string;
    imageUrl: string;
    imageAlt: string;
    ctaLabel: string;
  };
  GalleryMasonry: {
    title: string;
    images: { url: string; alt?: string }[];
  };
  FooterMinimal: {
    brand: string;
    tagline: string;
    email: string;
    copyright: string;
  };
};

export const puckConfig: Config<PuckComponents> = {
  components: {
    HeroEditorial: {
      label: 'Hero · Editorial',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        title: { type: 'text', label: 'Title' },
        subtitle: { type: 'textarea', label: 'Subtitle' },
        ctaLabel: { type: 'text', label: 'CTA label' },
        imageUrl: { type: 'text', label: 'Image URL' },
        imageAlt: { type: 'text', label: 'Image alt' },
      },
      defaultProps: {
        eyebrow: 'Photography',
        title: 'Stories Worth Remembering',
        subtitle: 'Cinematic wedding and editorial photography.',
        ctaLabel: 'View work',
        imageUrl: '',
        imageAlt: '',
      },
      render: (props) => <HeroEditorial {...props} />,
    },
    About: {
      label: 'About',
      fields: {
        layout: {
          type: 'radio',
          label: 'Image position',
          options: [
            { label: 'Image left', value: 'image_left' },
            { label: 'Image right', value: 'image_right' },
          ],
        },
        title: { type: 'text', label: 'Title' },
        body: { type: 'textarea', label: 'Body' },
        imageUrl: { type: 'text', label: 'Image URL' },
        imageAlt: { type: 'text', label: 'Image alt' },
        ctaLabel: { type: 'text', label: 'CTA label' },
      },
      defaultProps: {
        layout: 'image_left',
        title: 'About the photographer',
        body: 'I create quiet, cinematic frames for people who care about the feeling of a day.',
        imageUrl: '',
        imageAlt: '',
        ctaLabel: 'Get in touch',
      },
      render: (props) => <AboutSection {...props} />,
    },
    GalleryMasonry: {
      label: 'Gallery · Masonry',
      fields: {
        title: { type: 'text', label: 'Title' },
        images: {
          type: 'array',
          label: 'Images',
          arrayFields: {
            url: { type: 'text', label: 'URL' },
            alt: { type: 'text', label: 'Alt' },
          },
          getItemSummary: (item, index = 0) => item.alt || `Image ${index + 1}`,
          defaultItemProps: { url: '', alt: '' },
        },
      },
      defaultProps: {
        title: 'Selected work',
        images: [],
      },
      render: (props) => <GalleryMasonry {...props} />,
    },
    FooterMinimal: {
      label: 'Footer · Minimal',
      fields: {
        brand: { type: 'text', label: 'Brand' },
        tagline: { type: 'text', label: 'Tagline' },
        email: { type: 'text', label: 'Email' },
        copyright: { type: 'text', label: 'Copyright' },
      },
      defaultProps: {
        brand: 'FotoOwl',
        tagline: 'Made for photographers',
        email: 'hello@studio.example',
        copyright: '© 2026',
      },
      render: (props) => <FooterMinimal {...props} />,
    },
  },
  categories: {
    sections: {
      title: 'Sections',
      components: ['HeroEditorial', 'About', 'GalleryMasonry', 'FooterMinimal'],
      defaultExpanded: true,
    },
  },
};
