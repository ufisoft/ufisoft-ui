import { describe, expect, it } from 'vitest';
import {
  clampWidth,
  defaultColumnState,
  displayOrder,
  layoutColumns,
  moveColumn,
  normalizeColumnState,
  parseColumnState,
  setHidden,
  setPinned,
  setWidth,
  stepColumn,
  type DataTableColumnState,
} from './columns';

const base = defaultColumnState([
  { id: 'a' },
  { id: 'b', hidden: true },
  { id: 'c', pinned: 'end' },
]);

describe('defaultColumnState', () => {
  it('takes order, hidden and pinned from the definitions', () => {
    expect(base).toEqual({
      order: ['a', 'b', 'c'],
      hidden: ['b'],
      widths: {},
      pinned: { c: 'end' },
    });
  });
});

describe('normalizeColumnState', () => {
  it('drops unknown ids, adds new columns at the end and fills missing parts', () => {
    expect(
      normalizeColumnState({ order: ['c', 'x', 'a'], widths: { a: 120, x: 50, c: -1 } }, base),
    ).toEqual({ order: ['c', 'a', 'b'], hidden: ['b'], widths: { a: 120 }, pinned: { c: 'end' } });
  });

  it('drops invalid pins', () => {
    const state = normalizeColumnState({ pinned: { a: 'middle' as 'start' } }, base);
    expect(state.pinned).toEqual({});
  });
});

describe('parseColumnState', () => {
  it('reads valid parts and ignores the rest', () => {
    expect(parseColumnState('{"order":["a"],"hidden":"b","widths":{"a":90}}')).toEqual({
      order: ['a'],
      widths: { a: 90 },
    });
  });

  it('gives undefined for nothing or broken JSON', () => {
    expect(parseColumnState(null)).toBeUndefined();
    expect(parseColumnState('{')).toBeUndefined();
    expect(parseColumnState('3')).toBeUndefined();
  });
});

const state: DataTableColumnState = {
  order: ['a', 'b', 'c', 'd', 'e'],
  hidden: [],
  widths: {},
  pinned: { d: 'start', b: 'end' },
};

describe('displayOrder', () => {
  it('puts start-pinned columns first and end-pinned last', () => {
    expect(displayOrder(state)).toEqual(['d', 'a', 'c', 'e', 'b']);
  });
});

describe('moveColumn and stepColumn', () => {
  it('moves before or after a column of the same group', () => {
    expect(moveColumn(state, 'e', 'a', 'before').order).toEqual(['e', 'a', 'b', 'c', 'd']);
    expect(moveColumn(state, 'a', 'e', 'after').order).toEqual(['b', 'c', 'd', 'e', 'a']);
  });

  it('does not move across pinned groups', () => {
    expect(moveColumn(state, 'a', 'd', 'before')).toBe(state);
  });

  it('steps within the group as displayed, and stops at its ends', () => {
    expect(displayOrder(stepColumn(state, 'c', -1))).toEqual(['d', 'c', 'a', 'e', 'b']);
    expect(stepColumn(state, 'a', -1)).toBe(state);
    expect(stepColumn(state, 'e', 1)).toBe(state);
  });
});

describe('setPinned, setHidden and setWidth', () => {
  it('pins, unpins, hides, shows and sizes', () => {
    expect(setPinned(state, 'a', 'start').pinned).toEqual({ d: 'start', b: 'end', a: 'start' });
    expect(setPinned(state, 'd', null).pinned).toEqual({ b: 'end' });
    expect(setHidden(state, 'a', true).hidden).toEqual(['a']);
    expect(setHidden(setHidden(state, 'a', true), 'a', false).hidden).toEqual([]);
    expect(setWidth(state, 'a', 120.6).widths).toEqual({ a: 121 });
    expect(setWidth(setWidth(state, 'a', 120), 'a', null).widths).toEqual({});
  });

  it('clamps widths to the limits', () => {
    expect(clampWidth(20, 48, 400)).toBe(48);
    expect(clampWidth(500, 48, 400)).toBe(400);
  });
});

describe('layoutColumns', () => {
  it('adds up sticky offsets from each side and marks the edges', () => {
    const slots = layoutColumns(
      { ...state, pinned: { a: 'start', b: 'start', e: 'end' }, hidden: ['c'] },
      (id) => ({ a: 100, b: 50, e: 80 })[id],
      2,
      1,
    );
    expect(slots).toEqual([
      { id: 'a', pinned: 'start', width: 100, offset: 0, controls: 2, edge: false },
      { id: 'b', pinned: 'start', width: 50, offset: 100, controls: 2, edge: true },
      { id: 'd', pinned: null, width: undefined, offset: 0, controls: 0, edge: false },
      { id: 'e', pinned: 'end', width: 80, offset: 0, controls: 1, edge: true },
    ]);
  });
});
