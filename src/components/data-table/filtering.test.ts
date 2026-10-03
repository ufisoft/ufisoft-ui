import { describe, expect, it } from 'vitest';
import {
  filterRows,
  isActiveFilter,
  matchesFilter,
  normalizeText,
  sameFilters,
  withFilter,
  type DataTableFilters,
  type FilterableColumn,
} from './filtering';

interface Row {
  name: string;
  city: string | null;
  orders: number | null;
  joined: Date | string;
  tags: string[];
  verified: boolean;
}

const rows: Row[] = [
  {
    name: 'Çağla Yılmaz',
    city: 'İstanbul',
    orders: 12,
    joined: new Date(2026, 9, 3, 18, 30),
    tags: ['vip'],
    verified: true,
  },
  { name: 'Ali Kaya', city: 'Ankara', orders: 0, joined: '2026-01-15', tags: [], verified: false },
  {
    name: 'Irmak Demir',
    city: null,
    orders: null,
    joined: new Date(2025, 4, 1),
    tags: ['new', 'vip'],
    verified: true,
  },
];

const columns: FilterableColumn<Row>[] = [
  { id: 'name', value: (r) => r.name },
  { id: 'city', value: (r) => r.city },
  { id: 'orders', value: (r) => r.orders },
  { id: 'joined', value: (r) => r.joined },
  { id: 'tags', value: (r) => r.tags },
  { id: 'verified', value: (r) => r.verified, searchable: false },
];

const names = (filters: DataTableFilters, search = '') =>
  filterRows(rows, columns, filters, search, 'tr').map((r) => r.name);

describe('normalizeText', () => {
  it('ignores case, accents and the Turkish dotless i', () => {
    expect(normalizeText('Çağla Yılmaz', 'tr')).toBe('cagla yilmaz');
    expect(normalizeText('İSTANBUL', 'tr')).toBe('istanbul');
  });
});

describe('global search', () => {
  it('finds rows by any searchable column, forgiving accents and case', () => {
    expect(names({}, 'cagla')).toEqual(['Çağla Yılmaz']);
    expect(names({}, 'ISTANBUL')).toEqual(['Çağla Yılmaz']);
    expect(names({}, 'vip')).toEqual(['Çağla Yılmaz', 'Irmak Demir']);
    expect(names({}, '  ')).toHaveLength(3);
  });

  it('skips columns that are not searchable', () => {
    expect(names({}, 'true')).toEqual([]);
  });
});

describe('column filters', () => {
  it('text: contains, equals and starts with', () => {
    expect(names({ name: { type: 'text', operator: 'contains', value: 'kaya' } })).toEqual([
      'Ali Kaya',
    ]);
    expect(names({ city: { type: 'text', operator: 'equals', value: 'ankara' } })).toEqual([
      'Ali Kaya',
    ]);
    expect(names({ name: { type: 'text', operator: 'startsWith', value: 'ir' } })).toEqual([
      'Irmak Demir',
    ]);
  });

  it('number: inclusive bounds, rows without a number excluded', () => {
    expect(names({ orders: { type: 'number', min: 0, max: 12 } })).toEqual([
      'Çağla Yılmaz',
      'Ali Kaya',
    ]);
    expect(names({ orders: { type: 'number', min: 1, max: null } })).toEqual(['Çağla Yılmaz']);
    expect(names({ orders: { type: 'number', min: null, max: 0 } })).toEqual(['Ali Kaya']);
  });

  it('select: any of the values, also inside array values', () => {
    expect(names({ city: { type: 'select', values: ['Ankara', 'İstanbul'] } })).toEqual([
      'Çağla Yılmaz',
      'Ali Kaya',
    ]);
    expect(names({ tags: { type: 'select', values: ['new'] } })).toEqual(['Irmak Demir']);
  });

  it('date: whole days, Dates and date strings', () => {
    const oct3 = new Date(2026, 9, 3);
    expect(names({ joined: { type: 'date', from: oct3, to: oct3 } })).toEqual(['Çağla Yılmaz']);
    expect(names({ joined: { type: 'date', from: new Date(2026, 0, 1), to: null } })).toEqual([
      'Çağla Yılmaz',
      'Ali Kaya',
    ]);
    expect(names({ joined: { type: 'date', from: null, to: new Date(2025, 11, 31) } })).toEqual([
      'Irmak Demir',
    ]);
  });

  it('boolean', () => {
    expect(names({ verified: { type: 'boolean', value: false } })).toEqual(['Ali Kaya']);
  });

  it('combines filters and search: a row must pass all of them', () => {
    expect(
      names(
        { verified: { type: 'boolean', value: true }, tags: { type: 'select', values: ['vip'] } },
        'demir',
      ),
    ).toEqual(['Irmak Demir']);
  });

  it('ignores filters on unknown columns and inactive filters', () => {
    expect(names({ missing: { type: 'boolean', value: true } })).toHaveLength(3);
    expect(matchesFilter('x', { type: 'text', operator: 'contains', value: ' ' })).toBe(true);
  });
});

describe('filter helpers', () => {
  it('drops inactive filters when setting one', () => {
    const one = withFilter({}, 'name', { type: 'text', operator: 'contains', value: 'a' });
    expect(Object.keys(one)).toEqual(['name']);
    expect(withFilter(one, 'name', { type: 'text', operator: 'contains', value: '' })).toEqual({});
    expect(withFilter(one, 'name', null)).toEqual({});
    expect(isActiveFilter({ type: 'number', min: null, max: null })).toBe(false);
    expect(isActiveFilter({ type: 'boolean', value: false })).toBe(true);
  });

  it('compares filters by value', () => {
    const date = () => ({
      joined: { type: 'date' as const, from: new Date(2026, 0, 1), to: null },
    });
    expect(sameFilters(date(), date())).toBe(true);
    expect(sameFilters(date(), {})).toBe(false);
  });
});
