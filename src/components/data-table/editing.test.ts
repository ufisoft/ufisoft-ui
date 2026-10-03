import { describe, expect, it } from 'vitest';
import { draftOf, parseEdit, sameValue, type DataTableCellEditor } from './editing';

const labels = {
  required: 'Required',
  invalidNumber: 'Enter a number',
  numberMin: (min: number) => `Min ${min}`,
  numberMax: (max: number) => `Max ${max}`,
};

const parse = (editor: DataTableCellEditor<{ id: number }>, draft: string | Date | null) =>
  parseEdit(editor, draft, { id: 1 }, labels);

describe('draftOf', () => {
  it('starts text editors from the value as text, and date editors from a date', () => {
    expect(draftOf({ type: 'text' }, 'Ada')).toBe('Ada');
    expect(draftOf({ type: 'number' }, 12.5)).toBe('12.5');
    expect(draftOf({ type: 'text' }, null)).toBe('');
    const day = new Date(2026, 2, 15);
    expect(draftOf({ type: 'date' }, day)).toBe(day);
    expect(draftOf({ type: 'date' }, '2026-03-15T00:00:00')).toEqual(day);
    expect(draftOf({ type: 'date' }, 'not a date')).toBeNull();
  });
});

describe('parseEdit', () => {
  it('keeps text as typed and checks required', () => {
    expect(parse({ type: 'text' }, ' Ada ')).toEqual({ value: ' Ada ' });
    expect(parse({ type: 'text', required: true }, '  ')).toEqual({ error: 'Required' });
    expect(parse({ type: 'text' }, '')).toEqual({ value: '' });
  });

  it('reads numbers with a decimal point or comma, empty as null, within bounds', () => {
    expect(parse({ type: 'number' }, '1,5')).toEqual({ value: 1.5 });
    expect(parse({ type: 'number' }, ' 42 ')).toEqual({ value: 42 });
    expect(parse({ type: 'number' }, '')).toEqual({ value: null });
    expect(parse({ type: 'number' }, 'abc')).toEqual({ error: 'Enter a number' });
    expect(parse({ type: 'number', min: 0 }, '-1')).toEqual({ error: 'Min 0' });
    expect(parse({ type: 'number', max: 10 }, '11')).toEqual({ error: 'Max 10' });
  });

  it('gives the chosen option or null, and a date or null', () => {
    const options = [{ value: 'a', label: 'A' }];
    expect(parse({ type: 'select', options }, 'a')).toEqual({ value: 'a' });
    expect(parse({ type: 'select', options }, '')).toEqual({ value: null });
    expect(parse({ type: 'select', options, required: true }, '')).toEqual({ error: 'Required' });
    const day = new Date(2026, 0, 2);
    expect(parse({ type: 'date' }, day)).toEqual({ value: day });
    expect(parse({ type: 'date', required: true }, null)).toEqual({ error: 'Required' });
  });

  it('runs the column’s validate with the parsed value and the row', () => {
    const editor: DataTableCellEditor<{ id: number }> = {
      type: 'number',
      validate: (value, row) => (value === row.id ? 'Not the id' : null),
    };
    expect(parse(editor, '1')).toEqual({ error: 'Not the id' });
    expect(parse(editor, '2')).toEqual({ value: 2 });
  });
});

describe('sameValue', () => {
  it('compares text, numbers, empty values and days', () => {
    expect(sameValue('a', 'a')).toBe(true);
    expect(sameValue(5, 5)).toBe(true);
    expect(sameValue(5, '5')).toBe(true);
    expect(sameValue('5', 5)).toBe(true);
    expect(sameValue(null, '')).toBe(true);
    expect(sameValue(undefined, null)).toBe(true);
    expect(sameValue('a', 'b')).toBe(false);
    expect(sameValue(new Date(2026, 0, 1), new Date(2026, 0, 1))).toBe(true);
    expect(sameValue(new Date(2026, 0, 1), null)).toBe(false);
  });
});
