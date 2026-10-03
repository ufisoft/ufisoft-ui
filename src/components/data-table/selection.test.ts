import { describe, expect, it } from 'vitest';
import {
  emptySelection,
  isSelected,
  pageSelection,
  sameSelection,
  togglePage,
  toggleRow,
} from './selection';

const some = { ids: ['1', '2'], allMatching: false };

describe('pageSelection', () => {
  it('is none, some or all of the page', () => {
    expect(pageSelection(emptySelection, ['1', '2'])).toBe('none');
    expect(pageSelection(some, ['2', '3'])).toBe('some');
    expect(pageSelection(some, ['1', '2'])).toBe('all');
  });

  it('is none for an empty page and all while every result is selected', () => {
    expect(pageSelection(some, [])).toBe('none');
    expect(pageSelection({ ids: [], allMatching: true }, ['7'])).toBe('all');
  });
});

describe('isSelected', () => {
  it('is true for listed ids, or for any id while every result is selected', () => {
    expect(isSelected(some, '1')).toBe(true);
    expect(isSelected(some, '3')).toBe(false);
    expect(isSelected({ ids: [], allMatching: true }, '3')).toBe(true);
  });
});

describe('toggleRow', () => {
  it('adds and removes an id', () => {
    expect(toggleRow(some, '3', true, [])).toEqual({ ids: ['1', '2', '3'], allMatching: false });
    expect(toggleRow(some, '1', false, [])).toEqual({ ids: ['2'], allMatching: false });
  });

  it('returns the same selection when the row is already selected', () => {
    expect(toggleRow(some, '1', true, [])).toBe(some);
  });

  it('ends “all results” when a row is cleared, keeping the rest of the page', () => {
    expect(toggleRow({ ids: ['1'], allMatching: true }, '2', false, ['1', '2', '3'])).toEqual({
      ids: ['1', '3'],
      allMatching: false,
    });
  });
});

describe('togglePage', () => {
  it('adds the page to the selection without duplicates', () => {
    expect(togglePage(some, ['2', '3'], true)).toEqual({
      ids: ['1', '2', '3'],
      allMatching: false,
    });
  });

  it('clears only the page, and ends “all results”', () => {
    expect(togglePage({ ids: ['1', '2', '5'], allMatching: true }, ['1', '2'], false)).toEqual({
      ids: ['5'],
      allMatching: false,
    });
  });
});

describe('sameSelection', () => {
  it('compares ids in order and allMatching', () => {
    expect(sameSelection(some, { ids: ['1', '2'], allMatching: false })).toBe(true);
    expect(sameSelection(some, { ids: ['2', '1'], allMatching: false })).toBe(false);
    expect(sameSelection(some, { ids: ['1', '2'], allMatching: true })).toBe(false);
  });
});
