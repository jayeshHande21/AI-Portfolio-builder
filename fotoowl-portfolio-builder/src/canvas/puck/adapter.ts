/**
 * Adapter: Portfolio Blueprint ↔ Puck Data.
 *
 * Blueprint remains the source of truth.
 * Puck types/props are an editor projection — never leak into domain types.
 */
import type { Data } from '@puckeditor/core';
import type { BlueprintNode, PortfolioBlueprint } from '../../blueprint';
import {
  aboutComponentIdFromLayout,
  aboutLayoutFromComponentId,
  isAboutComponentId,
} from '../../components/registry';

/** Puck component type names (editor-only). */
export type PuckSectionType = 'HeroEditorial' | 'About' | 'GalleryMasonry' | 'FooterMinimal';

const COMPONENT_TO_PUCK: Record<string, PuckSectionType> = {
  'hero.editorial': 'HeroEditorial',
  'about.image_left': 'About',
  'about.image_right': 'About',
  'gallery.masonry': 'GalleryMasonry',
  'footer.minimal': 'FooterMinimal',
};

const PUCK_TO_COMPONENT: Record<PuckSectionType, string> = {
  HeroEditorial: 'hero.editorial',
  About: 'about.image_left', // refined by layout prop
  GalleryMasonry: 'gallery.masonry',
  FooterMinimal: 'footer.minimal',
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function sectionToPuckItem(section: BlueprintNode) {
  const componentId = section.component ?? '';
  const puckType = COMPONENT_TO_PUCK[componentId];

  if (!puckType) {
    throw new Error(`No Puck mapping for component "${componentId}"`);
  }

  const props = { ...asRecord(section.props) };

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
  const { id, layout, ...rest } = item.props;
  const puckType = item.type as PuckSectionType;

  let component = PUCK_TO_COMPONENT[puckType] ?? item.type;

  if (puckType === 'About') {
    const aboutLayout =
      layout === 'image_right' || layout === 'image_left'
        ? layout
        : 'image_left';
    component = aboutComponentIdFromLayout(aboutLayout);
  }

  const props: Record<string, unknown> = { ...rest };
  // layout is encoded in component id for About — keep out of props
  if (puckType === 'About') {
    delete props.layout;
  }

  return {
    id: typeof id === 'string' ? id : `${item.type}-${crypto.randomUUID()}`,
    type: 'section',
    component,
    props,
  };
}

/**
 * Convert Puck Data → Portfolio Blueprint, preserving assets / meta from previous Blueprint.
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
  return COMPONENT_TO_PUCK[componentId];
}
