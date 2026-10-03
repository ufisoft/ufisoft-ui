/**
 * Global search and column filters for DataTable: pure functions, tested without rendering.
 */

export type DataTableTextOperator = 'contains' | 'equals' | 'startsWith';

/** A column's active filter. The `type` matches the column's `filter.type`. */
export type DataTableFilter =
  | { type: 'text'; operator: DataTableTextOperator; value: string }
  | { type: 'number'; min: number | null; max: number | null }
  | { type: 'select'; values: string[] }
  | { type: 'date'; from: Date | null; to: Date | null }
  | { type: 'boolean'; value: boolean };

/** Active filters by column id. A column without an entry is not filtered. */
export type DataTableFilters = Record<string, DataTableFilter>;

export interface DataTableFilterOption {
  value: string;
  label: string;
}

/** How a column can be filtered; decides the editor in its header. */
export type DataTableColumnFilter =
  | { type: 'text' }
  | { type: 'number' }
  | { type: 'select'; options: DataTableFilterOption[]; multiple?: boolean }
  | { type: 'date' }
  | { type: 'boolean'; trueLabel?: string; falseLabel?: string };

/** What filtering needs from a column. */
export interface FilterableColumn<T> {
  id: string;
  value?: (row: T) => unknown;
  /** The value filters and search compare; defaults to `value`. */
  filterValue?: (row: T) => unknown;
  /** Whether global search looks at this column. Defaults to true when it has a value. */
  searchable?: boolean;
}

/** Lower case, without accents, Turkish dotless ı as i: “Çağla” and “cagla” match. */
export function normalizeText(text: string, locale?: string): string {
  return text.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{M}/gu, '').replace(/ı/g, 'i');
}

const isEmpty = (value: unknown) => value === null || value === undefined || value === '';

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/** The text search and text filters see: dates and numbers as the locale shows them. */
export function searchText(value: unknown, locale?: string): string {
  if (isEmpty(value)) return '';
  if (value instanceof Date) return value.toLocaleDateString(locale);
  if (Array.isArray(value)) return value.map((item) => searchText(item, locale)).join(' ');
  return String(value);
}

/** Whether one value passes one filter. */
export function matchesFilter(value: unknown, filter: DataTableFilter, locale?: string): boolean {
  switch (filter.type) {
    case 'text': {
      const needle = normalizeText(filter.value.trim(), locale);
      if (needle === '') return true;
      const text = normalizeText(searchText(value, locale), locale);
      if (filter.operator === 'equals') return text === needle;
      if (filter.operator === 'startsWith') return text.startsWith(needle);
      return text.includes(needle);
    }
    case 'number': {
      if (filter.min === null && filter.max === null) return true;
      const number = typeof value === 'number' ? value : Number.NaN;
      if (Number.isNaN(number)) return false;
      return (
        (filter.min === null || number >= filter.min) &&
        (filter.max === null || number <= filter.max)
      );
    }
    case 'select': {
      if (filter.values.length === 0) return true;
      const values = Array.isArray(value) ? value : [value];
      return values.some((item) => !isEmpty(item) && filter.values.includes(String(item)));
    }
    case 'date': {
      if (!filter.from && !filter.to) return true;
      const date = toDate(value);
      if (!date) return false;
      const time = date.getTime();
      // Whole days: from the start of `from` to the end of `to`, in local time.
      const start = filter.from
        ? new Date(
            filter.from.getFullYear(),
            filter.from.getMonth(),
            filter.from.getDate(),
          ).getTime()
        : Number.NEGATIVE_INFINITY;
      const end = filter.to
        ? new Date(
            filter.to.getFullYear(),
            filter.to.getMonth(),
            filter.to.getDate() + 1,
          ).getTime() - 1
        : Number.POSITIVE_INFINITY;
      return time >= start && time <= end;
    }
    case 'boolean':
      return Boolean(value) === filter.value;
  }
}

/** Keeps the rows that pass every column filter and contain the search text in a searchable column. */
export function filterRows<T>(
  rows: readonly T[],
  columns: readonly FilterableColumn<T>[],
  filters: DataTableFilters,
  search: string,
  locale?: string,
): T[] {
  const active = Object.entries(filters).flatMap(([columnId, filter]) => {
    const column = columns.find((candidate) => candidate.id === columnId);
    const read = column?.filterValue ?? column?.value;
    return read ? [{ read, filter }] : [];
  });
  const needle = normalizeText(search.trim(), locale);
  const searchable = needle
    ? columns.flatMap((column) => {
        const read = column.filterValue ?? column.value;
        return read && (column.searchable ?? true) ? [read] : [];
      })
    : [];
  if (active.length === 0 && !needle) return [...rows];

  return rows.filter(
    (row) =>
      active.every(({ read, filter }) => matchesFilter(read(row), filter, locale)) &&
      (!needle ||
        searchable.some((read) =>
          normalizeText(searchText(read(row), locale), locale).includes(needle),
        )),
  );
}

/** A filter that matches everything is no filter: an empty text, no bounds, no values. */
export function isActiveFilter(filter: DataTableFilter): boolean {
  switch (filter.type) {
    case 'text':
      return filter.value.trim() !== '';
    case 'number':
      return filter.min !== null || filter.max !== null;
    case 'select':
      return filter.values.length > 0;
    case 'date':
      return filter.from !== null || filter.to !== null;
    case 'boolean':
      return true;
  }
}

/** Sets or removes one column's filter; inactive filters are removed. */
export function withFilter(
  filters: DataTableFilters,
  columnId: string,
  filter: DataTableFilter | null,
): DataTableFilters {
  const next = Object.fromEntries(Object.entries(filters).filter(([id]) => id !== columnId));
  if (filter && isActiveFilter(filter)) next[columnId] = filter;
  return next;
}

export function sameFilters(a: DataTableFilters, b: DataTableFilters): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((key) => {
    const x = a[key];
    const y = b[key];
    if (!x || !y || x.type !== y.type) return false;
    return JSON.stringify(x) === JSON.stringify(y);
  });
}
