/** DataTable's row virtualization and row reordering: pure helpers. */

/** Start offsets of each row plus the total height at the end (length = heights.length + 1). */
export function prefixOffsets(heights: number[]): number[] {
  const offsets = new Array<number>(heights.length + 1);
  offsets[0] = 0;
  for (let i = 0; i < heights.length; i++) {
    offsets[i + 1] = (offsets[i] as number) + (heights[i] as number);
  }
  return offsets;
}

/** The row at height `y`: the last row that starts at or before it (binary search). */
export function rowAt(offsets: number[], y: number): number {
  const count = offsets.length - 1;
  if (count <= 0) return 0;
  let low = 0;
  let high = count - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if ((offsets[middle] as number) <= y) low = middle;
    else high = middle - 1;
  }
  return low;
}

/** Rows to render for a view from `top` to `top + height`, with `overscan` rows on each side. */
export function rowRange(
  offsets: number[],
  top: number,
  height: number,
  overscan: number,
): [start: number, end: number] {
  const count = offsets.length - 1;
  if (count <= 0) return [0, 0];
  const first = rowAt(offsets, Math.max(top, 0));
  const last = rowAt(offsets, Math.max(top + height, 0));
  return [Math.max(first - overscan, 0), Math.min(last + overscan + 1, count)];
}

/** The rows to render: the range, plus rows that must stay (focused, dragged), in order. */
export function renderedRows(count: number, [start, end]: [number, number], keep: number[]) {
  const rows = new Set<number>();
  for (let i = Math.min(start, count); i < Math.min(end, count); i++) rows.add(i);
  for (const index of keep) if (index >= 0 && index < count) rows.add(index);
  return [...rows].sort((a, b) => a - b);
}

export type DataTableDropPosition = 'before' | 'after';

/** Where a row at `from` ends up when dropped before or after the row at `target` (same list). */
export function dropIndex(from: number, target: number, position: DataTableDropPosition): number {
  // Index of the target once the moved row is taken out.
  const shifted = target > from ? target - 1 : target;
  return position === 'before' ? shifted : shifted + 1;
}

/**
 * The drop that puts the row at `from` in list position `to` (keyboard moves): before the row
 * now there when moving up, after it when moving down. Null when it stays.
 */
export function dropAt(
  from: number,
  to: number,
): { target: number; position: DataTableDropPosition } | null {
  if (to === from) return null;
  return { target: to, position: to < from ? 'before' : 'after' };
}

/** Moves one item of an array, e.g. `data` after `onRowReorder`. Returns a new array. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length) return [...items];
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}
