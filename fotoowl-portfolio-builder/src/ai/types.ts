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

/** Portfolio-scoped AI (Phase 9) — entire Blueprint, not one section. */
export interface PortfolioAiRequest {
  scope: 'portfolio';
  prompt: string;
  /** Current Blueprint snapshot (sections + tokens + theme). */
  blueprint: PortfolioBlueprint;
}

export interface PortfolioAiResponse {
  ok: true;
  summary: string;
  patches: BlueprintPatch[];
  /**
   * When set, client clones this theme first, then applies patches.
   * Section IDs in patches must match the chosen theme (hero_01, …).
   */
  themeId?: string;
  source: 'local' | 'remote';
}

export interface PortfolioAiError {
  ok: false;
  error: string;
  source?: 'local' | 'remote';
}

export type PortfolioAiResult = PortfolioAiResponse | PortfolioAiError;
