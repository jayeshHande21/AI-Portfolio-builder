/**
 * Portfolio Blueprint TypeScript types.
 * Single source of truth for portfolio structure — independent of Puck / AI / S3.
 */

export type NodeId = string;

export type NodeType =
  | 'section'
  | 'container'
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'component';

/** Placeholder — full Blueprint node model lands in Phase 2. */
export interface BlueprintNode {
  id: NodeId;
  type: NodeType;
  component?: string;
  props?: Record<string, unknown>;
  children?: BlueprintNode[];
}

export interface PortfolioBlueprint {
  id: string;
  name: string;
  sections: BlueprintNode[];
}
