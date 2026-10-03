'use client';

import { clsx } from 'clsx';
import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import type { DayPickerLocale } from 'react-day-picker';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { EventScope, useEmit } from '../../events/react';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { ContextMenu } from '../context-menu';
import { IconButton } from '../icon-button';
import { Input } from '../input';
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
import { BulkBar, ExpandIcon, GripIcon, RowActionsButton, rowContextItems } from './actions';
import { ColumnChooser, ResizeHandle } from './column-tools';
import {
  clampWidth,
  defaultColumnState as columnDefaults,
  displayOrder,
  layoutColumns,
  moveColumn,
  normalizeColumnState,
  parseColumnState,
  sameColumnState,
  setHidden,
  setPinned,
  setWidth,
  stepColumn,
  type ColumnSlot,
  type DataTableColumnPin,
  type DataTableColumnState,
} from './columns';
import styles from './data-table.module.css';
import {
  filterRows,
  sameFilters,
  withFilter,
  type DataTableColumnFilter,
  type DataTableFilter,
  type DataTableFilters,
  type DataTableTextOperator,
} from './filtering';
import { ActiveFilters, FilterButton, type FilterColumn } from './filters';
import {
  emptySelection,
  isSelected,
  pageSelection,
  sameSelection,
  togglePage,
  toggleRow,
  type DataTableSelection,
} from './selection';
import {
  nextSort,
  sameSort,
  sortRows,
  type DataTableSort,
  type DataTableSortDirection,
} from './sorting';
import { useRowDrag, type RowDropTarget } from './use-row-drag';
import { useRowHeights, useVirtualRows } from './use-virtual-rows';
import { dropIndex, renderedRows, type DataTableDropPosition } from './virtual';

export type { DataTableSort, DataTableSortDirection } from './sorting';
export type { DataTableSelection } from './selection';
export type { DataTableColumnPin, DataTableColumnState } from './columns';
export type { DataTableDropPosition } from './virtual';
export type {
  DataTableColumnFilter,
  DataTableFilter,
  DataTableFilterOption,
  DataTableFilters,
  DataTableTextOperator,
} from './filtering';

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
  /** Plain-text name for labels (“Filter Name”, filter chips) when `header` is not plain text. */
  label?: string;
  /** Adds a filter to the header; the type decides the editor. */
  filter?: DataTableColumnFilter;
  /** The value filters and search compare, when it differs from `value`. */
  filterValue?: (row: T) => unknown;
  /** Whether global search looks at this column. Defaults to true when it has a value. */
  searchable?: boolean;
  /** Starting width in pixels. Without one, the column shares the free space. */
  width?: number;
  /** Resize limits in pixels. Default 48 and 1200. */
  minWidth?: number;
  maxWidth?: number;
  /** With `resizableColumns`: whether this column can be resized. Defaults to true. */
  resizable?: boolean;
  /** With `columnChooser`: whether this column can be hidden. Defaults to true. */
  hideable?: boolean;
  /** Starts hidden; the column chooser can show it. */
  hidden?: boolean;
  /** Starts pinned to the table's start or end side. */
  pinned?: DataTableColumnPin;
}

/** Everything a server needs to fetch one page: sorting, filters, search and pagination. */
export interface DataTableQuery {
  sort: DataTableSort[];
  filters: DataTableFilters;
  search: string;
  page: number;
  pageSize: number;
}

export type DataTableActionTone = 'default' | 'danger';

/** An action in a row's menu (the “⋯” button and the row's context menu). */
export interface DataTableRowAction<T> {
  /** Unique id; reported in `datatable.interaction.onRowAction`. */
  id: string;
  label: string;
  tone?: DataTableActionTone;
  /** Disables the action for some rows. */
  disabled?: (row: T) => boolean;
  onSelect: (row: T) => void;
}

/** What a bulk action receives. */
export interface DataTableBulkContext<T> {
  selection: DataTableSelection;
  /**
   * The selected rows the table has: every one in client mode; in server mode only those on the
   * current page — with `selection.allMatching`, act on `query` instead.
   */
  rows: T[];
  /** The current sort, filters and search: what “all results” means. */
  query: DataTableQuery;
  /** Clears the selection, e.g. after deleting the rows. */
  clearSelection: () => void;
}

/** A button in the bar shown while rows are selected. */
export interface DataTableBulkAction<T> {
  /** Unique id; reported in `datatable.interaction.onBulkAction`. */
  id: string;
  label: string;
  tone?: DataTableActionTone;
  onSelect: (context: DataTableBulkContext<T>) => void;
}

/** What `onRowReorder` receives: move `data[fromIndex]` to `toIndex`. */
export interface DataTableRowReorder<T> {
  row: T;
  rowId: string;
  /** The row it was dropped on, and on which side of it. */
  targetRowId: string;
  position: DataTableDropPosition;
  /** Indexes in `data` (in server mode, the current page). */
  fromIndex: number;
  toIndex: number;
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
  /** Global search field. */
  search: string;
  searchPlaceholder: string;
  /** Shown when filters or search leave no rows, with a button to clear them. */
  noMatches: string;
  clearFilters: string;
  /** Filter button and editor. `active` is true when the column has a filter. */
  filter: (column: string, active: boolean) => string;
  condition: string;
  value: string;
  operators: Record<DataTableTextOperator, string>;
  min: string;
  max: string;
  from: string;
  to: string;
  chooseDates: string;
  any: string;
  yes: string;
  no: string;
  apply: string;
  clear: string;
  /** The list of active filters, and removing one or all. */
  activeFilters: string;
  removeFilter: (summary: string) => string;
  clearAll: string;
  /** Selection. `row` is the row's name from `getRowLabel`. */
  selectAll: string;
  selectRow: (row: string) => string;
  /** The count in the bulk bar. */
  selected: (count: number) => string;
  /** Offered when the whole page is selected and more results exist; then shown as the count. */
  selectAllMatching: (total: number) => string;
  allSelected: (total: number) => string;
  clearSelection: string;
  bulkActions: string;
  /** Row menu button, and the hidden header of its column. */
  rowActions: (row: string) => string;
  actionsColumn: string;
  /** Detail button (with `aria-expanded`), and the hidden header of its column. */
  details: (row: string) => string;
  detailsColumn: string;
  /** Column management. `column` is the column's plain-text name. */
  columns: string;
  resizeColumn: (column: string) => string;
  moveUp: (column: string) => string;
  moveDown: (column: string) => string;
  /** Announced after a move in the column chooser. */
  columnMoved: (column: string, position: number, count: number) => string;
  pinColumn: (column: string) => string;
  notPinned: string;
  pinStart: string;
  pinEnd: string;
  resetColumns: string;
  /** Row reordering. `row` is the row's name; positions count from 1 among the shown rows. */
  reorderRow: (row: string) => string;
  reorderColumn: string;
  reorderInstructions: string;
  rowPickedUp: (row: string, position: number, count: number) => string;
  rowMoved: (row: string, position: number, count: number) => string;
  rowDropped: (row: string, position: number, count: number) => string;
  rowDragCancelled: (row: string) => string;
  /** Infinite loading. */
  loadMore: string;
}

