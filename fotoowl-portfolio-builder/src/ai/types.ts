/**
 * AI request/response types.
 * Independent of Puck and of any specific model vendor.
 */
import type { BlueprintNode, BlueprintPatch, PortfolioBlueprint } from '../blueprint';

export type AiScope = 'section' | 'portfolio';

export interface SectionAiRequest {
  scope: 'section';
  prompt: string;
  sectionId: string;
  section: BlueprintNode;
  /** Minimal portfolio context (name/theme only — not full tree unless needed). */
  portfolio: {
    id: string;
    name: string;
    themeId?: string;
  };
}

export interface SectionAiResponse {
  ok: true;
  summary: string;
  patches: BlueprintPatch[];
  /** Where the patches were produced (local planner vs remote API). */
  source: 'local' | 'remote';
}

export interface SectionAiError {
  ok: false;
  error: string;
  source?: 'local' | 'remote';
}

export type SectionAiResult = SectionAiResponse | SectionAiError;

export interface SectionAiContext {
  blueprint: PortfolioBlueprint;
  sectionId: string;
  prompt: string;
}
