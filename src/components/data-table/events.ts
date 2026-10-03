import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';
import type { DataTableFilters } from './filtering';
import type { DataTableSort } from './sorting';

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
  },
);