export interface DataTableProps<T> extends Omit<ComponentProps<'div'>, 'children'>, EventDataProps {
  /** The table's title. Required: it names the table. */
  caption: ReactNode;
  columns: DataTableColumn<T>[];
  /** Client mode: every row. Server mode: the rows of the current page. */
  data: T[];
  /**
   * A stable id per row. Defaults to the row's index in `data` — give one whenever rows can be
   * selected, expanded or removed.
   */
  getRowId?: (row: T, index: number) => string;
  /** A row's plain-text name for its checkbox and buttons (“Select Ayşe”). Defaults to its first value. */
  getRowLabel?: (row: T) => string;
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

  /** Shows a search field above the table that looks in every searchable column. */
  globalSearch?: boolean;
  /** Search text (controlled). */
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
  /** Milliseconds after the last keystroke before the search applies. Defaults to 300. */
  searchDebounce?: number;

  /** Column filters by column id (controlled). */
  filters?: DataTableFilters;
  defaultFilters?: DataTableFilters;
  onFiltersChange?: (filters: DataTableFilters) => void;
  /** Month names and week start for date filters, e.g. `tr` from `react-day-picker/locale`. */
  dateLocale?: DayPickerLocale;

  /** Called with the whole query after every sort, filter, search, page or page size change. */
  onQueryChange?: (query: DataTableQuery) => void;

  /** Adds a checkbox to every row and a “select all on this page” checkbox to the header. */
  selectable?: boolean;
  /** Selected rows (controlled). */
  selection?: DataTableSelection;
  defaultSelection?: DataTableSelection;
  onSelectionChange?: (selection: DataTableSelection) => void;
  /** Rows it returns false for get a disabled checkbox. */
  isRowSelectable?: (row: T) => boolean;
  /** Buttons in the bar shown above the table while rows are selected. */
  bulkActions?: DataTableBulkAction<T>[];
  /** A menu per row, from a “⋯” button at the row's end and from the row's context menu. */
  rowActions?: DataTableRowAction<T>[];
  /**
   * Called when a row is clicked outside its buttons, links and fields. A pointer shortcut only:
   * keep a link or a row action that does the same for keyboard users.
   */
  onRowClick?: (row: T, event: MouseEvent<HTMLTableRowElement>) => void;
  /** A row's detail panel, opened by a button at the row's start. Return null for rows without one. */
  renderDetail?: (row: T) => ReactNode;
  /** Ids of rows whose detail is open (controlled). */
  expandedRowIds?: string[];
  defaultExpandedRowIds?: string[];
  onExpandedChange?: (expandedRowIds: string[]) => void;

  /**
   * Adds a drag handle to each row: drag it, or focus it and use Space, the arrow keys and Space.
   * Apply the move to `data` in `onRowReorder`. Off while the table is sorted.
   */
  reorderableRows?: boolean;
  onRowReorder?: (change: DataTableRowReorder<T>) => void;
  /**
   * Renders only the rows in view, for thousands of rows without paging. Scrolls inside the
   * `maxHeight` box (default `lg`) and lays columns out by width (fixed layout).
   */
  virtualized?: boolean;
  /** Row height used until rows are measured. Defaults to 41 (normal) or 33 (compact) pixels. */
  estimatedRowHeight?: number;
  /** Rows rendered beyond each edge of the view. Defaults to 8. */
  overscan?: number;
  /**
   * Without paging: more rows can be loaded. Shows “Load more”, and with `maxHeight` or
   * `virtualized` asks for them when the view nears the end.
   */
  hasMore?: boolean;
  onLoadMore?: () => void;

  /** Adds a handle to each header's edge: drag it, or focus it and use the arrow keys. */
  resizableColumns?: boolean;
  /** Headers can be dragged to reorder columns. The column chooser does the same by keyboard. */
  reorderableColumns?: boolean;
  /** Adds a “Columns” button that shows, hides, orders and pins columns. */
  columnChooser?: boolean;
  /** Column order, visibility, widths and pinning (controlled). */
  columnState?: DataTableColumnState;
  defaultColumnState?: Partial<DataTableColumnState>;
  onColumnStateChange?: (columnState: DataTableColumnState) => void;
  /** Uncontrolled: keeps the column state in `localStorage` under this key, across visits. */
  storageKey?: string;

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
    search: 'Search',
    searchPlaceholder: 'Search…',
    noMatches: 'No results match the filters.',
    clearFilters: 'Clear filters and search',
    filter: (column, active) => `Filter ${column}${active ? ' (active)' : ''}`,
    condition: 'Condition',
    value: 'Value',
    operators: { contains: 'contains', equals: 'is', startsWith: 'starts with' },
    min: 'Min',
    max: 'Max',
    from: 'From',
    to: 'To',
    chooseDates: 'Choose dates',
    any: 'Any',
    yes: 'Yes',
    no: 'No',
    apply: 'Apply',
    clear: 'Clear',
    activeFilters: 'Active filters',
    removeFilter: (summary) => `Remove filter: ${summary}`,
    clearAll: 'Clear all filters',
    selectAll: 'Select all rows on this page',
    selectRow: (row) => `Select ${row}`,
    selected: (count) => `${number.format(count)} selected`,
    selectAllMatching: (total) => `Select all ${number.format(total)} results`,
    allSelected: (total) => `All ${number.format(total)} results selected`,
    clearSelection: 'Clear selection',
    bulkActions: 'Bulk actions',
    rowActions: (row) => `Actions for ${row}`,
    actionsColumn: 'Actions',
    details: (row) => `Details for ${row}`,
    detailsColumn: 'Details',
    columns: 'Columns',
    resizeColumn: (column) => `Resize ${column}`,
    moveUp: (column) => `Move ${column} up`,
    moveDown: (column) => `Move ${column} down`,
    columnMoved: (column, position, count) => `${column} moved to position ${position} of ${count}`,
    pinColumn: (column) => `Pin ${column}`,
    notPinned: 'Not pinned',
    pinStart: 'Left',
    pinEnd: 'Right',
    resetColumns: 'Reset columns',
    reorderRow: (row) => `Reorder ${row}`,
    reorderColumn: 'Reorder',
    reorderInstructions:
      'Press Space or Enter to pick up the row, the up and down arrows to move it, Space or Enter to drop it, Escape to cancel.',
    rowPickedUp: (row, position, count) => `Picked up ${row}, position ${position} of ${count}.`,
    rowMoved: (row, position, count) => `${row}: position ${position} of ${count}.`,
    rowDropped: (row, position, count) => `Dropped ${row} at position ${position} of ${count}.`,
    rowDragCancelled: (row) => `Reordering cancelled. ${row} is back in its place.`,
    loadMore: 'Load more',
  };
}

