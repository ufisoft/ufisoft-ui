/** DataTable's row grouping and aggregates: pure helpers. */

import type { DataTableSortDirection } from './sorting';

/** A built-in aggregate over a column's values, or your own over the rows. */
export type DataTableAggregate<T> =
  'sum' | 'avg' | 'min' | 'max' | 'count' | ((rows: T[]) => unknown);

export interface GroupNode<T> {
  /** Stable path key, e.g. `role:Admin/status:Active`. */
  key: string;
  columnId: string;
  value: unknown;
  depth: number;
  /** Every row in the group, nested groups included. */
  rows: T[];
  children: GroupNode<T>[] | null;
}

export type DisplayItem<T> =
  { kind: 'group'; group: GroupNode<T>; expanded: boolean } | { kind: 'row'; row: T };

interface GroupColumn<T> {
  id: string;
  value?: (row: T) => unknown;
}

/** What rows group by: dates by day, everything else as is. */
function groupValue(value: unknown): unknown {
  return value instanceof Date
    ? new Date(value.getFullYear(), value.getMonth(), value.getDate())
    : value;
}

function keyPart(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (value instanceof Date) return String(value.getTime());
  return String(value);
}

/**
 * Groups rows by the columns in `groupBy`, nested in that order. Rows keep their order inside a
 * group. Groups are ordered by value — descending when the table is sorted that way by the group's
 * column — and empty values come last.
 */
export function groupRows<T>(
  rows: T[],
  groupBy: string[],
  columns: GroupColumn<T>[],
  directionOf: (columnId: string) => DataTableSortDirection | undefined,
  collator: Intl.Collator,
  parentKey = '',
  depth = 0,
): GroupNode<T>[] {
  const [columnId, ...rest] = groupBy;
  const column = columns.find((candidate) => candidate.id === columnId);
  if (!columnId || !column?.value) return [];
  const buckets = new Map<string, { value: unknown; rows: T[] }>();
  for (const row of rows) {
    const value = groupValue(column.value(row));
    const part = keyPart(value);
    const bucket = buckets.get(part) ?? { value, rows: [] };
    bucket.rows.push(row);
    buckets.set(part, bucket);
  }
  const direction = directionOf(columnId) === 'desc' ? -1 : 1;
  const compare = (a: unknown, b: unknown) => {
    const emptyA = keyPart(a) === '';
    const emptyB = keyPart(b) === '';
    if (emptyA || emptyB) return Number(emptyA) - Number(emptyB);
    if (typeof a === 'number' && typeof b === 'number') return (a - b) * direction;
    if (a instanceof Date && b instanceof Date) return (a.getTime() - b.getTime()) * direction;
    return collator.compare(String(a), String(b)) * direction;
  };
  return [...buckets.entries()]
    .sort(([, a], [, b]) => compare(a.value, b.value))
    .map(([part, bucket]) => {
      const key = `${parentKey}${parentKey ? '/' : ''}${columnId}:${encodeURIComponent(part)}`;
      return {
        key,
        columnId,
        value: bucket.value,
        depth,
        rows: bucket.rows,
        children: rest.length
          ? groupRows(bucket.rows, rest, columns, directionOf, collator, key, depth + 1)
          : null,
      };
    });
}

/** Group header rows and the rows of open groups, in display order. */
export function flattenGroups<T>(
  groups: GroupNode<T>[],
  collapsed: ReadonlySet<string>,
): DisplayItem<T>[] {
  const items: DisplayItem<T>[] = [];
  for (const group of groups) {
    const expanded = !collapsed.has(group.key);
    items.push({ kind: 'group', group, expanded });
    if (!expanded) continue;
    if (group.children) items.push(...flattenGroups(group.children, collapsed));
    else for (const row of group.rows) items.push({ kind: 'row', row });
  }
  return items;
}

/** A built-in aggregate: numbers for sum and avg; numbers or dates for min and max. */
export function aggregate(
  kind: Exclude<DataTableAggregate<never>, (rows: never[]) => unknown>,
  values: unknown[],
): unknown {
  if (kind === 'count')
    return values.filter((value) => value !== null && value !== undefined && value !== '').length;
  if (kind === 'min' || kind === 'max') {
    const comparable = values.filter(
      (value): value is number | Date =>
        (typeof value === 'number' && Number.isFinite(value)) || value instanceof Date,
    );
    if (comparable.length === 0) return null;
    const pick = (a: number | Date, b: number | Date) =>
      (kind === 'min' ? Number(b) < Number(a) : Number(b) > Number(a)) ? b : a;
    return comparable.reduce(pick);
  }
  const numbers = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  );
  if (numbers.length === 0) return null;
  const sum = numbers.reduce((total, value) => total + value, 0);
  return kind === 'sum' ? sum : sum / numbers.length;
}
