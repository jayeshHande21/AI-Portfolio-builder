/**
 * Editor commands produce Blueprint patches.
 * Manual UI and AI should both go through this layer.
 */
import type {
  BlueprintPatch,
  PortfolioBlueprint,
  SectionComponentId,
} from '../../blueprint';
import {
  addNodePatch,
  deleteNodePatch,
  reorderSectionRelative,
  updateNodePatch,
} from '../../blueprint';
import { isAboutComponentId } from '../../components/registry';

export function createFlipAboutLayoutPatch(
  blueprint: PortfolioBlueprint,
): BlueprintPatch | null {
  const about = blueprint.sections.find((s) =>
    isAboutComponentId(s.component),
  );
  if (!about || !isAboutComponentId(about.component)) {
    return null;
  }

  const component: SectionComponentId =
    about.component === 'about.image_left'
      ? 'about.image_right'
      : 'about.image_left';

  return updateNodePatch(about.id, { component });
}

export function createMoveSectionPatch(
  blueprint: PortfolioBlueprint,
  sectionId: string,
  direction: 'up' | 'down',
) {
  return reorderSectionRelative(blueprint, sectionId, direction);
}

export function createDeleteSectionPatch(sectionId: string): BlueprintPatch {
  return deleteNodePatch(sectionId);
}

export function createAddSectionPatch(
  node: Parameters<typeof addNodePatch>[0],
  index?: number,
): BlueprintPatch {
  return addNodePatch(node, { index });
}
