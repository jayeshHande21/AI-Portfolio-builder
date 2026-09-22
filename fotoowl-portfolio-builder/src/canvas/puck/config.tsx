/**
 * Puck Config — editor-facing component definitions.
 * Renders via FotoOwl Component Registry implementations.
 */
import type { Config } from '@puckeditor/core';
import { AboutSection } from '../../components/about';
import { CustomSectionHost } from '../../components/custom';
import { FeatureSplit } from '../../components/feature';
import { FooterMinimal } from '../../components/footer';
import { GalleryGrid, GalleryMasonry } from '../../components/gallery';
import { HeroEditorial, HeroLayered } from '../../components/hero';
import { NavCentered } from '../../components/nav';
import { ServicesRow } from '../../components/services';
import { WorkCategories } from '../../components/work';

export type PuckComponents = {
  HeroEditorial: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    imageUrl: string;
    imageAlt: string;
  };
  HeroLayered: {
    brandMark: string;
    eyebrow: string;
    ctaLabel: string;
    secondaryCtaLabel: string;
    metaLabel: string;
    imageUrl: string;
    imageAlt: string;
  };
  NavCentered: {
    brand: string;
    leftLinks: { label: string }[];
    rightLinks: { label: string }[];
  };
  About: {
    layout: 'image_left' | 'image_right';
    title: string;
    body: string;
    imageUrl: string;
    imageAlt: string;
    ctaLabel: string;
  };
  WorkCategories: {
    items: {
      title: string;
      body: string;
      linkLabel: string;
      imageUrl: string;
      imageAlt: string;
    }[];
  };
  FeatureSplit: {
    eyebrow: string;
    title: string;
    body: string;
    ctaLabel: string;
    imageUrl: string;
    imageAlt: string;
  };
  ServicesRow: {
    items: {
      icon: 'camera' | 'clock' | 'gallery' | 'secure';
      title: string;
      body: string;
    }[];
  };
  GalleryMasonry: {
    title: string;
    images: { url: string; alt?: string }[];
  };
  GalleryGrid: {
    title: string;
    viewAllLabel: string;
    images: { url: string; alt?: string }[];
  };
  FooterMinimal: {
    brand: string;
    tagline: string;
    email: string;
    copyright: string;
  };
  CustomSection: {
    componentId: string;
    title: string;
    body: string;
    brand: string;
    tagline: string;
    email: string;
    ctaLabel: string;
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
    HeroLayered: {
      label: 'Hero · Layered',
      fields: {
        brandMark: { type: 'text', label: 'Brand mark' },
        eyebrow: { type: 'text', label: 'Eyebrow' },
        ctaLabel: { type: 'text', label: 'Primary CTA' },
        secondaryCtaLabel: { type: 'text', label: 'Secondary CTA' },
        metaLabel: { type: 'text', label: 'Meta label' },
        imageUrl: { type: 'text', label: 'Image URL' },
        imageAlt: { type: 'text', label: 'Image alt' },
      },
      defaultProps: {
        brandMark: 'STUDIO',
        eyebrow: 'Stories in light & shadow',
        ctaLabel: 'View portfolio',
        secondaryCtaLabel: 'Explore sessions',
        metaLabel: 'Available worldwide',
        imageUrl: '',
        imageAlt: '',
      },
      render: (props) => <HeroLayered {...props} />,
    },
    NavCentered: {
      label: 'Nav · Centered',
      fields: {
        brand: { type: 'text', label: 'Brand' },
        leftLinks: {
          type: 'array',
          label: 'Left links',
          arrayFields: {
            label: { type: 'text', label: 'Label' },
          },
          getItemSummary: (item, index = 0) => item.label || `Link ${index + 1}`,
          defaultItemProps: { label: 'Work' },
        },
        rightLinks: {
          type: 'array',
          label: 'Right links',
          arrayFields: {
            label: { type: 'text', label: 'Label' },
          },
          getItemSummary: (item, index = 0) => item.label || `Link ${index + 1}`,
          defaultItemProps: { label: 'About' },
        },
      },
      defaultProps: {
        brand: 'STUDIO',
        leftLinks: [
          { label: 'Work' },
          { label: 'Weddings' },
          { label: 'Portraits' },
        ],
        rightLinks: [
          { label: 'About' },
          { label: 'Contact' },
          { label: 'Book' },
        ],
      },
      render: (props) => <NavCentered {...props} />,
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
    WorkCategories: {
      label: 'Work · Categories',
      fields: {
        items: {
          type: 'array',
          label: 'Categories',
          arrayFields: {
            title: { type: 'text', label: 'Title' },
            body: { type: 'textarea', label: 'Body' },
            linkLabel: { type: 'text', label: 'Link label' },
            imageUrl: { type: 'text', label: 'Image URL' },
            imageAlt: { type: 'text', label: 'Image alt' },
          },
          getItemSummary: (item, index = 0) => item.title || `Category ${index + 1}`,
          defaultItemProps: {
            title: 'Portraits',
            body: '',
            linkLabel: 'View',
            imageUrl: '',
            imageAlt: '',
          },
        },
      },
      defaultProps: {
        items: [],
      },
      render: (props) => <WorkCategories {...props} />,
    },
    FeatureSplit: {
      label: 'Feature · Split',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        title: { type: 'text', label: 'Title' },
        body: { type: 'textarea', label: 'Body' },
        ctaLabel: { type: 'text', label: 'CTA label' },
        imageUrl: { type: 'text', label: 'Image URL' },
        imageAlt: { type: 'text', label: 'Image alt' },
      },
      defaultProps: {
        eyebrow: 'Featured story',
        title: 'Light that stays',
        body: 'A recent session shaped by quiet rooms and soft windows.',
        ctaLabel: 'Explore the story',
        imageUrl: '',
        imageAlt: '',
      },
      render: (props) => <FeatureSplit {...props} />,
    },
    ServicesRow: {
      label: 'Services · Row',
      fields: {
        items: {
          type: 'array',
          label: 'Services',
          arrayFields: {
            icon: {
              type: 'select',
              label: 'Icon',
              options: [
                { label: 'Camera', value: 'camera' },
                { label: 'Clock', value: 'clock' },
                { label: 'Gallery', value: 'gallery' },
                { label: 'Secure', value: 'secure' },
              ],
            },
            title: { type: 'text', label: 'Title' },
            body: { type: 'text', label: 'Body' },
          },
          getItemSummary: (item, index = 0) => item.title || `Service ${index + 1}`,
          defaultItemProps: {
            icon: 'camera',
            title: 'Full-day coverage',
            body: '',
          },
        },
      },
      defaultProps: {
        items: [],
      },
      render: (props) => <ServicesRow {...props} />,
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
    GalleryGrid: {
      label: 'Gallery · Grid',
      fields: {
        title: { type: 'text', label: 'Title' },
        viewAllLabel: { type: 'text', label: 'View all label' },
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
        viewAllLabel: 'View all',
        images: [],
      },
      render: (props) => <GalleryGrid {...props} />,
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
    CustomSection: {
      label: 'Custom · AI',
      fields: {
        componentId: { type: 'text', label: 'Component id' },
        title: { type: 'text', label: 'Title' },
        body: { type: 'textarea', label: 'Body' },
        brand: { type: 'text', label: 'Brand' },
        tagline: { type: 'text', label: 'Tagline' },
        email: { type: 'text', label: 'Email' },
        ctaLabel: { type: 'text', label: 'CTA label' },
      },
      defaultProps: {
        componentId: 'custom.placeholder',
        title: '',
        body: '',
        brand: '',
        tagline: '',
        email: '',
        ctaLabel: '',
      },
      render: (props) => <CustomSectionHost {...props} />,
    },
  },
  categories: {
    sections: {
      title: 'Sections',
      components: [
        'NavCentered',
        'HeroEditorial',
        'HeroLayered',
        'About',
        'WorkCategories',
        'FeatureSplit',
        'ServicesRow',
        'GalleryMasonry',
        'GalleryGrid',
        'FooterMinimal',
        'CustomSection',
      ],
      defaultExpanded: true,
    },
  },
};
