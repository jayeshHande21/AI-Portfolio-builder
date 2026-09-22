import type { ComponentType } from 'react';
import { AboutSection } from '../about';
import type { AboutSectionProps } from '../about';
import { getRuntimeCustomComponent } from '../custom';
import { isCustomComponentId } from '../custom';
import { FeatureSplit } from '../feature';
import { FooterMinimal } from '../footer';
import { GalleryGrid, GalleryMasonry } from '../gallery';
import { HeroEditorial, HeroLayered } from '../hero';
import { NavCentered } from '../nav';
import { ServicesRow } from '../services';
import { WorkCategories } from '../work';
import type { SectionComponentId } from '../../blueprint';

type AnyProps = Record<string, unknown>;

/**
 * Maps Blueprint `component` ids → React implementations.
 * Built-ins are static; `custom.*` resolves from the V2 runtime registry.
 */
export const componentRegistry: Record<
  Exclude<SectionComponentId, `custom.${string}`>,
  ComponentType<AnyProps>
> = {
  'hero.editorial': HeroEditorial as ComponentType<AnyProps>,
  'hero.layered': HeroLayered as ComponentType<AnyProps>,
  'nav.centered': NavCentered as ComponentType<AnyProps>,
  'about.image_left': AboutSection as ComponentType<AnyProps>,
  'about.image_right': AboutSection as ComponentType<AnyProps>,
  'work.categories': WorkCategories as ComponentType<AnyProps>,
  'feature.split': FeatureSplit as ComponentType<AnyProps>,
  'services.row': ServicesRow as ComponentType<AnyProps>,
  'gallery.masonry': GalleryMasonry as ComponentType<AnyProps>,
  'gallery.grid': GalleryGrid as ComponentType<AnyProps>,
  'footer.minimal': FooterMinimal as ComponentType<AnyProps>,
};

export type BuiltinRegistryComponentId = keyof typeof componentRegistry;

export function resolveComponent(
  componentId: string | undefined,
): ComponentType<AnyProps> | null {
  if (!componentId) return null;
  if (isCustomComponentId(componentId)) {
    return getRuntimeCustomComponent(componentId);
  }
  if (componentId in componentRegistry) {
    return componentRegistry[componentId as BuiltinRegistryComponentId];
  }
  return null;
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
