import { describe, expect, it } from 'vitest';
import { validateBlueprint } from '../../blueprint';
import { createPortfolioFromTheme, theme01 } from '../../themes/theme-01';
import {
  canRedo,
  canUndo,
  createEmptyHistory,
  createHistoryEntry,
  pushHistoryEntry,
  redoHistory,
  undoHistory,
} from './index';

function bp(name: string) {
  const draft = validateBlueprint(createPortfolioFromTheme(theme01));
  return { ...draft, name };
}

describe('editor history', () => {
  it('starts empty', () => {
    const history = createEmptyHistory();
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(false);
  });

  it('undo restores previous blueprint and enables redo', () => {
    const before = bp('Before');
    const after = bp('After');
    let history = createEmptyHistory();
    history = pushHistoryEntry(
      history,
      createHistoryEntry({
        before,
        after,
        label: 'Rename',
      }),
    );

    expect(canUndo(history)).toBe(true);
    const undone = undoHistory(history);
    expect(undone).not.toBeNull();
    expect(undone!.blueprint.name).toBe('Before');
    expect(canRedo(undone!.history)).toBe(true);
    expect(canUndo(undone!.history)).toBe(false);

    const redone = redoHistory(undone!.history);
    expect(redone).not.toBeNull();
    expect(redone!.blueprint.name).toBe('After');
    expect(canUndo(redone!.history)).toBe(true);
    expect(canRedo(redone!.history)).toBe(false);
  });

  it('pushing a new entry clears the redo stack', () => {
    const a = bp('A');
    const b = bp('B');
    const c = bp('C');

    let history = pushHistoryEntry(
      createEmptyHistory(),
      createHistoryEntry({ before: a, after: b, label: 'A→B' }),
    );
    const undone = undoHistory(history)!;
    history = undone.history;

    history = pushHistoryEntry(
      history,
      createHistoryEntry({ before: a, after: c, label: 'A→C' }),
    );

    expect(canRedo(history)).toBe(false);
    expect(history.past).toHaveLength(1);
    expect(history.past[0]?.label).toBe('A→C');
  });
});
