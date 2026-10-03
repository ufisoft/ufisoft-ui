/** DataTable's column management state: order, visibility, widths and pinning. Pure helpers. */

export type DataTableColumnPin = 'start' | 'end';

export interface DataTableColumnState {
  /** Column ids in display order (within each pinned group). */
  order: string[];
  /** Ids of hidden columns. */
  hidden: string[];
  /** Widths in pixels set by resizing (or pinning); other columns share the free space. */
  widths: Record<string, number>;
  /** Pinned columns stay in view while the table scrolls sideways. */
  pinned: Record<string, DataTableColumnPin>;
}

/** What a column contributes to the starting state. */
export interface ColumnDefaults {
  id: string;
  hidden?: boolean;
  pinned?: DataTableColumnPin;
}

/** The state the column definitions describe, before any user change. */
export function defaultColumnState(columns: ColumnDefaults[]): DataTableColumnState {
  return {
    order: columns.map((column) => column.id),
    hidden: columns.filter((column) => column.hidden).map((column) => column.id),
    widths: {},
    pinned: Object.fromEntries(
      columns.flatMap((column) => (column.pinned ? [[column.id, column.pinned]] : [])),
    ),
  };
}

/**
 * Fits a (possibly stored or partial) state to the current columns: unknown ids are dropped, new
 * columns are added at the end, and missing parts come from `fallback`.
 */
export function normalizeColumnState(
  state: Partial<DataTableColumnState> | undefined,
  fallback: DataTableColumnState,
): DataTableColumnState {
  const ids = new Set(fallback.order);
  const known = (id: string) => ids.has(id);
  const order = (state?.order ?? fallback.order).filter(known);
  const listed = new Set(order);
  return {
    order: [...order, ...fallback.order.filter((id) => !listed.has(id))],
    hidden: (state?.hidden ?? fallback.hidden).filter(known),
    widths: Object.fromEntries(
      Object.entries(state?.widths ?? fallback.widths).filter(
        ([id, width]) => known(id) && Number.isFinite(width) && width > 0,
      ),
    ),
    pinned: Object.fromEntries(
      Object.entries(state?.pinned ?? fallback.pinned).filter(
        ([id, pin]) => known(id) && (pin === 'start' || pin === 'end'),
      ),
    ),
  };
}

/** Reads a stored state; anything malformed gives `undefined`. */
export function parseColumnState(text: string | null): Partial<DataTableColumnState> | undefined {
  if (!text) return undefined;
  try {
    const value: unknown = JSON.parse(text);
    if (typeof value !== 'object' || value === null) return undefined;
    const { order, hidden, widths, pinned } = value as Record<string, unknown>;
    const strings = (list: unknown) =>
      Array.isArray(list) && list.every((item) => typeof item === 'string');
    const record = (map: unknown) => typeof map === 'object' && map !== null && !Array.isArray(map);
    return {
      ...(strings(order) && { order: order as string[] }),
      ...(strings(hidden) && { hidden: hidden as string[] }),
      ...(record(widths) && { widths: widths as Record<string, number> }),
      ...(record(pinned) && { pinned: pinned as Record<string, DataTableColumnPin> }),
    };
  } catch {
    return undefined;
  }
}

export function sameColumnState(a: DataTableColumnState, b: DataTableColumnState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** All columns in display order: pinned to the start, then unpinned, then pinned to the end. */
export function displayOrder(state: DataTableColumnState): string[] {
  const group = (pin: DataTableColumnPin | undefined) =>
    state.order.filter((id) => state.pinned[id] === pin);
  return [...group('start'), ...group(undefined), ...group('end')];
}

/** Moves `id` before or after `targetId`; both must be in the same pinned group. */
export function moveColumn(
  state: DataTableColumnState,
  id: string,
  targetId: string,
  side: 'before' | 'after',
): DataTableColumnState {
  if (id === targetId || state.pinned[id] !== state.pinned[targetId]) return state;
  const order = state.order.filter((candidate) => candidate !== id);
  const index = order.indexOf(targetId);
  if (index < 0) return state;
  order.splice(side === 'before' ? index : index + 1, 0, id);
  return { ...state, order };
}

/** Moves a column one place up or down within its pinned group, as the chooser lists them. */
export function stepColumn(
  state: DataTableColumnState,
  id: string,
  step: -1 | 1,
): DataTableColumnState {
  const group = displayOrder(state).filter((other) => state.pinned[other] === state.pinned[id]);
  const neighbour = group[group.indexOf(id) + step];
  return neighbour ? moveColumn(state, id, neighbour, step < 0 ? 'before' : 'after') : state;
}

export function setPinned(
  state: DataTableColumnState,
  id: string,
  pin: DataTableColumnPin | null,
): DataTableColumnState {
  const rest = Object.fromEntries(Object.entries(state.pinned).filter(([key]) => key !== id));
  return { ...state, pinned: pin ? { ...rest, [id]: pin } : rest };
}

export function setHidden(
  state: DataTableColumnState,
  id: string,
  hidden: boolean,
): DataTableColumnState {
  const others = state.hidden.filter((candidate) => candidate !== id);
  return { ...state, hidden: hidden ? [...others, id] : others };
}

export function setWidth(
  state: DataTableColumnState,
  id: string,
  width: number | null,
): DataTableColumnState {
  const rest = Object.fromEntries(Object.entries(state.widths).filter(([key]) => key !== id));
  return { ...state, widths: width === null ? rest : { ...rest, [id]: Math.round(width) } };
}

export function clampWidth(width: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(width), min), max);
}

/** Where a shown column sits: its pinned side and, when pinned, its sticky offset. */
export interface ColumnSlot {
  id: string;
  pinned: DataTableColumnPin | null;
  width: number | undefined;
  /** Sticky offset from its side: pixel widths of the pinned columns before it… */
  offset: number;
  /** …plus this many selection, detail or action columns. */
  controls: number;
  /** The last start-pinned or first end-pinned column draws the edge. */
  edge: boolean;
}

/**
 * Lays out the shown columns. `widthOf` gives a column's width, or undefined to share the free
 * space; pinned columns always have one. `controlsStart` / `controlsEnd` count the control columns
 * that are pinned along with them.
 */
export function layoutColumns(
  state: DataTableColumnState,
  widthOf: (id: string) => number | undefined,
  controlsStart: number,
  controlsEnd: number,
): ColumnSlot[] {
  const hidden = new Set(state.hidden);
  const shown = displayOrder(state).filter((id) => !hidden.has(id));
  const slots: ColumnSlot[] = shown.map((id) => ({
    id,
    pinned: state.pinned[id] ?? null,
    width: widthOf(id),
    offset: 0,
    controls: 0,
    edge: false,
  }));

  let offset = 0;
  const start = slots.filter((slot) => slot.pinned === 'start');
  for (const slot of start) {
    Object.assign(slot, { offset, controls: controlsStart });
    offset += slot.width ?? 0;
  }
  if (start.length > 0) (start[start.length - 1] as ColumnSlot).edge = true;

  offset = 0;
  const end = slots.filter((slot) => slot.pinned === 'end').reverse();
  for (const slot of end) {
    Object.assign(slot, { offset, controls: controlsEnd });
    offset += slot.width ?? 0;
  }
  if (end.length > 0) (end[end.length - 1] as ColumnSlot).edge = true;
  return slots;
}
