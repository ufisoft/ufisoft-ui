'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react';

/** A cell by row key (`'header'` or a row id) and column key. */
export interface GridCell {
  row: string;
  col: string;
}

export const headerRow = 'header';

const focusableSelector =
  'a[href], button, input:not([type=hidden]), select, textarea, [tabindex]:not([data-cell-row])';
// Popups opened from a cell (filter dialog, menus, calendar) keep their own Tab order and keys.
const popupSelector = '[role="dialog"], [role="menu"], [role="listbox"]';

/** The focusable controls in a cell, leaving out open popups and disabled controls. */
function controlsIn(cell: HTMLElement): HTMLElement[] {
  return [...cell.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (element) =>
      !element.closest(popupSelector) &&
      !(element as HTMLButtonElement).disabled &&
      element.closest('[data-cell-row]') === cell,
  );
}

/** A control that keeps no arrow keys for itself: it can take the cell's place in the grid. */
function isSimple(element: HTMLElement): boolean {
  if (element instanceof HTMLAnchorElement || element instanceof HTMLButtonElement) return true;
  return element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type);
}

/**
 * Where focus goes for a cell: its only control when that control is simple (a checkbox, a
 * button, a link), otherwise the cell itself — Enter or F2 then moves into its controls.
 */
export function focusTarget(cell: HTMLElement): HTMLElement {
  if (cell.hasAttribute('data-editable')) return cell;
  const controls = controlsIn(cell);
  return controls.length === 1 && isSimple(controls[0] as HTMLElement)
    ? (controls[0] as HTMLElement)
    : cell;
}

interface GridOptions {
  enabled: boolean;
  tableRef: RefObject<HTMLTableElement | null>;
  /** Row keys in order: `'header'`, then the shown rows' ids. */
  rows: string[];
  /** Column keys in the order the cells are rendered. */
  cols: string[];
  /** Enter, F2 or a typed character on an editable cell. */
  onEdit: (cell: GridCell, typed: string | null) => void;
  /** Rows moved by PageUp / PageDown. */
  pageSize?: number;
}

/**
 * The ARIA grid keyboard model: one tab stop for the whole table; arrow keys, Home/End,
 * Ctrl+Home/End and PageUp/PageDown move between cells; Enter or F2 edits a cell or moves into its
 * controls, Tab cycles them and Escape returns to the cell.
 */
