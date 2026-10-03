/** DataTable's row selection: pure helpers, so they can be tested without rendering. */

export interface DataTableSelection {
  /** Ids of the selected rows (from `getRowId`). */
  ids: string[];
  /**
   * The user chose every row that matches the current filters and search, on every page. In server
   * mode `ids` then holds only the rows the table has seen: act on the query instead.
   */
  allMatching: boolean;
}

export const emptySelection: DataTableSelection = { ids: [], allMatching: false };

export type PageSelection = 'all' | 'some' | 'none';

/** Whether the selectable rows on the page are all, some or none selected. */
export function pageSelection(selection: DataTableSelection, pageIds: string[]): PageSelection {
  if (pageIds.length === 0) return 'none';
  if (selection.allMatching) return 'all';
  const ids = new Set(selection.ids);
  const count = pageIds.filter((id) => ids.has(id)).length;
  return count === 0 ? 'none' : count === pageIds.length ? 'all' : 'some';
}

export function isSelected(selection: DataTableSelection, id: string): boolean {
  return selection.allMatching || selection.ids.includes(id);
}

/**
 * Selects or clears one row. Clearing a row while every result is selected ends “all results”:
 * the rows on the page stay selected, except that one.
 */
export function toggleRow(
  selection: DataTableSelection,
  id: string,
  selected: boolean,
  pageIds: string[],
): DataTableSelection {
  if (selected) {
    return selection.ids.includes(id)
      ? selection
      : { ids: [...selection.ids, id], allMatching: selection.allMatching };
  }
  const base = selection.allMatching ? union(selection.ids, pageIds) : selection.ids;
  return { ids: base.filter((candidate) => candidate !== id), allMatching: false };
}

/** Selects or clears every selectable row on the page; other pages keep their selection. */
export function togglePage(
  selection: DataTableSelection,
  pageIds: string[],
  selected: boolean,
): DataTableSelection {
  if (selected) return { ids: union(selection.ids, pageIds), allMatching: selection.allMatching };
  const page = new Set(pageIds);
  return { ids: selection.ids.filter((id) => !page.has(id)), allMatching: false };
}

export function sameSelection(a: DataTableSelection, b: DataTableSelection): boolean {
  return (
    a.allMatching === b.allMatching &&
    a.ids.length === b.ids.length &&
    a.ids.every((id, index) => b.ids[index] === id)
  );
}

function union(a: string[], b: string[]): string[] {
  const seen = new Set(a);
  return [...a, ...b.filter((id) => !seen.has(id))];
}
