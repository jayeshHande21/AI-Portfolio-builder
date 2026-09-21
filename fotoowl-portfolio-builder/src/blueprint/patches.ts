/**
 * Structured patch operations applied to the Portfolio Blueprint.
 * Manual edits and AI edits must both use this system (Phase 5 expands fully).
 */
import type { BlueprintNode, PortfolioBlueprint, SectionComponentId } from './types';

export type PatchOp = 'add' | 'update' | 'delete' | 'move' | 'reorder' | 'replace';

export interface BlueprintPatch {
  op: PatchOp;
  path: string;
  value?: unknown;
}

/** Update a section's registered component id (e.g. about.image_left → about.image_right). */
export function updateSectionComponent(
  blueprint: PortfolioBlueprint,
  sectionId: string,
  component: SectionComponentId,
): PortfolioBlueprint {
  return {
    ...blueprint,
    sections: blueprint.sections.map((section) =>
      section.id === sectionId ? { ...section, component } : section,
    ),
  };
}

/** Shallow-merge props onto a section node. */
export function updateSectionProps(
  blueprint: PortfolioBlueprint,
  sectionId: string,
  props: Record<string, unknown>,
): PortfolioBlueprint {
  return {
    ...blueprint,
    sections: blueprint.sections.map((section) =>
      section.id === sectionId
        ? { ...section, props: { ...section.props, ...props } }
        : section,
    ),
  };
}

export function findSection(
  blueprint: PortfolioBlueprint,
  sectionId: string,
): BlueprintNode | undefined {
  return blueprint.sections.find((s) => s.id === sectionId);
}

/** Placeholder for the full patch engine (Phase 5). */
export function applyPatch(
  _blueprint: PortfolioBlueprint,
  _patch: BlueprintPatch,
): PortfolioBlueprint {
  throw new Error('applyPatch not implemented yet — use typed helpers for POC');
}
