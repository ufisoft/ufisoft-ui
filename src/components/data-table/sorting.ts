/**
 * Sorting for DataTable: pure functions, so the behaviour is tested without rendering.
 */

export type DataTableSortDirection = 'asc' | 'desc';

/** One sorted column. The order of the array is the priority: the first sorts first. */
export interface DataTableSort {
  columnId: string;
  direction: DataTableSortDirection;
}

/** What sorting needs from a column. */
export interface SortableColumn<T> {
  id: string;
  value?: (row: T) => unknown;
  compare?: (a: T, b: T) => number;
}

const isEmpty = (value: unknown) => value === null || value === undefined || value === '';

/** Compares two non-empty values: numbers, dates and booleans by value, everything else as text. */
export function compareValues(a: unknown, b: unknown, collator: Intl.Collator): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/**
 * Sorts rows by every sort in order. Empty values (null, undefined, '') go last in both
 * directions; equal rows keep their original order.
 */
export function sortRows<T>(
  rows: readonly T[],
  sort: readonly DataTableSort[],
  columns: readonly SortableColumn<T>[],
  collator: Intl.Collator,
): T[] {
  const active = sort.flatMap((entry) => {
    const column = columns.find((candidate) => candidate.id === entry.columnId);
    return column && (column.compare || column.value)
      ? [{ column, sign: entry.direction === 'asc' ? 1 : -1 }]
      : [];
  });
  if (active.length === 0) return [...rows];

  return rows
    .map((row, index) => ({ row, index }))
    .sort((x, y) => {
      for (const { column, sign } of active) {
        if (column.compare) {
          const result = column.compare(x.row, y.row) * sign;
          if (result !== 0) return result;
          continue;
        }
        const a = column.value?.(x.row);
        const b = column.value?.(y.row);
        const aEmpty = isEmpty(a);
        const bEmpty = isEmpty(b);
        if (aEmpty || bEmpty) {
          if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
          continue;
        }
        const result = compareValues(a, b, collator) * sign;
        if (result !== 0) return result;
      }
      return x.index - y.index;
    })
    .map(({ row }) => row);
}

/**
 * The sort after a header activation: unsorted → ascending → descending → unsorted.
 * Without `multi` the column becomes the only sort; with it (Shift) the column is added,
 * toggled or removed and the other sorts stay.
 */
export function nextSort(
  sort: readonly DataTableSort[],
  columnId: string,
  multi: boolean,
): DataTableSort[] {
  const current = sort.find((entry) => entry.columnId === columnId);
  const next: DataTableSort | null = !current
    ? { columnId, direction: 'asc' }
    : current.direction === 'asc'
      ? { columnId, direction: 'desc' }
      : null;

  if (!multi) return next ? [next] : [];
  if (!current) return [...sort, next as DataTableSort];
  return next
    ? sort.map((entry) => (entry.columnId === columnId ? next : entry))
    : sort.filter((entry) => entry.columnId !== columnId);
}

export function sameSort(a: readonly DataTableSort[], b: readonly DataTableSort[]): boolean {
  return (
    a.length === b.length &&
    a.every((entry, i) => entry.columnId === b[i]?.columnId && entry.direction === b[i]?.direction)
  );
}
