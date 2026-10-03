import { describe, expect, it } from 'vitest';
import { nextSort, sameSort, sortRows, type DataTableSort, type SortableColumn } from './sorting';

interface Row {
  name: string | null;
  age: number | null;
  joined: Date;
  active: boolean;
}

const rows: Row[] = [
  { name: 'Zeynep', age: 31, joined: new Date(2024, 0, 5), active: true },
  { name: 'ali', age: 25, joined: new Date(2023, 5, 1), active: false },
  { name: 'Çağla', age: null, joined: new Date(2025, 2, 9), active: true },
  { name: 'Bora', age: 25, joined: new Date(2022, 8, 3), active: false },
  { name: null, age: 40, joined: new Date(2021, 1, 1), active: true },
];

const columns: SortableColumn<Row>[] = [
  { id: 'name', value: (r) => r.name },
  { id: 'age', value: (r) => r.age },
  { id: 'joined', value: (r) => r.joined },
  { id: 'active', value: (r) => r.active },
  { id: 'nameLength', compare: (a, b) => (a.name?.length ?? 0) - (b.name?.length ?? 0) },
];

const tr = new Intl.Collator('tr', { numeric: true });
const sorted = (sort: DataTableSort[], collator = tr) =>
  sortRows(rows, sort, columns, collator).map((r) => r.name);

describe('sortRows', () => {
  it('keeps the original order without a sort', () => {
    expect(sorted([])).toEqual(['Zeynep', 'ali', 'Çağla', 'Bora', null]);
  });

  it('sorts text with the locale’s collation, case-insensitively, empties last', () => {
    expect(sorted([{ columnId: 'name', direction: 'asc' }])).toEqual([
      'ali',
      'Bora',
      'Çağla',
      'Zeynep',
      null,
    ]);
    expect(sorted([{ columnId: 'name', direction: 'desc' }])).toEqual([
      'Zeynep',
      'Çağla',
      'Bora',
      'ali',
      null,
    ]);
  });

  it('sorts numbers, dates and booleans by value', () => {
    expect(sorted([{ columnId: 'age', direction: 'asc' }])).toEqual([
      'ali',
      'Bora',
      'Zeynep',
      null,
      'Çağla',
    ]);
    expect(sorted([{ columnId: 'joined', direction: 'desc' }])).toEqual([
      'Çağla',
      'Zeynep',
      'ali',
      'Bora',
      null,
    ]);
    expect(sorted([{ columnId: 'active', direction: 'asc' }])).toEqual([
      'ali',
      'Bora',
      'Zeynep',
      'Çağla',
      null,
    ]);
  });

  it('applies secondary sorts to ties and keeps equal rows stable', () => {
    expect(
      sorted([
        { columnId: 'age', direction: 'asc' },
        { columnId: 'name', direction: 'desc' },
      ]),
    ).toEqual(['Bora', 'ali', 'Zeynep', null, 'Çağla']);
  });

  it('uses a column’s compare function', () => {
    expect(sorted([{ columnId: 'nameLength', direction: 'desc' }])).toEqual([
      'Zeynep',
      'Çağla',
      'Bora',
      'ali',
      null,
    ]);
  });

  it('ignores sorts on unknown columns', () => {
    expect(sorted([{ columnId: 'missing', direction: 'asc' }])).toEqual(sorted([]));
  });

  it('does not change the input array', () => {
    const copy = [...rows];
    sortRows(rows, [{ columnId: 'name', direction: 'asc' }], columns, tr);
    expect(rows).toEqual(copy);
  });
});

describe('nextSort', () => {
  it('cycles a column: unsorted → asc → desc → unsorted', () => {
    const asc = nextSort([], 'name', false);
    expect(asc).toEqual([{ columnId: 'name', direction: 'asc' }]);
    const desc = nextSort(asc, 'name', false);
    expect(desc).toEqual([{ columnId: 'name', direction: 'desc' }]);
    expect(nextSort(desc, 'name', false)).toEqual([]);
  });

  it('replaces other sorts without multi', () => {
    expect(
      nextSort(
        [
          { columnId: 'name', direction: 'asc' },
          { columnId: 'age', direction: 'desc' },
        ],
        'joined',
        false,
      ),
    ).toEqual([{ columnId: 'joined', direction: 'asc' }]);
  });

  it('adds, toggles and removes a column with multi, keeping the others', () => {
    const one: DataTableSort[] = [{ columnId: 'name', direction: 'asc' }];
    const two = nextSort(one, 'age', true);
    expect(two).toEqual([
      { columnId: 'name', direction: 'asc' },
      { columnId: 'age', direction: 'asc' },
    ]);
    const toggled = nextSort(two, 'name', true);
    expect(toggled).toEqual([
      { columnId: 'name', direction: 'desc' },
      { columnId: 'age', direction: 'asc' },
    ]);
    expect(nextSort(toggled, 'name', true)).toEqual([{ columnId: 'age', direction: 'asc' }]);
  });
});

describe('sameSort', () => {
  it('compares column, direction and priority', () => {
    const a: DataTableSort[] = [{ columnId: 'name', direction: 'asc' }];
    expect(sameSort(a, [{ columnId: 'name', direction: 'asc' }])).toBe(true);
    expect(sameSort(a, [{ columnId: 'name', direction: 'desc' }])).toBe(false);
    expect(sameSort(a, [])).toBe(false);
  });
});
