import type { ComponentType } from 'react';
import { AboutSection } from '../about';
import type { AboutSectionProps } from '../about';
import { FooterMinimal } from '../footer';
import { GalleryMasonry } from '../gallery';
import { HeroEditorial } from '../hero';
import type { SectionComponentId } from '../../blueprint';

type AnyProps = Record<string, unknown>;

/**
 * Maps Blueprint `component` ids → React implementations.
 * Extend as section families grow — keep Blueprint ids stable.
 */
export const componentRegistry: Record<
  SectionComponentId,
  ComponentType<AnyProps>
> = {
  'hero.editorial': HeroEditorial as ComponentType<AnyProps>,
  'about.image_left': AboutSection as ComponentType<AnyProps>,
  'about.image_right': AboutSection as ComponentType<AnyProps>,
  'gallery.masonry': GalleryMasonry as ComponentType<AnyProps>,
  'footer.minimal': FooterMinimal as ComponentType<AnyProps>,
};

export type RegistryComponentId = keyof typeof componentRegistry;

export function resolveComponent(
  componentId: string | undefined,
): ComponentType<AnyProps> | null {
  if (!componentId || !(componentId in componentRegistry)) {
    return null;
  }
  return componentRegistry[componentId as RegistryComponentId];
}

export function isAboutComponentId(
  componentId: string | undefined,
): componentId is 'about.image_left' | 'about.image_right' {
  return (
    componentId === 'about.image_left' || componentId === 'about.image_right'
  );
}

export function aboutLayoutFromComponentId(
  componentId: 'about.image_left' | 'about.image_right',
): AboutSectionProps['layout'] {
  return componentId === 'about.image_right' ? 'image_right' : 'image_left';
}

export function aboutComponentIdFromLayout(
  layout: AboutSectionProps['layout'],
): 'about.image_left' | 'about.image_right' {
  return layout === 'image_right' ? 'about.image_right' : 'about.image_left';
}
