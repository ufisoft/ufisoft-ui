/** DataTable's saved views: what a view holds, and reading it back from storage. */

import type { DataTableColumnState } from './columns';
import type { DataTableFilters } from './filtering';
import type { DataTableSort } from './sorting';

/** Everything a view restores. */
export interface DataTableViewState {
  sort: DataTableSort[];
  filters: DataTableFilters;
  search: string;
  /** Rows per page; absent without paging. */
  pageSize?: number;
  columns: DataTableColumnState;
  groupBy: string[];
}

export interface DataTableView {
  id: string;
  name: string;
  state: DataTableViewState;
}

/** Adds a view, or replaces the one with the same name (ignoring case). */
export function saveView(views: DataTableView[], view: DataTableView): DataTableView[] {
  const same = (other: DataTableView) =>
    other.name.trim().toLowerCase() === view.name.trim().toLowerCase();
  const existing = views.find(same);
  return existing
    ? views.map((other) => (other === existing ? { ...view, id: existing.id } : other))
    : [...views, view];
}

/** Date filters hold Dates; JSON stores them as text. */
function reviveFilters(filters: unknown): DataTableFilters {
  if (typeof filters !== 'object' || filters === null) return {};
  const revived: DataTableFilters = {};
  for (const [id, filter] of Object.entries(filters as Record<string, unknown>)) {
    if (typeof filter !== 'object' || filter === null) continue;
    const value = filter as Record<string, unknown>;
    if (value.type === 'date') {
      const day = (text: unknown) =>
        typeof text === 'string' || text instanceof Date ? new Date(text) : null;
      revived[id] = { type: 'date', from: day(value.from), to: day(value.to) };
    } else {
      revived[id] = value as DataTableFilters[string];
    }
  }
  return revived;
}

/** Reads stored views; anything malformed is skipped. Columns are fitted later, to the columns. */
export function parseViews(text: string | null): DataTableView[] | undefined {
  if (!text) return undefined;
  try {
    const value: unknown = JSON.parse(text);
    if (!Array.isArray(value)) return undefined;
    return value.flatMap((item): DataTableView[] => {
      if (typeof item !== 'object' || item === null) return [];
      const { id, name, state } = item as Record<string, unknown>;
      if (typeof id !== 'string' || typeof name !== 'string' || typeof state !== 'object' || !state)
        return [];
      const s = state as Record<string, unknown>;
      return [
        {
          id,
          name,
          state: {
            sort: Array.isArray(s.sort) ? (s.sort as DataTableSort[]) : [],
            filters: reviveFilters(s.filters),
            search: typeof s.search === 'string' ? s.search : '',
            pageSize: typeof s.pageSize === 'number' ? s.pageSize : undefined,
            columns: (s.columns ?? {}) as DataTableColumnState,
            groupBy: Array.isArray(s.groupBy) ? (s.groupBy as string[]) : [],
          },
        },
      ];
    });
  } catch {
    return undefined;
  }
}
