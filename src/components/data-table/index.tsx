'use client';

import { clsx } from 'clsx';
import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { EventScope, useEmit } from '../../events/react';
import { Pagination } from '../pagination';
import { Select } from '../select';
import { Skeleton } from '../skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableCellAlign,
} from '../table';
import styles from './data-table.module.css';
import {
  nextSort,
  sameSort,
  sortRows,
  type DataTableSort,
  type DataTableSortDirection,
} from './sorting';

export type { DataTableSort, DataTableSortDirection } from './sorting';

export type DataTableMode = 'client' | 'server';
export type DataTableDensity = 'compact' | 'normal';
export type DataTableMaxHeight = 'sm' | 'md' | 'lg';

export interface DataTableColumn<T> {
  /** Unique id; used in the sort state. */
  id: string;
  header: ReactNode;
  /** The column's value: what it sorts by, and what it shows when there is no `cell`. */
  value?: (row: T) => unknown;
  /** Custom cell content, e.g. a Badge or a link. */
  cell?: (row: T) => ReactNode;
  /** Whether the header sorts the column. Defaults to true when the column has `value` or `compare`. */
  sortable?: boolean;
  /** Custom order for this column, ascending; overrides comparing `value`. */
  compare?: (a: T, b: T) => number;
  align?: TableCellAlign;
  headerClassName?: string;
  cellClassName?: string;
}

/** Everything a server needs to fetch one page: sorting and pagination. */
export interface DataTableQuery {
  sort: DataTableSort[];
  page: number;
  pageSize: number;
}

export interface DataTableLabels {
  /** Announced while `loading`. */
  loading: string;
  /** Shown when there are no rows. Overridden by `emptyMessage`. */
  empty: string;
  /** Name of the page size select. */
  rowsPerPage: string;
  /** The rows shown, e.g. “1–10 of 245”. `total` is 0 when there are no rows. */
  range: (from: number, to: number, total: number) => string;
  /** Describes a sorted header to screen readers, e.g. “sorted descending, priority 2”. */
  sorted: (direction: DataTableSortDirection, priority: number | null) => string;
  /** Pagination landmark name and controls. */
  pagination: string;
  previous: string;
  next: string;
  page: (page: number) => string;
}

export interface DataTableProps<T> extends Omit<ComponentProps<'div'>, 'children'>, EventDataProps {
  /** The table's title. Required: it names the table. */
  caption: ReactNode;
  columns: DataTableColumn<T>[];
  /** Client mode: every row. Server mode: the rows of the current page. */
  data: T[];
  /** A stable id per row. Defaults to the row's index — give one whenever rows can move. */
  getRowId?: (row: T, index: number) => string;
  /**
   * `client` sorts and pages `data` itself. `server` shows `data` as the current page and reports
   * every change through the callbacks and `onQueryChange`, so the server sorts and pages.
   */
  mode?: DataTableMode;
  /** Server mode: the number of rows on the server, for the page count and the range. */
  totalCount?: number;

  /** Sorted columns (controlled). */
  sort?: DataTableSort[];
  /** Initially sorted columns (uncontrolled). */
  defaultSort?: DataTableSort[];
  onSortChange?: (sort: DataTableSort[]) => void;

  /** Splits rows into pages. Defaults to true. */
  paginated?: boolean;
  /** Current page, starting at 1 (controlled). */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Rows per page (controlled). */
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  /** Choices in the rows-per-page select; an empty array hides it. */
  pageSizeOptions?: number[];

  /** Called with the whole query after every sort, page or page size change. */
  onQueryChange?: (query: DataTableQuery) => void;

  /** Shows skeleton rows when there are none yet, and marks the table busy. */
  loading?: boolean;
  /** Replaces the rows with an error message. */
  error?: ReactNode;
  /** Shown when there are no rows. */
  emptyMessage?: ReactNode;

  density?: DataTableDensity;
  /** Limits the table's height; the header stays visible while the rows scroll. */
  maxHeight?: DataTableMaxHeight;
  /** For text sorting and number formatting, e.g. `tr`. Defaults to the browser's. */
  locale?: string;
  labels?: Partial<DataTableLabels>;
}

