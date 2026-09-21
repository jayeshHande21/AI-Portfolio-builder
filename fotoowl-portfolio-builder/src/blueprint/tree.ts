/**
 * Blueprint tree helpers — locate nodes by stable ID (not array index).
 */
import type { BlueprintNode, PortfolioBlueprint } from './types';

export const ROOT_SECTIONS_PARENT = null;

export interface NodeLocation {
  node: BlueprintNode;
  parentId: string | null;
  index: number;
  siblings: BlueprintNode[];
}

function walk(
  nodes: BlueprintNode[],
  parentId: string | null,
  targetId: string,
): NodeLocation | undefined {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) continue;
    if (node.id === targetId) {
      return { node, parentId, index, siblings: nodes };
    }
    if (node.children?.length) {
      const found = walk(node.children, node.id, targetId);
      if (found) return found;
    }
  }
  return undefined;
}

export function findNodeLocation(
  blueprint: PortfolioBlueprint,
  targetId: string,
): NodeLocation | undefined {
  return walk(blueprint.sections, ROOT_SECTIONS_PARENT, targetId);
}

export function findNodeById(
  blueprint: PortfolioBlueprint,
  targetId: string,
): BlueprintNode | undefined {
  return findNodeLocation(blueprint, targetId)?.node;
}

export function collectNodeIds(nodes: BlueprintNode[]): Set<string> {
  const ids = new Set<string>();
  const visit = (list: BlueprintNode[]) => {
    for (const node of list) {
      ids.add(node.id);
      if (node.children?.length) visit(node.children);
    }
  };
  visit(nodes);
  return ids;
}

export function collectSubtreeIds(node: BlueprintNode): Set<string> {
  return collectNodeIds([node]);
}

/** Immutable update of a sibling list under a parent (null = root sections). */
export function mapChildren(
  blueprint: PortfolioBlueprint,
  parentId: string | null,
  mapper: (children: BlueprintNode[]) => BlueprintNode[],
): PortfolioBlueprint {
  if (parentId === ROOT_SECTIONS_PARENT) {
    return { ...blueprint, sections: mapper(blueprint.sections) };
  }

  const updateNode = (node: BlueprintNode): BlueprintNode => {
    if (node.id === parentId) {
      return { ...node, children: mapper(node.children ?? []) };
    }
    if (!node.children?.length) return node;
    return { ...node, children: node.children.map(updateNode) };
  };

  return {
    ...blueprint,
    sections: blueprint.sections.map(updateNode),
  };
}

export function getChildren(
  blueprint: PortfolioBlueprint,
  parentId: string | null,
): BlueprintNode[] {
  if (parentId === ROOT_SECTIONS_PARENT) {
    return blueprint.sections;
  }
  const parent = findNodeById(blueprint, parentId);
  return parent?.children ?? [];
}

export function assertParentExists(
  blueprint: PortfolioBlueprint,
  parentId: string | null,
): string | null {
  if (parentId === ROOT_SECTIONS_PARENT) return null;
  if (!findNodeById(blueprint, parentId)) {
    return `Parent node "${parentId}" not found`;
  }
  return null;
}