export function useGridNavigation({
  enabled,
  tableRef,
  rows,
  cols,
  onEdit,
  pageSize = 10,
}: GridOptions) {
  const [active, setActive] = useState<GridCell>({ row: headerRow, col: cols[0] ?? '' });
  // Set when the keyboard moved: focus follows after the next render.
  const pendingFocus = useRef(false);

  // The active cell, or the nearest valid one when its row or column went away.
  const current: GridCell = {
    row: rows.includes(active.row) ? active.row : (rows[1] ?? headerRow),
    col: cols.includes(active.col) ? active.col : (cols[0] ?? ''),
  };

  function cellElement(cell: GridCell): HTMLElement | null {
    const table = tableRef.current;
    if (!table) return null;
    const row =
      cell.row === headerRow
        ? table.tHead?.rows[0]
        : table.querySelector<HTMLTableRowElement>(`tr[data-row-id="${CSS.escape(cell.row)}"]`);
    return (row?.cells[cols.indexOf(cell.col)] as HTMLElement | undefined) ?? null;
  }

  // One tab stop: the active cell's focus target. Every other cell and control is out of the
  // Tab order. Runs after every render, since rows and controls change with it.
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!enabled || !table) return;
    // Cells of the header row and the data rows are grid cells (detail and message rows are not).
    for (const cell of table.tHead?.rows[0]?.cells ?? []) {
      cell.setAttribute('data-cell-row', headerRow);
    }
    for (const row of table.querySelectorAll<HTMLTableRowElement>('tbody tr[data-row-id]')) {
      for (const cell of row.cells) {
        cell.setAttribute('data-cell-row', row.dataset.rowId as string);
        // Explicit: not every browser and screen reader maps a grid's <td> to gridcell.
        if (cell.tagName === 'TD') cell.setAttribute('role', 'gridcell');
      }
    }
    const cells = table.querySelectorAll<HTMLElement>('[data-cell-row]');
    for (const cell of cells) {
      cell.tabIndex = -1;
      for (const control of controlsIn(cell)) control.tabIndex = -1;
    }
    const cell = cellElement(current);
    const target = cell && focusTarget(cell);
    if (target) target.tabIndex = 0;
    if (pendingFocus.current && target) {
      pendingFocus.current = false;
      target.focus();
    }
  });

  function move(to: GridCell) {
    pendingFocus.current = true;
    setActive(to);
    // Same cell again (e.g. after editing): the effect still has to move focus.
    if (to.row === current.row && to.col === current.col) {
      const cell = cellElement(to);
      if (cell) {
        pendingFocus.current = false;
        focusTarget(cell).focus();
      }
    }
  }

  /** Arrow keys and friends, in the capture phase so a cell's button or menu trigger does not act on them. */
  function onKeyDownCapture(event: KeyboardEvent<HTMLTableElement>) {
    if (!enabled) return;
    const target = event.target as HTMLElement;
    const cell = target.closest<HTMLElement>('[data-cell-row]');
    if (!cell || target.closest(popupSelector) || target.closest('[data-grid-keys="own"]')) return;
    // Only from the cell's tab stop; inside a cell's controls the keys belong to them.
    if (target !== cell && target !== focusTarget(cell)) return;

    const rowIndex = rows.indexOf(current.row);
    const colIndex = cols.indexOf(current.col);
    const rtl = getComputedStyle(cell).direction === 'rtl';
    const next = (row: number, col: number): GridCell => ({
      row: rows[Math.min(Math.max(row, 0), rows.length - 1)] as string,
      col: cols[Math.min(Math.max(col, 0), cols.length - 1)] as string,
    });
    let to: GridCell | null = null;
    switch (event.key) {
      case 'ArrowRight':
        to = next(rowIndex, colIndex + (rtl ? -1 : 1));
        break;
      case 'ArrowLeft':
        to = next(rowIndex, colIndex + (rtl ? 1 : -1));
        break;
      case 'ArrowDown':
        to = next(rowIndex + 1, colIndex);
        break;
      case 'ArrowUp':
        to = next(rowIndex - 1, colIndex);
        break;
      case 'PageDown':
        to = next(rowIndex + pageSize, colIndex);
        break;
      case 'PageUp':
        to = next(rowIndex - pageSize, colIndex);
        break;
      case 'Home':
        to = next(event.ctrlKey ? 0 : rowIndex, 0);
        break;
      case 'End':
        to = next(event.ctrlKey ? rows.length - 1 : rowIndex, cols.length - 1);
        break;
    }
    if (to) {
      event.preventDefault();
      event.stopPropagation();
      move(to);
      return;
    }

    const editable = cell.hasAttribute('data-editable');
    if (event.key === 'Enter' || event.key === 'F2') {
      if (editable) {
        event.preventDefault();
        event.stopPropagation();
        onEdit(current, null);
      } else if (target === cell) {
        // Into the cell's controls.
        const [first] = controlsIn(cell);
        if (first) {
          event.preventDefault();
          event.stopPropagation();
          first.focus();
        }
      }
    } else if (
      editable &&
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      // Typing on an editable cell starts editing with that character.
      event.preventDefault();
      event.stopPropagation();
      onEdit(current, event.key);
    }
  }

  /** Escape and Tab inside a cell's controls. */
  function onKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (!enabled || event.defaultPrevented) return;
    const target = event.target as HTMLElement;
    const cell = target.closest<HTMLElement>('[data-cell-row]');
    if (!cell || target === cell || target === focusTarget(cell)) return;
    if (target.closest(popupSelector) || target.closest('[data-cell-editor]')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      cell.focus();
    } else if (event.key === 'Tab') {
      const controls = controlsIn(cell);
      const index = controls.indexOf(target);
      const other = controls[index + (event.shiftKey ? -1 : 1)];
      // Within the cell; past its last control, Tab leaves the grid as usual.
      if (index >= 0 && other) {
        event.preventDefault();
        other.focus();
      }
    }
  }

  /** Focus anywhere in a cell (click, Tab back in) makes it the active cell. */
  function onFocus(event: FocusEvent<HTMLTableElement>) {
    if (!enabled) return;
    const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-cell-row]');
    if (!cell) return;
    const row = cell.getAttribute('data-cell-row') as string;
    const col = cols[(cell as HTMLTableCellElement).cellIndex];
    if (col && (row !== current.row || col !== current.col)) setActive({ row, col });
  }

  return {
    active: enabled ? current : null,
    /** Moves focus to a cell, e.g. back to an edited cell, or the next one after Tab. */
    focusCell: move,
    handlers: enabled ? { onKeyDownCapture, onKeyDown, onFocus } : {},
  };
}
