import { describe, expect, it } from 'vitest';
import { aggregate, flattenGroups, groupRows } from './grouping';
import { toCsv } from './csv';
import { parseViews, saveView, type DataTableView } from './views';

interface Row {
  name: string;
  role: string | null;
  team: string;
  orders: number;
}

const rows: Row[] = [
  { name: 'Ada', role: 'Editor', team: 'A', orders: 5 },
  { name: 'Bora', role: 'Admin', team: 'B', orders: 10 },
  { name: 'Ceren', role: 'Editor', team: 'B', orders: 1 },
  { name: 'Deniz', role: null, team: 'A', orders: 4 },
];
const columns = [
  { id: 'role', value: (row: Row) => row.role },
  { id: 'team', value: (row: Row) => row.team },
];
const collator = new Intl.Collator('en');

describe('groupRows', () => {
  it('groups by value, sorted, with empty values last and rows in their order', () => {
    const groups = groupRows(rows, ['role'], columns, () => undefined, collator);
    expect(groups.map((group) => [group.key, group.rows.map((row) => row.name)])).toEqual([
      ['role:Admin', ['Bora']],
      ['role:Editor', ['Ada', 'Ceren']],
      ['role:', ['Deniz']],
    ]);
  });

  it('orders groups descending when the table sorts the column that way', () => {
    const groups = groupRows(rows, ['role'], columns, () => 'desc', collator);
    expect(groups.map((group) => group.value)).toEqual(['Editor', 'Admin', null]);
  });

  it('nests groups with path keys', () => {
    const [, editor] = groupRows(rows, ['role', 'team'], columns, () => undefined, collator);
    expect(editor?.children?.map((group) => [group.key, group.depth])).toEqual([
      ['role:Editor/team:A', 1],
      ['role:Editor/team:B', 1],
    ]);
  });

  it('groups dates by day', () => {
    const dated = [{ at: new Date(2026, 0, 1, 9) }, { at: new Date(2026, 0, 1, 17) }];
    const groups = groupRows(
      dated,
      ['at'],
      [{ id: 'at', value: (row) => row.at }],
      () => undefined,
      collator,
    );
    expect(groups).toHaveLength(1);
  });
});

describe('flattenGroups', () => {
  it('lists group rows and the rows of open groups only', () => {
    const groups = groupRows(rows, ['role', 'team'], columns, () => undefined, collator);
    const items = flattenGroups(groups, new Set(['role:Editor/team:B', 'role:']));
    expect(
      items.map((item) => (item.kind === 'group' ? `[${item.group.key}]` : item.row.name)),
    ).toEqual([
      '[role:Admin]',
      '[role:Admin/team:B]',
      'Bora',
      '[role:Editor]',
      '[role:Editor/team:A]',
      'Ada',
      '[role:Editor/team:B]',
      '[role:]',
    ]);
  });
});

describe('aggregate', () => {
  it('sums, averages, counts and finds extremes, skipping empty values', () => {
    const values = [5, 10, null, 1, 'x'];
    expect(aggregate('sum', values)).toBe(16);
    expect(aggregate('avg', values)).toBeCloseTo(16 / 3);
    expect(aggregate('min', values)).toBe(1);
    expect(aggregate('max', values)).toBe(10);
    expect(aggregate('count', values)).toBe(4);
    expect(aggregate('sum', [null])).toBeNull();
    const early = new Date(2026, 0, 1);
    expect(aggregate('min', [new Date(2026, 5, 1), early])).toBe(early);
  });
});

describe('toCsv', () => {
  it('quotes, escapes and guards against formulas', () => {
    const csv = toCsv(
      [
        { a: 'plain', b: 'with, comma', c: 3 },
        { a: '=HYPERLINK("x")', b: 'line\nbreak', c: -2 },
        { a: new Date(2026, 2, 5), b: null, c: ['x', 'y'] },
      ],
      [
        { header: 'A', value: (row) => row.a },
        { header: 'B "quoted"', value: (row) => row.b },
        { header: 'C', value: (row) => row.c },
      ],
    );
    expect(csv).toBe(
      [
        'A,"B ""quoted""",C',
        'plain,"with, comma",3',
        `"'=HYPERLINK(""x"")","line\nbreak",-2`,
        '2026-03-05,,"x, y"',
        '',
      ].join('\r\n'),
    );
  });

  it('uses another delimiter and writes times that are not midnight', () => {
    const csv = toCsv(
      [{ at: new Date(2026, 2, 5, 9, 30) }],
      [{ header: 'At', value: (row) => row.at }],
      ';',
    );
    expect(csv).toBe('At\r\n2026-03-05 09:30\r\n');
  });
});

describe('saved views', () => {
  const view = (id: string, name: string): DataTableView => ({
    id,
    name,
    state: {
      sort: [],
      filters: {},
      search: '',
      columns: { order: [], hidden: [], widths: {}, pinned: {} },
      groupBy: [],
    },
  });

  it('adds a view, or replaces the one with the same name', () => {
    const views = saveView([view('1', 'Admins')], view('2', 'Editors'));
    expect(views.map((v) => v.id)).toEqual(['1', '2']);
    const replaced = saveView(views, {
      ...view('3', ' admins '),
      state: { ...view('3', '').state, search: 'x' },
    });
    expect(replaced.map((v) => [v.id, v.state.search])).toEqual([
      ['1', 'x'],
      ['2', ''],
    ]);
  });

  it('reads stored views back, with date filters as dates', () => {
    const stored = JSON.stringify([
      {
        ...view('1', 'March'),
        state: {
          ...view('1', '').state,
          filters: { at: { type: 'date', from: new Date(2026, 2, 1), to: null } },
          pageSize: 25,
        },
      },
      { broken: true },
    ]);
    const [march, ...rest] = parseViews(stored) ?? [];
    expect(rest).toEqual([]);
    expect(march?.state.filters.at).toEqual({ type: 'date', from: new Date(2026, 2, 1), to: null });
    expect(march?.state.pageSize).toBe(25);
    expect(parseViews('{')).toBeUndefined();
    expect(parseViews(null)).toBeUndefined();
  });
});
