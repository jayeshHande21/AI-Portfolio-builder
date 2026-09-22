/**
 * Adapter: Portfolio Blueprint ↔ Puck Data.
 *
 * Blueprint remains the source of truth.
 * Puck types/props are an editor projection — never leak into domain types.
 */
import type { Data } from '@puckeditor/core';
import type {
  BlueprintNode,
  NodeStyles,
  PortfolioBlueprint,
} from '../../blueprint';
import { isCustomComponentId } from '../../components/custom';
import {
  aboutComponentIdFromLayout,
  aboutLayoutFromComponentId,
  isAboutComponentId,
} from '../../components/registry';
import { FO_STYLES_PROP } from './styleProp';

/** Puck component type names (editor-only). */
export type PuckSectionType =
  | 'HeroEditorial'
  | 'HeroLayered'
  | 'NavCentered'
  | 'About'
  | 'WorkCategories'
  | 'FeatureSplit'
  | 'ServicesRow'
  | 'GalleryMasonry'
  | 'GalleryGrid'
  | 'FooterMinimal'
  | 'CustomSection';

const COMPONENT_TO_PUCK: Record<string, PuckSectionType> = {
  'hero.editorial': 'HeroEditorial',
  'hero.layered': 'HeroLayered',
  'nav.centered': 'NavCentered',
  'about.image_left': 'About',
  'about.image_right': 'About',
  'work.categories': 'WorkCategories',
  'feature.split': 'FeatureSplit',
  'services.row': 'ServicesRow',
  'gallery.masonry': 'GalleryMasonry',
  'gallery.grid': 'GalleryGrid',
  'footer.minimal': 'FooterMinimal',
};

const PUCK_TO_COMPONENT: Record<Exclude<PuckSectionType, 'CustomSection'>, string> =
  {
    HeroEditorial: 'hero.editorial',
    HeroLayered: 'hero.layered',
    NavCentered: 'nav.centered',
    About: 'about.image_left', // refined by layout prop
    WorkCategories: 'work.categories',
    FeatureSplit: 'feature.split',
    ServicesRow: 'services.row',
    GalleryMasonry: 'gallery.masonry',
    GalleryGrid: 'gallery.grid',
    FooterMinimal: 'footer.minimal',
  };

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNodeStyles(value: unknown): NodeStyles | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  return value as NodeStyles;
}

function sectionToPuckItem(section: BlueprintNode) {
  const componentId = section.component ?? '';
  const props = { ...asRecord(section.props) };

  if (section.styles) {
    props[FO_STYLES_PROP] = section.styles;
  }

  if (isCustomComponentId(componentId)) {
    return {
      type: 'CustomSection' as const,
      props: {
        ...props,
        componentId,
        id: section.id,
      },
    };
  }

  const puckType = COMPONENT_TO_PUCK[componentId];
  if (!puckType) {
    throw new Error(`No Puck mapping for component "${componentId}"`);
  }

  if (isAboutComponentId(componentId)) {
    props.layout = aboutLayoutFromComponentId(componentId);
  }

  return {
    type: puckType,
    props: {
      ...props,
      id: section.id,
    },
  };
}

/**
 * Convert Portfolio Blueprint → Puck Data for the editor.
 */
export function blueprintToPuckData(blueprint: PortfolioBlueprint): Data {
  return {
    root: {
      props: {
        title: blueprint.name,
      },
    },
    content: blueprint.sections.map(sectionToPuckItem),
    zones: {},
  };
}

function puckItemToSection(item: {
  type: string;
  props: Record<string, unknown>;
}): BlueprintNode {
  const {
    id,
    layout,
    componentId: customComponentId,
    [FO_STYLES_PROP]: foStyles,
    ...rest
  } = item.props;
  const puckType = item.type as PuckSectionType;

  let component: string;
  const props: Record<string, unknown> = { ...rest };

  if (puckType === 'CustomSection') {
    component =
      typeof customComponentId === 'string'
        ? customComponentId
        : 'custom.unknown';
  } else {
    component = PUCK_TO_COMPONENT[puckType] ?? item.type;
    if (puckType === 'About') {
      const aboutLayout =
        layout === 'image_right' || layout === 'image_left'
          ? layout
          : 'image_left';
      component = aboutComponentIdFromLayout(aboutLayout);
      delete props.layout;
    }
  }

  const styles = asNodeStyles(foStyles);

  return {
    id: typeof id === 'string' ? id : `${item.type}-${crypto.randomUUID()}`,
    type: 'section',
    component,
    props,
    ...(styles ? { styles } : {}),
  };
}

/**
 * Convert Puck Data → Portfolio Blueprint, preserving assets / meta / customs.
 */
export function puckDataToBlueprint(
  data: Data,
  previous: PortfolioBlueprint,
): PortfolioBlueprint {
  const rootProps = asRecord(data.root?.props);
  const content = Array.isArray(data.content) ? data.content : [];

  return {
    id: previous.id,
    name:
      typeof rootProps.title === 'string' && rootProps.title.length > 0
        ? rootProps.title
        : previous.name,
    themeId: previous.themeId,
    tokens: previous.tokens,
    assets: previous.assets,
    customComponents: previous.customComponents,
    sections: content.map((item) =>
      puckItemToSection({
        type: item.type,
        props: asRecord(item.props),
      }),
    ),
  };
}

export function getPuckTypeForComponent(
  componentId: string,
): PuckSectionType | undefined {
  if (isCustomComponentId(componentId)) return 'CustomSection';
  return COMPONENT_TO_PUCK[componentId];
}