function defaultLabels(locale: string | undefined): DataTableLabels {
  const number = new Intl.NumberFormat(locale);
  return {
    loading: 'Loading…',
    empty: 'No results',
    rowsPerPage: 'Rows per page',
    range: (from, to, total) =>
      total === 0
        ? '0 results'
        : `${number.format(from)}–${number.format(to)} of ${number.format(total)}`,
    sorted: (direction, priority) =>
      `sorted ${direction === 'asc' ? 'ascending' : 'descending'}${priority ? `, priority ${priority}` : ''}`,
    pagination: 'Pagination',
    previous: 'Previous',
    next: 'Next',
    page: (page) => `Page ${page}`,
  };
}

const ariaSort = { asc: 'ascending', desc: 'descending' } as const;

/**
 * A data table for admin screens: sortable columns and pages, on the client or the server.
 * Built on `Table`, `Pagination`, `Select` and `Skeleton`.
 */
export function DataTable<T>({
  caption,
  columns,
  data,
  getRowId = (_row, index) => String(index),
  mode = 'client',
  totalCount,
  sort: sortProp,
  defaultSort = [],
  onSortChange,
  paginated = true,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize: pageSizeProp,
  defaultPageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  onQueryChange,
  loading = false,
  error,
  emptyMessage,
  density = 'normal',
  maxHeight,
  locale,
  labels: labelOverrides,
  eventData,
  className,
  ...props
}: DataTableProps<T>) {
  const labels = { ...defaultLabels(locale), ...labelOverrides };
  const emit = useEmit();
  const source = () => eventSource(props.id, undefined, eventData);
  const descriptionId = useId();

  const [innerSort, setInnerSort] = useState(defaultSort);
  const [innerPage, setInnerPage] = useState(defaultPage);
  const [innerPageSize, setInnerPageSize] = useState(defaultPageSize);
  const sort = sortProp ?? innerSort;
  const pageSize = paginated ? (pageSizeProp ?? innerPageSize) : Number.POSITIVE_INFINITY;

  const isServer = mode === 'server';
  const rows = isServer
    ? data
    : sortRows(data, sort, columns, new Intl.Collator(locale, { numeric: true }));
  const total = isServer ? (totalCount ?? data.length) : rows.length;
  const pageCount = paginated ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  // A page beyond the last (rows were removed) shows the last page.
  const page = Math.min(Math.max(pageProp ?? innerPage, 1), pageCount);
  // Index of the first visible row among all rows (0 when the server sends one page, or no paging).
  const offset = isServer || !paginated ? 0 : (page - 1) * pageSize;
  const visible = isServer || !paginated ? rows : rows.slice(offset, offset + pageSize);

  function applyPage(next: number) {
    if (next === page) return;
    if (pageProp === undefined) setInnerPage(next);
    onPageChange?.(next);
    emit('datatable.state.onPageChange', { page: next, previousPage: page, source: source() });
  }

  function changeSort(columnId: string, multi: boolean) {
    const next = nextSort(sort, columnId, multi);
    if (sameSort(next, sort)) return;
    if (sortProp === undefined) setInnerSort(next);
    onSortChange?.(next);
    emit('datatable.state.onSort', { sort: next, previousSort: sort, source: source() });
    // A new order starts at the first page.
    applyPage(1);
    onQueryChange?.({ sort: next, page: 1, pageSize });
  }

  function changePage(next: number) {
    applyPage(next);
    onQueryChange?.({ sort, page: next, pageSize });
  }

  function changePageSize(next: number) {
    if (next === pageSize) return;
    if (pageSizeProp === undefined) setInnerPageSize(next);
    onPageSizeChange?.(next);
    emit('datatable.state.onPageSizeChange', {
      pageSize: next,
      previousPageSize: pageSize,
      source: source(),
    });
    applyPage(1);
    onQueryChange?.({ sort, page: 1, pageSize: next });
  }

  const from = total === 0 ? 0 : paginated ? (page - 1) * pageSize + 1 : 1;
  const to = paginated ? Math.min(page * pageSize, total) : total;
  const multiSort = sort.length > 1;
  const showSkeleton = loading && visible.length === 0 && !error;

  return (
    <div
      className={clsx(
        styles.dataTable,
        styles[density],
        maxHeight && styles[`maxHeight-${maxHeight}`],
        className,
      )}
      {...props}
    >
      <Table caption={caption} aria-busy={loading || undefined} className={styles.table}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const sortable = column.sortable ?? Boolean(column.value || column.compare);
              const index = sort.findIndex((entry) => entry.columnId === column.id);
              const entry = index >= 0 ? sort[index] : undefined;
              return (
                <TableHead
                  key={column.id}
                  align={column.align}
                  // Only the primary sort is announced on the header (one aria-sort at a time).
                  aria-sort={entry && index === 0 ? ariaSort[entry.direction] : undefined}
                  className={column.headerClassName}
                >
                  {sortable ? (
                    <button
                      type="button"
                      className={clsx(styles.sortButton, entry && styles.sorted)}
                      aria-describedby={entry ? `${descriptionId}-${column.id}` : undefined}
                      onClick={(event) => changeSort(column.id, event.shiftKey)}
                    >
                      <span>{column.header}</span>
                      <SortIcon direction={entry?.direction} />
                      {entry && multiSort && (
                        <span className={styles.priority} aria-hidden="true">
                          {index + 1}
                        </span>
                      )}
                      {entry && (
                        <span id={`${descriptionId}-${column.id}`} hidden>
                          {labels.sorted(entry.direction, multiSort ? index + 1 : null)}
                        </span>
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {error != null ? (
            <TableRow>
              <TableCell colSpan={columns.length} className={clsx(styles.message, styles.error)}>
                <div role="alert">{error}</div>
              </TableCell>
            </TableRow>
          ) : showSkeleton ? (
            Array.from({ length: Math.min(paginated ? pageSize : 5, 5) }, (_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    <Skeleton />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : visible.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className={styles.message}>
                {emptyMessage ?? labels.empty}
              </TableCell>
            </TableRow>
          ) : (
            visible.map((row, index) => (
              <TableRow key={getRowId(row, offset + index)}>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align} className={column.cellClassName}>
                    {column.cell ? column.cell(row) : formatValue(column.value?.(row), locale)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className={styles.footer}>
        <span role="status" className={styles.range}>
          {loading ? labels.loading : labels.range(from, to, total)}
        </span>
        {paginated && (
          // The select and page buttons are DataTable's own parts: only datatable events are emitted.
          <EventScope silent>
            <div className={styles.controls}>
              {pageSizeOptions.length > 0 && (
                <Select
                  size="sm"
                  aria-label={labels.rowsPerPage}
                  value={String(pageSize)}
                  onChange={(event) => changePageSize(Number(event.target.value))}
                  className={styles.pageSize}
                >
                  {[...new Set([...pageSizeOptions, pageSize])]
                    .sort((a, b) => a - b)
                    .map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </Select>
              )}
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={changePage}
                aria-label={labels.pagination}
                previousLabel={labels.previous}
                nextLabel={labels.next}
                getPageLabel={labels.page}
              />
            </div>
          </EventScope>
        )}
      </div>
    </div>
  );
}

/** The default cell text: dates and numbers in the locale's format, empty values as nothing. */
function formatValue(value: unknown, locale: string | undefined): ReactNode {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toLocaleDateString(locale);
  if (typeof value === 'number') return value.toLocaleString(locale);
  if (typeof value === 'boolean') return String(value);
  return String(value);
}

function SortIcon({ direction }: { direction: DataTableSortDirection | undefined }) {
  return (
    <svg
      className={clsx(styles.sortIcon, !direction && styles.unsorted)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {direction !== 'desc' && (
        <path d="M5 6.5L8 3.5L11 6.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {direction !== 'asc' && (
        <path d="M5 9.5L8 12.5L11 9.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
