import { describe, expect, it } from 'vitest';
import {
  dropAt,
  dropIndex,
  moveItem,
  prefixOffsets,
  renderedRows,
  rowAt,
  rowRange,
} from './virtual';

const offsets = prefixOffsets([10, 20, 30, 40]);

describe('prefixOffsets', () => {
  it('gives each row’s start and the total at the end', () => {
    expect(offsets).toEqual([0, 10, 30, 60, 100]);
    expect(prefixOffsets([])).toEqual([0]);
  });
});

describe('rowAt', () => {
  it('finds the row that holds a height', () => {
    expect(rowAt(offsets, 0)).toBe(0);
    expect(rowAt(offsets, 29)).toBe(1);
    expect(rowAt(offsets, 30)).toBe(2);
    expect(rowAt(offsets, 500)).toBe(3);
    expect(rowAt([0], 10)).toBe(0);
  });
});

describe('rowRange', () => {
  it('covers the view plus overscan, within the rows', () => {
    expect(rowRange(offsets, 15, 20, 0)).toEqual([1, 3]);
    expect(rowRange(offsets, 15, 20, 1)).toEqual([0, 4]);
    expect(rowRange(offsets, -50, 5, 0)).toEqual([0, 1]);
    expect(rowRange([0], 0, 100, 2)).toEqual([0, 0]);
  });

  it('handles 10,000 rows', () => {
    const many = prefixOffsets(Array.from({ length: 10_000 }, () => 40));
    expect(rowRange(many, 200_000, 400, 2)).toEqual([4998, 5013]);
  });
});

describe('renderedRows', () => {
  it('adds rows to keep, in order and without duplicates', () => {
    expect(renderedRows(100, [10, 13], [2, 11, 200, -1])).toEqual([2, 10, 11, 12]);
    expect(renderedRows(5, [3, 10], [])).toEqual([3, 4]);
  });
});

describe('dropIndex and dropAt', () => {
  it('gives the index a dropped row ends up at', () => {
    expect(dropIndex(0, 3, 'before')).toBe(2);
    expect(dropIndex(0, 3, 'after')).toBe(3);
    expect(dropIndex(4, 1, 'before')).toBe(1);
    expect(dropIndex(4, 1, 'after')).toBe(2);
  });

  it('turns a keyboard position into a drop', () => {
    expect(dropAt(2, 2)).toBeNull();
    expect(dropAt(2, 0)).toEqual({ target: 0, position: 'before' });
    expect(dropAt(2, 4)).toEqual({ target: 4, position: 'after' });
    // The drop lands the row exactly at the position.
    const drop = dropAt(1, 3) as { target: number; position: 'after' };
    expect(dropIndex(1, drop.target, drop.position)).toBe(3);
  });
});

describe('moveItem', () => {
  it('moves one item and leaves the input alone', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(moveItem(items, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(items, 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(moveItem(items, 9, 0)).toEqual(items);
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });
});
