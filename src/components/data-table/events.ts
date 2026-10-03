import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';
import type { DataTableColumnPin } from './columns';
import type { DataTableFilters } from './filtering';
import type { DataTableSelection } from './selection';
import type { DataTableSort } from './sorting';
import type { DataTableDropPosition } from './virtual';

export const dataTableEvents = defineEvents(
  { component: 'DataTable', prefix: 'datatable' },
  {
    'state.onSort': {
      description: 'The user sorted by a column header (Shift adds or changes a secondary sort).',
      payload: payload<{
        sort: DataTableSort[];
        previousSort: DataTableSort[];
        source: EventSource;
      }>(),
      fields: {
        sort: '{ columnId, direction }[] — the new sort, highest priority first; [] when unsorted',
        previousSort: '{ columnId, direction }[] — the sort before the change',
        source: sourceField,
      },
      example: {
        sort: [{ columnId: 'createdAt', direction: 'desc' }],
        previousSort: [],
        source: { id: 'users' },
      },
    },
    'state.onPageChange': {
      description:
        'The page changed: the user moved to another page, or sorting / a new page size went back to page 1.',
      payload: payload<{ page: number; previousPage: number; source: EventSource }>(),
      fields: {
        page: 'number — the new page, starting at 1',
        previousPage: 'number — the page before the change',
        source: sourceField,
      },
      example: { page: 3, previousPage: 2, source: { id: 'users' } },
    },
    'state.onFilter': {
      description:
        'Column filters changed: a filter was applied, cleared, removed from the active list, or all were cleared.',
      payload: payload<{
        filters: DataTableFilters;
        previousFilters: DataTableFilters;
        source: EventSource;
      }>(),
      fields: {
        filters: '{ [columnId]: filter } — the active filters now; {} when none',
        previousFilters: '{ [columnId]: filter } — the filters before the change',
        source: sourceField,
      },
      example: {
        filters: { role: { type: 'select', values: ['Admin'] } },
        previousFilters: {},
        source: { id: 'users' },
      },
    },
    'state.onSearch': {
      description: 'The global search text changed, after the user paused typing (searchDebounce).',
      payload: payload<{ search: string; previousSearch: string; source: EventSource }>(),
      fields: {
        search: 'string — the search text now; empty when cleared',
        previousSearch: 'string — the search text before',
        source: sourceField,
      },
      example: { search: 'ayşe', previousSearch: '', source: { id: 'users' } },
    },
    'state.onPageSizeChange': {
      description: 'The user chose another number of rows per page.',
      payload: payload<{ pageSize: number; previousPageSize: number; source: EventSource }>(),
      fields: {
        pageSize: 'number — rows per page now',
        previousPageSize: 'number — rows per page before',
        source: sourceField,
      },
      example: { pageSize: 50, previousPageSize: 10, source: { id: 'users' } },
    },
    'state.onSelect': {
      description:
        'The selection changed: a row or page checkbox, “select all results”, clear selection, or a new filter or search ending “all results”.',
      payload: payload<{
        selection: DataTableSelection;
        previousSelection: DataTableSelection;
        source: EventSource;
      }>(),
      fields: {
        selection:
          '{ ids, allMatching } — the selected row ids; allMatching when every result of the query is selected',
        previousSelection: '{ ids, allMatching } — the selection before the change',
        source: sourceField,
      },
      example: {
        selection: { ids: ['17', '42'], allMatching: false },
        previousSelection: { ids: ['17'], allMatching: false },
        source: { id: 'users' },
      },
    },
    'state.onExpand': {
      description: "The user opened or closed a row's detail.",
      payload: payload<{
        rowId: string;
        expanded: boolean;
        expandedRowIds: string[];
        source: EventSource;
      }>(),
      fields: {
        rowId: 'string — the row whose detail opened or closed',
        expanded: 'boolean — true when it opened',
        expandedRowIds: 'string[] — every row whose detail is open now',
        source: sourceField,
      },
      example: { rowId: '42', expanded: true, expandedRowIds: ['42'], source: { id: 'users' } },
    },
    'interaction.onRowClick': {
      description: 'The user clicked a row outside its buttons, links and fields.',
      payload: payload<{ rowId: string; source: EventSource }>(),
      fields: { rowId: 'string — the clicked row', source: sourceField },
      example: { rowId: '42', source: { id: 'users' } },
    },
    'interaction.onRowAction': {
      description: "The user chose an action from a row's menu or context menu.",
      payload: payload<{ action: string; rowId: string; source: EventSource }>(),
      fields: {
        action: 'string — the action id',
        rowId: 'string — the row it applies to',
        source: sourceField,
      },
      example: { action: 'edit', rowId: '42', source: { id: 'users' } },
    },
    'interaction.onBulkAction': {
      description: 'The user chose an action from the bar shown while rows are selected.',
      payload: payload<{
        action: string;
        rowIds: string[];
        allMatching: boolean;
        source: EventSource;
      }>(),
      fields: {
        action: 'string — the action id',
        rowIds: 'string[] — the selected row ids',
        allMatching: 'boolean — true when every result of the current query is selected',
        source: sourceField,
      },
      example: {
        action: 'delete',
        rowIds: ['17', '42'],
        allMatching: false,
        source: { id: 'users' },
      },
    },
    'state.onColumnResize': {
      description:
        'A column was resized: at the end of a drag, per arrow key on the handle, or reset by double-click.',
      payload: payload<{
        columnId: string;
        width: number | null;
        previousWidth: number | null;
        source: EventSource;
      }>(),
      fields: {
        columnId: 'string — the resized column',
        width: 'number | null — the new width in pixels; null when reset to its default',
        previousWidth: 'number | null — the width before; null when it shared the free space',
        source: sourceField,
      },
      example: { columnId: 'email', width: 280, previousWidth: 200, source: { id: 'users' } },
    },
    'state.onColumnVisibilityChange': {
      description: 'The user showed or hid a column in the column chooser.',
      payload: payload<{ columnId: string; visible: boolean; source: EventSource }>(),
      fields: {
        columnId: 'string — the column',
        visible: 'boolean — true when it was shown',
        source: sourceField,
      },
      example: { columnId: 'createdAt', visible: false, source: { id: 'users' } },
    },
    'state.onColumnMove': {
      description: 'The user moved a column: by dragging its header, or with the column chooser.',
      payload: payload<{
        columnId: string;
        order: string[];
        previousOrder: string[];
        source: EventSource;
      }>(),
      fields: {
        columnId: 'string — the moved column',
        order: 'string[] — every column id in display order now, hidden ones included',
        previousOrder: 'string[] — the order before',
        source: sourceField,
      },
      example: {
        columnId: 'role',
        order: ['role', 'name', 'email'],
        previousOrder: ['name', 'role', 'email'],
        source: { id: 'users' },
      },
    },
    'state.onColumnPin': {
      description: 'The user pinned a column to the start or end side, or unpinned it.',
      payload: payload<{
        columnId: string;
        pinned: DataTableColumnPin | null;
        previousPinned: DataTableColumnPin | null;
        source: EventSource;
      }>(),
      fields: {
        columnId: 'string — the column',
        pinned: "'start' | 'end' | null — the side it is pinned to now; null when unpinned",
        previousPinned: "'start' | 'end' | null — the side before",
        source: sourceField,
      },
      example: { columnId: 'name', pinned: 'start', previousPinned: null, source: { id: 'users' } },
    },
    'state.onColumnsReset': {
      description:
        'The user reset the columns: order, visibility, widths and pinning are back to the defaults.',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField },
      example: { source: { id: 'users' } },
    },
    'interaction.onRowReorder': {
      description:
        'The user dropped a row in a new place: by dragging its handle, or with Space, the arrow keys and Space.',
      payload: payload<{
        rowId: string;
        targetRowId: string;
        position: DataTableDropPosition;
        fromIndex: number;
        toIndex: number;
        source: EventSource;
      }>(),
      fields: {
        rowId: 'string — the moved row',
        targetRowId: 'string — the row it was dropped on',
        position: "'before' | 'after' — the side of the target row",
        fromIndex: 'number — its index in data (server mode: in the page) before the move',
        toIndex: 'number — its index after the move',
        source: sourceField,
      },
      example: {
        rowId: '42',
        targetRowId: '7',
        position: 'before',
        fromIndex: 9,
        toIndex: 2,
        source: { id: 'users' },
      },
    },
    'interaction.onLoadMore': {
      description:
        'More rows were asked for: the view neared the end of the rows, or the user pressed "Load more".',
      payload: payload<{ loaded: number; trigger: 'scroll' | 'button'; source: EventSource }>(),
      fields: {
        loaded: 'number — rows loaded so far',
        trigger: "'scroll' | 'button' — what asked for them",
        source: sourceField,
      },
      example: { loaded: 50, trigger: 'scroll', source: { id: 'users' } },
    },
    'interaction.onCellEdit': {
      description:
        'The user saved an inline cell edit (onCellEdit accepted it). The value is not included: it may be sensitive.',
      payload: payload<{ rowId: string; columnId: string; source: EventSource }>(),
      fields: {
        rowId: 'string — the edited row',
        columnId: 'string — the edited column',
        source: sourceField,
      },
      example: { rowId: '42', columnId: 'email', source: { id: 'users' } },
    },
  },
);