function columnLabel<T>(column: DataTableColumn<T>): string {
  return column.label ?? (typeof column.header === 'string' ? column.header : column.id);
}

const ariaSort = { asc: 'ascending', desc: 'descending' } as const;

/**
 * A data table for admin screens: sorting, search, column filters and pages, on the client or the
 * server. Built on the kit's own components.
 */
export function DataTable<T>({
  caption,
  columns,
  data,
  getRowId = (_row, index) => String(index),
  getRowLabel,
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
  globalSearch = false,
  search: searchProp,
  defaultSearch = '',
  onSearchChange,
  searchDebounce = 300,
  filters: filtersProp,
  defaultFilters = {},
  onFiltersChange,
  dateLocale,
  onQueryChange,
  selectable = false,
  selection: selectionProp,
  defaultSelection = emptySelection,
  onSelectionChange,
  isRowSelectable,
  bulkActions = [],
  rowActions = [],
  onRowClick,
  renderDetail,
  expandedRowIds: expandedProp,
  defaultExpandedRowIds = [],
  onExpandedChange,
  reorderableRows = false,
  onRowReorder,
  virtualized = false,
  estimatedRowHeight,
  overscan = 8,
  hasMore = false,
  onLoadMore,
  resizableColumns = false,
  reorderableColumns = false,
  columnChooser = false,
  columnState: columnStateProp,
  defaultColumnState,
  onColumnStateChange,
  storageKey,
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
  const [innerSearch, setInnerSearch] = useState(defaultSearch);
  const [innerFilters, setInnerFilters] = useState(defaultFilters);
  const [innerSelection, setInnerSelection] = useState(defaultSelection);
  const [innerExpanded, setInnerExpanded] = useState(defaultExpandedRowIds);
  const sort = sortProp ?? innerSort;
  const search = searchProp ?? innerSearch;
  const filters = filtersProp ?? innerFilters;
  const selection = selectionProp ?? innerSelection;
  const expanded = expandedProp ?? innerExpanded;
  const bulkBarRef = useRef<HTMLDivElement>(null);
  const clearSelectionRef = useRef<HTMLButtonElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  // The row the context menu is for: the row under the pointer or holding focus.
  const [menuRowId, setMenuRowId] = useState<string | null>(null);

  // The search field updates at once; the search applies after a pause in typing.
  const [searchInput, setSearchInput] = useState(search);
  const [shownSearch, setShownSearch] = useState(search);
  if (shownSearch !== search) {
    // A search set from outside (controlled, or cleared) replaces the field's text.
    setShownSearch(search);
    setSearchInput(search);
  }
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(searchTimer.current), []);
  const pageSize = paginated ? (pageSizeProp ?? innerPageSize) : Number.POSITIVE_INFINITY;

  const isServer = mode === 'server';
  const rows = isServer
    ? data
    : sortRows(
        filterRows(data, columns, filters, search, locale),
        sort,
        columns,
        new Intl.Collator(locale, { numeric: true }),
      );
  const total = isServer ? (totalCount ?? data.length) : rows.length;
  const pageCount = paginated ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  // A page beyond the last (rows were removed) shows the last page.
  const page = Math.min(Math.max(pageProp ?? innerPage, 1), pageCount);
  // Index of the first visible row among all rows (0 when the server sends one page, or no paging).
  const offset = isServer || !paginated ? 0 : (page - 1) * pageSize;
  const visible = isServer || !paginated ? rows : rows.slice(offset, offset + pageSize);

  // Ids use the row's index in `data`, so the default id stays the same when rows sort or filter.
  const dataIndex = new Map(data.map((row, index) => [row, index]));
  const rowId = (row: T, fallback: number) => getRowId(row, dataIndex.get(row) ?? fallback);
  const valueColumn = columns.find((column) => column.value);
  const rowLabel = (row: T, fallback: number) => {
    if (getRowLabel) return getRowLabel(row);
    const value = valueColumn?.value?.(row);
    return value === null || value === undefined
      ? String(fallback + 1)
      : String(formatValue(value, locale));
  };
  const canSelect = (row: T) => isRowSelectable?.(row) ?? true;
  const pageIds = visible.flatMap((row, index) =>
    canSelect(row) ? [rowId(row, offset + index)] : [],
  );
  const pageState = pageSelection(selection, pageIds);

  // Column management: the definitions give the starting state; the user's changes override it.
  const fallbackColumns = normalizeColumnState(defaultColumnState, columnDefaults(columns));
  const [innerColumns, setInnerColumns] = useState<DataTableColumnState | undefined>(undefined);
  const storageName = storageKey && `ufi-datatable:${storageKey}`;
  // The stored state (uncontrolled with storageKey). The server and hydration see none, so both
  // render the defaults; other tabs' changes arrive through the storage event.
  const stored = useSyncExternalStore(
    (onChange) => {
      window.addEventListener('storage', onChange);
      return () => window.removeEventListener('storage', onChange);
    },
    () => (storageName ? readStorage(storageName) : null),
    () => null,
  );
  const columnState = normalizeColumnState(
    columnStateProp ?? innerColumns ?? parseColumnState(stored),
    fallbackColumns,
  );
  // While a resize handle is dragged: the width shown, kept when the drag ends.
  const [preview, setPreview] = useState<{ id: string; width: number } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; side: 'before' | 'after' } | null>(
    null,
  );
  const tableRef = useRef<HTMLTableElement>(null);

  const columnById = new Map(columns.map((column) => [column.id, column]));
  const minWidthOf = (id: string) => columnById.get(id)?.minWidth ?? 48;
  const maxWidthOf = (id: string) => columnById.get(id)?.maxWidth ?? 1200;
  const headerCell = (id: string) =>
    tableRef.current?.querySelector<HTMLElement>(`th[data-column-id="${CSS.escape(id)}"]`);
  const measure = (id: string) => headerCell(id)?.getBoundingClientRect().width ?? 0;
  const widthOf = (id: string): number | undefined => {
    if (preview?.id === id) return preview.width;
    const width = columnState.widths[id] ?? columnById.get(id)?.width;
    // Pinned columns need a width: the sticky offsets of their neighbours add it up.
    return width ?? (columnState.pinned[id] ? 160 : undefined);
  };

  const pinsStart = Object.values(columnState.pinned).includes('start');
  const pinsEnd = Object.values(columnState.pinned).includes('end');
  const controlsStart =
    Number(reorderableRows) + Number(selectable) + Number(renderDetail !== undefined);
  const controlsEnd = Number(rowActions.length > 0);
  const slots = layoutColumns(
    columnState,
    widthOf,
    pinsStart ? controlsStart : 0,
    pinsEnd ? controlsEnd : 0,
  );
  const shown = slots.flatMap((slot) => {
    const column = columnById.get(slot.id);
    return column ? [{ column, slot }] : [];
  });
  // Set widths only hold when the table lays columns out by them, not by their content.
  // Virtualized rows too: widths must not change as other rows scroll into view.
  const fixedLayout = resizableColumns || pinsStart || pinsEnd || virtualized;
  // Virtualization scrolls inside the maxHeight box.
  const scrollBox = maxHeight ?? (virtualized ? 'lg' : undefined);

  // Virtualization: only the rows in view are rendered; spacer rows keep the scroll height.
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const { heights: measured, measure: measureRow } = useRowHeights(virtualized);
  const estimate = estimatedRowHeight ?? (density === 'compact' ? 33 : 41);
  const expandedIds = new Set(expanded);
  const visibleIds = visible.map((row, index) => rowId(row, offset + index));
  const rowHeights = virtualized
    ? visibleIds.map((id) => {
        const main = measured.get(`row:${id}`) ?? estimate;
        return expandedIds.has(id) ? main + (measured.get(`detail:${id}`) ?? estimate * 3) : main;
      })
    : [];
  const infinite = !paginated && hasMore && onLoadMore !== undefined;
  // The row count a scroll-triggered load was asked at: one request per batch.
  const requested = useRef(-1);

  function loadMore(trigger: 'scroll' | 'button') {
    if (!onLoadMore) return;
    if (trigger === 'scroll') {
      if (loading || requested.current === rows.length) return;
      requested.current = rows.length;
    }
    onLoadMore();
    emit('datatable.interaction.onLoadMore', { loaded: rows.length, trigger, source: source() });
  }

  const virtual = useVirtualRows({
    enabled: virtualized,
    listen: virtualized || (infinite && scrollBox !== undefined),
    heights: rowHeights,
    overscan,
    initialCount: 30,
    tableRef,
    bodyRef,
    onNearEnd: infinite ? () => loadMore('scroll') : undefined,
  });

  // Row reordering, in the order shown; the move is applied to `data` by the consumer.
  const dragEnabled = reorderableRows && sort.length === 0;
  function reorderRow(id: string, target: RowDropTarget) {
    const from = data.findIndex((row, index) => getRowId(row, index) === id);
    const over = data.findIndex((row, index) => getRowId(row, index) === target.id);
    if (from < 0 || over < 0) return;
    const toIndex = dropIndex(from, over, target.position);
    if (toIndex === from) return;
    onRowReorder?.({
      row: data[from] as T,
      rowId: id,
      targetRowId: target.id,
      position: target.position,
      fromIndex: from,
      toIndex,
    });
    emit('datatable.interaction.onRowReorder', {
      rowId: id,
      targetRowId: target.id,
      position: target.position,
      fromIndex: from,
      toIndex,
      source: source(),
    });
  }
  const rowDrag = useRowDrag({
    ids: visibleIds,
    labelOf: (id) => {
      const index = visibleIds.indexOf(id);
      return index >= 0 ? rowLabel(visible[index] as T, offset + index) : id;
    },
    tableRef,
    scrollToIndex: (index) => {
      if (virtualized) return virtual.scrollToIndex(index);
      const id = visibleIds[index];
      tableRef.current
        ?.querySelector(`tr[data-row-id="${CSS.escape(id ?? '')}"]`)
        ?.scrollIntoView?.({ block: 'nearest' });
    },
    onDrop: reorderRow,
    labels,
  });

  // A focused or dragged row stays rendered when it scrolls out of view.
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const keep = [focusedRowId, rowDrag.drag?.id, rowDrag.drag?.target?.id].flatMap((id) =>
    id ? [visibleIds.indexOf(id)] : [],
  );
  const renderIndexes = virtualized
    ? renderedRows(visible.length, virtual.range, keep)
    : visible.map((_, index) => index);
  // Rows before each row that hold an open detail, for aria-rowindex (header row is 1).
  const detailsBefore: number[] = [];
  let openDetails = 0;
  if (virtualized) {
    for (const id of visibleIds) {
      detailsBefore.push(openDetails);
      if (expandedIds.has(id)) openDetails++;
    }
  }
  const rowCount = visible.length + openDetails + 1;
  const spacer = (from: number, to: number) =>
    (virtual.offsets[to] ?? 0) - (virtual.offsets[from] ?? 0);

  function changeColumns(next: DataTableColumnState, emitChange: () => void) {
    if (sameColumnState(next, columnState)) return;
    if (columnStateProp === undefined) setInnerColumns(next);
    onColumnStateChange?.(next);
    emitChange();
    if (storageName && columnStateProp === undefined) {
      try {
        window.localStorage.setItem(storageName, JSON.stringify(next));
      } catch {
        // Not stored: the state still applies for this visit.
      }
    }
  }

  function resizeColumn(id: string, width: number | null) {
    setPreview(null);
    const previousWidth = widthOf(id) ?? null;
    const next = setWidth(
      columnState,
      id,
      width === null ? null : clampWidth(width, minWidthOf(id), maxWidthOf(id)),
    );
    changeColumns(next, () =>
      emit('datatable.state.onColumnResize', {
        columnId: id,
        width: next.widths[id] ?? null,
        previousWidth: columnState.widths[id] ?? previousWidth,
        source: source(),
      }),
    );
  }

  function showColumn(id: string, visible: boolean) {
    changeColumns(setHidden(columnState, id, !visible), () =>
      emit('datatable.state.onColumnVisibilityChange', {
        columnId: id,
        visible,
        source: source(),
      }),
    );
  }

  function reorder(id: string, next: DataTableColumnState) {
    changeColumns(next, () =>
      emit('datatable.state.onColumnMove', {
        columnId: id,
        order: displayOrder(next),
        previousOrder: displayOrder(columnState),
        source: source(),
      }),
    );
  }

  function pinColumn(id: string, pin: DataTableColumnPin | null) {
    let next = setPinned(columnState, id, pin);
    // A newly pinned column keeps the width it has now.
    if (pin && widthOf(id) === undefined && measure(id) > 0) next = setWidth(next, id, measure(id));
    changeColumns(next, () =>
      emit('datatable.state.onColumnPin', {
        columnId: id,
        pinned: pin,
        previousPinned: columnState.pinned[id] ?? null,
        source: source(),
      }),
    );
  }

  function resetColumns() {
    changeColumns(fallbackColumns, () =>
      emit('datatable.state.onColumnsReset', { source: source() }),
    );
  }

  /** Header drag and drop: only within a pinned group, before or after the column under the pointer. */
  function dragOver(event: DragEvent<HTMLTableCellElement>, id: string) {
    if (!dragging || dragging === id) return;
    if (columnState.pinned[dragging] !== columnState.pinned[id]) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const rect = event.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const before = event.clientX < rect.left + rect.width / 2 !== rtl;
    const side = before ? 'before' : 'after';
    if (dropTarget?.id !== id || dropTarget.side !== side) setDropTarget({ id, side });
  }

  function drop(event: DragEvent<HTMLTableCellElement>, id: string) {
    event.preventDefault();
    if (dragging && dropTarget?.id === id) {
      reorder(dragging, moveColumn(columnState, dragging, id, dropTarget.side));
    }
    setDragging(null);
    setDropTarget(null);
  }

  // Pinned cells read their sticky offset from --_pin-offset (px) plus --_pin-controls control
  // columns; sized headers read --_width.
  const pinClass = (slot: ColumnSlot) =>
    clsx(
      slot.pinned === 'start' && styles.pinStart,
      slot.pinned === 'end' && styles.pinEnd,
      slot.edge && styles.pinEdge,
    );
  const pinOffset = (slot: ColumnSlot) => (slot.pinned ? `${slot.offset}px` : undefined);
  const pinControls = (slot: ColumnSlot) => (slot.pinned ? slot.controls : undefined);
  const px = (width: number | undefined) => (width === undefined ? undefined : `${width}px`);

  /** A selection, detail or action cell: pinned with the data columns on its side. */
  const controlClass = (side: DataTableColumnPin) =>
    clsx(
      styles.controlCell,
      side === 'start' && pinsStart && styles.pinStart,
      side === 'end' && pinsEnd && styles.pinEnd,
    );
  const controlOffset = (side: DataTableColumnPin) =>
    (side === 'start' ? pinsStart : pinsEnd) ? '0px' : undefined;
  // The detail column sits after the selection column.
  const selectControls = pinsStart ? Number(reorderableRows) : undefined;
  const detailControls = pinsStart ? Number(reorderableRows) + Number(selectable) : undefined;
  const pinnedControls = (side: DataTableColumnPin) =>
    (side === 'start' ? pinsStart : pinsEnd) ? 0 : undefined;

  function applyPage(next: number) {
    if (next === page) return;
    if (pageProp === undefined) setInnerPage(next);
    onPageChange?.(next);
    emit('datatable.state.onPageChange', { page: next, previousPage: page, source: source() });
  }

  const query = (changes: Partial<DataTableQuery>): DataTableQuery => ({
    sort,
    filters,
    search,
    page,
    pageSize,
    ...changes,
  });

  function changeSort(columnId: string, multi: boolean) {
    const next = nextSort(sort, columnId, multi);
    if (sameSort(next, sort)) return;
    if (sortProp === undefined) setInnerSort(next);
    onSortChange?.(next);
    emit('datatable.state.onSort', { sort: next, previousSort: sort, source: source() });
    // A new order starts at the first page.
    applyPage(1);
    onQueryChange?.(query({ sort: next, page: 1 }));
  }

  function changePage(next: number) {
    applyPage(next);
    onQueryChange?.(query({ page: next }));
  }

  function changeFilters(next: DataTableFilters, nextSearch = search) {
    const filtersChanged = !sameFilters(next, filters);
    const searchChanged = nextSearch !== search;
    if (!filtersChanged && !searchChanged) return;
    if (filtersChanged) {
      if (filtersProp === undefined) setInnerFilters(next);
      onFiltersChange?.(next);
      emit('datatable.state.onFilter', {
        filters: next,
        previousFilters: filters,
        source: source(),
      });
    }
    if (searchChanged) {
      if (searchProp === undefined) setInnerSearch(nextSearch);
      onSearchChange?.(nextSearch);
      emit('datatable.state.onSearch', {
        search: nextSearch,
        previousSearch: search,
        source: source(),
      });
    }
    // Fewer or other rows: start at the first page.
    applyPage(1);
    // “All results” meant the results of the old query.
    if (selection.allMatching) changeSelection({ ids: selection.ids, allMatching: false });
    onQueryChange?.(query({ filters: next, search: nextSearch, page: 1 }));
  }

  function changeSelection(next: DataTableSelection) {
    if (sameSelection(next, selection)) return;
    if (selectionProp === undefined) setInnerSelection(next);
    onSelectionChange?.(next);
    emit('datatable.state.onSelect', {
      selection: next,
      previousSelection: selection,
      source: source(),
    });
  }

  function selectAllMatching() {
    // Client mode knows every matching row; a server is told through `allMatching`.
    const ids = isServer
      ? pageIds
      : rows.flatMap((row, index) => (canSelect(row) ? [rowId(row, index)] : []));
    changeSelection({ ids, allMatching: true });
    // The clicked button goes away: keep focus in the bar.
    clearSelectionRef.current?.focus();
  }

  function clearSelection() {
    // The bar goes away with the selection: move focus out of it first.
    if (bulkBarRef.current?.contains(document.activeElement)) selectAllRef.current?.focus();
    changeSelection(emptySelection);
  }

  function toggleExpanded(id: string) {
    const open = !expanded.includes(id);
    const next = open ? [...expanded, id] : expanded.filter((candidate) => candidate !== id);
    if (expandedProp === undefined) setInnerExpanded(next);
    onExpandedChange?.(next);
    emit('datatable.state.onExpand', {
      rowId: id,
      expanded: open,
      expandedRowIds: next,
      source: source(),
    });
  }

  function runRowAction(action: DataTableRowAction<T>, row: T, id: string) {
    action.onSelect(row);
    emit('datatable.interaction.onRowAction', { action: action.id, rowId: id, source: source() });
  }

  function runBulkAction(action: DataTableBulkAction<T>) {
    const ids = new Set(selection.ids);
    // Client mode: every selected row in `data`. Server mode: the selected rows on this page.
    const selected = (row: T, index: number) =>
      isServer
        ? canSelect(row) && isSelected(selection, getRowId(row, index))
        : ids.has(getRowId(row, index));
    action.onSelect({
      selection,
      rows: data.filter(selected),
      query: query({}),
      clearSelection,
    });
    emit('datatable.interaction.onBulkAction', {
      action: action.id,
      rowIds: selection.ids,
      allMatching: selection.allMatching,
      source: source(),
    });
  }

  function clickRow(row: T, id: string, event: MouseEvent<HTMLTableRowElement>) {
    const target = event.target as Element;
    // Clicks on the row's own controls, and text selection, are not row clicks.
    if (target.closest('a, button, input, select, textarea, label, [role="menuitem"]')) return;
    if (window.getSelection()?.toString()) return;
    onRowClick?.(row, event);
    emit('datatable.interaction.onRowClick', { rowId: id, source: source() });
  }

  function trackMenuRow(event: SyntheticEvent) {
    const tr = (event.target as Element).closest('tr[data-row-id]');
    setMenuRowId(tr?.getAttribute('data-row-id') ?? null);
  }

  function changeColumnFilter(columnId: string, filter: DataTableFilter | null) {
    changeFilters(withFilter(filters, columnId, filter));
  }

  function typeSearch(text: string) {
    setSearchInput(text);
    clearTimeout(searchTimer.current);
    if (searchDebounce <= 0) changeFilters(filters, text);
    else searchTimer.current = setTimeout(() => changeFilters(filters, text), searchDebounce);
  }

  function clearAll() {
    clearTimeout(searchTimer.current);
    setSearchInput('');
    changeFilters({}, '');
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
    onQueryChange?.(query({ page: 1, pageSize: next }));
  }

  const from = total === 0 ? 0 : paginated ? (page - 1) * pageSize + 1 : 1;
  const to = paginated ? Math.min(page * pageSize, total) : total;
  const multiSort = sort.length > 1;
  const showSkeleton = loading && visible.length === 0 && !error;
  const filtering = Object.keys(filters).length > 0 || search.trim() !== '';
  const filterColumns: FilterColumn[] = columns.flatMap((column) =>
    column.filter ? [{ id: column.id, label: columnLabel(column), filter: column.filter }] : [],
  );

  const hasDetail = renderDetail !== undefined;
  const hasRowActions = rowActions.length > 0;
  const columnCount =
    shown.length +
    Number(reorderableRows) +
    Number(selectable) +
    Number(hasDetail) +
    Number(hasRowActions);
  const selectedCount = selection.allMatching && isServer ? total : selection.ids.length;
  const matchingCount = isServer ? total : rows.filter(canSelect).length;
  const offerAllMatching =
    paginated && !selection.allMatching && pageState === 'all' && pageIds.length < matchingCount;
  const menuIndex = visible.findIndex((row, index) => rowId(row, offset + index) === menuRowId);
  const menuRow =
    menuIndex >= 0 && menuRowId !== null
      ? { row: visible[menuIndex] as T, id: menuRowId }
      : undefined;
  const chooserColumns = displayOrder(columnState).flatMap((id) => {
    const column = columnById.get(id);
    return column
      ? [
          {
            id,
            label: columnLabel(column),
            visible: !columnState.hidden.includes(id),
            pinned: columnState.pinned[id] ?? null,
            hideable: column.hideable ?? true,
          },
        ]
      : [];
  });

  const sections = (
    <>
      <TableHeader>
        <TableRow aria-rowindex={virtualized ? 1 : undefined}>
          {reorderableRows && (
            <TableHead
              className={controlClass('start')}
              style={{
                '--_pin-offset': controlOffset('start'),
                '--_pin-controls': pinnedControls('start'),
              }}
            >
              <span className={styles.visuallyHidden}>{labels.reorderColumn}</span>
            </TableHead>
          )}
          {selectable && (
            <TableHead
              className={controlClass('start')}
              style={{
                '--_pin-offset': controlOffset('start'),
                '--_pin-controls': selectControls,
              }}
            >
              <EventScope silent>
                <Checkbox
                  ref={selectAllRef}
                  aria-label={labels.selectAll}
                  checked={pageState === 'all'}
                  indeterminate={pageState === 'some'}
                  disabled={pageIds.length === 0}
                  onChange={(event) =>
                    changeSelection(togglePage(selection, pageIds, event.target.checked))
                  }
                />
              </EventScope>
            </TableHead>
          )}
          {hasDetail && (
            <TableHead
              className={controlClass('start')}
              style={{ '--_pin-offset': controlOffset('start'), '--_pin-controls': detailControls }}
            >
              <span className={styles.visuallyHidden}>{labels.detailsColumn}</span>
            </TableHead>
          )}
          {shown.map(({ column, slot }) => {
            const sortable = column.sortable ?? Boolean(column.value || column.compare);
            const index = sort.findIndex((entry) => entry.columnId === column.id);
            const entry = index >= 0 ? sort[index] : undefined;
            const filterColumn = filterColumns.find((candidate) => candidate.id === column.id);
            const resizable = resizableColumns && (column.resizable ?? true);
            // The header is named by its label alone, not by its filter button or resize handle.
            const labelId = `${descriptionId}-label-${columns.indexOf(column)}`;
            return (
              <TableHead
                key={column.id}
                data-column-id={column.id}
                aria-labelledby={labelId}
                align={column.align}
                // Only the primary sort is announced on the header (one aria-sort at a time).
                aria-sort={entry && index === 0 ? ariaSort[entry.direction] : undefined}
                className={clsx(
                  column.headerClassName,
                  pinClass(slot),
                  slot.width !== undefined && styles.sized,
                  resizable && styles.resizable,
                  dragging === column.id && styles.dragging,
                  dropTarget?.id === column.id &&
                    (dropTarget.side === 'before' ? styles.dropBefore : styles.dropAfter),
                )}
                style={{
                  '--_pin-offset': pinOffset(slot),
                  '--_pin-controls': pinControls(slot),
                  '--_width': px(slot.width),
                }}
                draggable={reorderableColumns || undefined}
                onDragStart={
                  reorderableColumns
                    ? (event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        // Firefox starts a drag only with data.
                        event.dataTransfer.setData('text/plain', column.id);
                        setDragging(column.id);
                      }
                    : undefined
                }
                onDragOver={reorderableColumns ? (event) => dragOver(event, column.id) : undefined}
                onDrop={reorderableColumns ? (event) => drop(event, column.id) : undefined}
                onDragEnd={
                  reorderableColumns
                    ? () => {
                        setDragging(null);
                        setDropTarget(null);
                      }
                    : undefined
                }
              >
                <div className={styles.headerContent}>
                  {sortable ? (
                    <button
                      type="button"
                      className={clsx(styles.sortButton, entry && styles.sorted)}
                      aria-describedby={entry ? `${descriptionId}-${column.id}` : undefined}
                      onClick={(event) => changeSort(column.id, event.shiftKey)}
                    >
                      <span id={labelId} className={styles.headerLabel}>
                        {column.header}
                      </span>
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
                    <span id={labelId} className={styles.headerLabel}>
                      {column.header}
                    </span>
                  )}
                  {filterColumn && (
                    <FilterButton
                      column={filterColumn}
                      value={filters[column.id]}
                      onChange={(filter) => changeColumnFilter(column.id, filter)}
                      labels={labels}
                      dateLocale={dateLocale}
                    />
                  )}
                </div>
                {resizable && (
                  <ResizeHandle
                    label={labels.resizeColumn(columnLabel(column))}
                    width={slot.width}
                    min={minWidthOf(column.id)}
                    max={maxWidthOf(column.id)}
                    measure={() => measure(column.id)}
                    onPreview={(width) => setPreview({ id: column.id, width })}
                    onCommit={(width) => resizeColumn(column.id, width)}
                    onReset={() => resizeColumn(column.id, null)}
                  />
                )}
              </TableHead>
            );
          })}
          {hasRowActions && (
            <TableHead
              align="end"
              className={controlClass('end')}
              style={{
                '--_pin-offset': controlOffset('end'),
                '--_pin-controls': pinnedControls('end'),
              }}
            >
              <span className={styles.visuallyHidden}>{labels.actionsColumn}</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody
        ref={bodyRef}
        onFocus={
          virtualized
            ? (event) =>
                setFocusedRowId(
                  (event.target as Element)
                    .closest('tr[data-row-id]')
                    ?.getAttribute('data-row-id') ?? null,
                )
            : undefined
        }
      >
        {error != null ? (
          <TableRow>
            <TableCell colSpan={columnCount} className={clsx(styles.message, styles.error)}>
              <div role="alert">{error}</div>
            </TableCell>
          </TableRow>
        ) : showSkeleton ? (
          Array.from({ length: Math.min(paginated ? pageSize : 5, 5) }, (_, i) => (
            <TableRow key={`skeleton-${i}`}>
              {reorderableRows && <TableCell />}
              {selectable && <TableCell />}
              {hasDetail && <TableCell />}
              {shown.map(({ column }) => (
                <TableCell key={column.id} align={column.align}>
                  <Skeleton />
                </TableCell>
              ))}
              {hasRowActions && <TableCell />}
            </TableRow>
          ))
        ) : visible.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columnCount} className={styles.message}>
              {filtering ? (
                <div className={styles.noMatches}>
                  <span>{labels.noMatches}</span>
                  <EventScope silent>
                    <Button size="sm" variant="secondary" onClick={clearAll}>
                      {labels.clearFilters}
                    </Button>
                  </EventScope>
                </div>
              ) : (
                (emptyMessage ?? labels.empty)
              )}
            </TableCell>
          </TableRow>
        ) : (
          renderIndexes.map((index, position) => {
            const row = visible[index] as T;
            const id = rowId(row, offset + index);
            // Rows between this one and the one rendered before it are not rendered.
            const gap = virtualized
              ? spacer(position === 0 ? 0 : (renderIndexes[position - 1] as number) + 1, index)
              : 0;
            const rowIndex = virtualized ? index + 2 + (detailsBefore[index] ?? 0) : undefined;
            const dropTarget = rowDrag.drag?.target?.id === id ? rowDrag.drag.target : null;
            const label = rowLabel(row, offset + index);
            const checked = selectable && isSelected(selection, id);
            const detail = renderDetail?.(row);
            const open = detail != null && expanded.includes(id);
            const detailId = `${descriptionId}-detail-${id}`;
            return (
              <Fragment key={id}>
                {gap > 0 && <SpacerRow height={gap} columns={columnCount} />}
                <TableRow
                  ref={virtualized ? measureRow : undefined}
                  data-row-id={id}
                  data-measure-key={virtualized ? `row:${id}` : undefined}
                  aria-rowindex={rowIndex}
                  className={clsx(
                    checked && styles.selectedRow,
                    onRowClick && styles.clickableRow,
                    open && styles.expandedRow,
                    rowDrag.drag?.id === id && styles.draggingRow,
                    dropTarget &&
                      (dropTarget.position === 'before'
                        ? styles.rowDropBefore
                        : styles.rowDropAfter),
                  )}
                  onClick={onRowClick ? (event) => clickRow(row, id, event) : undefined}
                >
                  {reorderableRows && (
                    <TableCell
                      className={controlClass('start')}
                      style={{
                        '--_pin-offset': controlOffset('start'),
                        '--_pin-controls': pinnedControls('start'),
                      }}
                    >
                      <EventScope silent>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label={labels.reorderRow(label)}
                          aria-describedby={`${descriptionId}-reorder-help`}
                          disabled={!dragEnabled}
                          className={styles.dragHandle}
                          icon={<GripIcon />}
                          {...rowDrag.handleProps(id)}
                        />
                      </EventScope>
                    </TableCell>
                  )}
                  {selectable && (
                    <TableCell
                      className={controlClass('start')}
                      style={{
                        '--_pin-offset': controlOffset('start'),
                        '--_pin-controls': selectControls,
                      }}
                    >
                      <EventScope silent>
                        <Checkbox
                          aria-label={labels.selectRow(label)}
                          checked={checked}
                          disabled={!canSelect(row)}
                          onChange={(event) =>
                            changeSelection(toggleRow(selection, id, event.target.checked, pageIds))
                          }
                        />
                      </EventScope>
                    </TableCell>
                  )}
                  {hasDetail && (
                    <TableCell
                      className={controlClass('start')}
                      style={{
                        '--_pin-offset': controlOffset('start'),
                        '--_pin-controls': detailControls,
                      }}
                    >
                      {detail != null && (
                        <EventScope silent>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            aria-label={labels.details(label)}
                            aria-expanded={open}
                            aria-controls={open ? detailId : undefined}
                            className={clsx(styles.expandButton, open && styles.expanded)}
                            icon={<ExpandIcon />}
                            onClick={() => toggleExpanded(id)}
                          />
                        </EventScope>
                      )}
                    </TableCell>
                  )}
                  {shown.map(({ column, slot }) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      className={clsx(column.cellClassName, pinClass(slot))}
                      style={{
                        '--_pin-offset': pinOffset(slot),
                        '--_pin-controls': pinControls(slot),
                      }}
                    >
                      {column.cell ? column.cell(row) : formatValue(column.value?.(row), locale)}
                    </TableCell>
                  ))}
                  {hasRowActions && (
                    <TableCell
                      align="end"
                      className={controlClass('end')}
                      style={{
                        '--_pin-offset': controlOffset('end'),
                        '--_pin-controls': pinnedControls('end'),
                      }}
                    >
                      <RowActionsButton
                        row={row}
                        rowLabel={label}
                        actions={rowActions}
                        onAction={(action) => runRowAction(action, row, id)}
                        labels={labels}
                      />
                    </TableCell>
                  )}
                </TableRow>
                {open && (
                  <TableRow
                    ref={virtualized ? measureRow : undefined}
                    id={detailId}
                    data-measure-key={virtualized ? `detail:${id}` : undefined}
                    aria-rowindex={rowIndex === undefined ? undefined : rowIndex + 1}
                    className={styles.detailRow}
                  >
                    <TableCell colSpan={columnCount} className={styles.detail}>
                      {detail}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })
        )}
        {virtualized &&
          visible.length > 0 &&
          error == null &&
          spacer((renderIndexes[renderIndexes.length - 1] ?? -1) + 1, visible.length) > 0 && (
            <SpacerRow
              height={spacer((renderIndexes[renderIndexes.length - 1] ?? -1) + 1, visible.length)}
              columns={columnCount}
            />
          )}
      </TableBody>
    </>
  );

  const knownWidth = shown.reduce((sum, { slot }) => sum + (slot.width ?? 0), 0);
  const table = (
    <Table
      ref={tableRef}
      caption={caption}
      // Virtualized: the rows in the DOM are a part; say how many there are.
      aria-rowcount={virtualized ? rowCount : undefined}
      aria-busy={loading || undefined}
      className={clsx(styles.table, fixedLayout && styles.fixedLayout)}
      // Fixed layout: the table is at least as wide as the set widths, plus a minimum for each
      // column that shares the free space, plus the control columns.
      style={{
        '--_table-px': fixedLayout ? `${knownWidth}px` : undefined,
        '--_auto-count': fixedLayout
          ? shown.filter(({ slot }) => slot.width === undefined).length
          : undefined,
        '--_controls': fixedLayout ? controlsStart + controlsEnd : undefined,
      }}
      onPointerOver={hasRowActions ? trackMenuRow : undefined}
      onFocus={hasRowActions ? trackMenuRow : undefined}
    >
      {hasRowActions ? (
        // The context menu around the table is silenced; the table's own content is not.
        <EventScope silent={false}>{sections}</EventScope>
      ) : (
        sections
      )}
    </Table>
  );

  return (
    <div
      className={clsx(
        styles.dataTable,
        styles[density],
        scrollBox && styles[`maxHeight-${scrollBox}`],
        className,
      )}
      {...props}
    >
      {(globalSearch || filtering || columnChooser) && (
        <div className={styles.toolbar}>
          {(globalSearch || columnChooser) && (
            <div className={styles.toolbarRow}>
              {globalSearch && (
                <Input
                  type="search"
                  size="sm"
                  aria-label={labels.search}
                  placeholder={labels.searchPlaceholder}
                  value={searchInput}
                  onChange={(event) => typeSearch(event.target.value)}
                  className={styles.search}
                />
              )}
              {columnChooser && (
                <ColumnChooser
                  columns={chooserColumns}
                  onVisibleChange={showColumn}
                  onStep={(id, step) => reorder(id, stepColumn(columnState, id, step))}
                  onPin={pinColumn}
                  onReset={resetColumns}
                  labels={labels}
                />
              )}
            </div>
          )}
          <ActiveFilters
            columns={filterColumns}
            filters={filters}
            onRemove={(columnId) => changeColumnFilter(columnId, null)}
            onClearAll={() => changeFilters({})}
            labels={labels}
            locale={locale}
          />
        </div>
      )}

      {selectable && selectedCount > 0 && (
        <BulkBar
          ref={bulkBarRef}
          clearRef={clearSelectionRef}
          status={
            selection.allMatching
              ? labels.allSelected(selectedCount)
              : labels.selected(selectedCount)
          }
          actions={bulkActions}
          onAction={runBulkAction}
          selectAllMatching={offerAllMatching ? labels.selectAllMatching(matchingCount) : undefined}
          onSelectAllMatching={selectAllMatching}
          onClear={clearSelection}
          labels={labels}
        />
      )}

      {hasRowActions ? (
        // The row menu's own open, close and select events are silenced: onRowAction is emitted.
        <EventScope silent>
          <ContextMenu
            disabled={!menuRow}
            content={
              menuRow &&
              rowContextItems(menuRow.row, rowActions, (action) =>
                runRowAction(action, menuRow.row, menuRow.id),
              )
            }
          >
            {table}
          </ContextMenu>
        </EventScope>
      ) : (
        table
      )}

      {reorderableRows && (
        <>
          <span id={`${descriptionId}-reorder-help`} hidden>
            {labels.reorderInstructions}
          </span>
          <p role="status" className={styles.visuallyHidden}>
            {rowDrag.announcement}
          </p>
        </>
      )}

      <div className={styles.footer}>
        <span role="status" className={styles.range}>
          {loading ? labels.loading : labels.range(from, to, total)}
        </span>
        {infinite && (
          // DataTable's own button: only datatable.interaction.onLoadMore is emitted.
          <EventScope silent>
            <Button
              size="sm"
              variant="secondary"
              loading={loading}
              onClick={() => loadMore('button')}
            >
              {labels.loadMore}
            </Button>
          </EventScope>
        )}
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

/** Stands in for rows that are not rendered, so the scroll height stays right. */
function SpacerRow({ height, columns }: { height: number; columns: number }) {
  return (
    <tr aria-hidden="true">
      <td colSpan={columns} className={styles.spacer} style={{ '--_spacer': `${height}px` }} />
    </tr>
  );
}

/** A stored column state, or null when there is none or storage is blocked (private mode, policies). */
function readStorage(name: string): string | null {
  try {
    return window.localStorage.getItem(name);
  } catch {
    return null;
  }
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
