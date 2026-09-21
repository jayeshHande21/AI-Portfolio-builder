/**
 * Editor history — undo/redo based on Blueprint snapshots + patch metadata.
 * Editor runtime concern — not stored inside the Portfolio Blueprint.
 */
import type { BlueprintPatch, PortfolioBlueprint } from '../../blueprint';

export type HistoryEntry = {
  id: string;
  label: string;
  before: PortfolioBlueprint;
  after: PortfolioBlueprint;
  patch?: BlueprintPatch;
  at: number;
};

export type HistoryState = {
  past: HistoryEntry[];
  future: HistoryEntry[];
};

export const MAX_HISTORY = 50;

export function createEmptyHistory(): HistoryState {
  return { past: [], future: [] };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}

function cloneBlueprint(blueprint: PortfolioBlueprint): PortfolioBlueprint {
  return structuredClone(blueprint);
}

export function createHistoryEntry(params: {
  before: PortfolioBlueprint;
  after: PortfolioBlueprint;
  label: string;
  patch?: BlueprintPatch;
}): HistoryEntry {
  return {
    id: `hist_${crypto.randomUUID()}`,
    label: params.label,
    before: cloneBlueprint(params.before),
    after: cloneBlueprint(params.after),
    patch: params.patch,
    at: Date.now(),
  };
}

/** Push a new entry; clears redo stack. */
export function pushHistoryEntry(
  history: HistoryState,
  entry: HistoryEntry,
  max = MAX_HISTORY,
): HistoryState {
  const past = [...history.past, entry];
  const trimmed =
    past.length > max ? past.slice(past.length - max) : past;
  return { past: trimmed, future: [] };
}

export function undoHistory(history: HistoryState): {
  history: HistoryState;
  blueprint: PortfolioBlueprint;
  entry: HistoryEntry;
} | null {
  if (history.past.length === 0) return null;
  const entry = history.past[history.past.length - 1]!;
  return {
    history: {
      past: history.past.slice(0, -1),
      future: [entry, ...history.future],
    },
    blueprint: cloneBlueprint(entry.before),
    entry,
  };
}

export function redoHistory(history: HistoryState): {
  history: HistoryState;
  blueprint: PortfolioBlueprint;
  entry: HistoryEntry;
} | null {
  if (history.future.length === 0) return null;
  const entry = history.future[0]!;
  return {
    history: {
      past: [...history.past, entry],
      future: history.future.slice(1),
    },
    blueprint: cloneBlueprint(entry.after),
    entry,
  };
}

export function blueprintsEqualForHistory(
  a: PortfolioBlueprint,
  b: PortfolioBlueprint,
): boolean {
  return (
    a.name === b.name &&
    JSON.stringify(a.sections) === JSON.stringify(b.sections) &&
    JSON.stringify(a.assets) === JSON.stringify(b.assets)
  );
}
