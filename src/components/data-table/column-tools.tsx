'use client';

/**
 * DataTable's column management UI: the resize handle at a header's edge and the column chooser
 * (show/hide, order, pin). Internal: DataTable is the public component.
 */

import { clsx } from 'clsx';
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { flushSync } from 'react-dom';
import { EventScope } from '../../events/react';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { IconButton } from '../icon-button';
import { Popover } from '../popover';
import { Select } from '../select';
import styles from './data-table.module.css';
import type { DataTableColumnPin } from './columns';
import type { DataTableLabels } from '.';

const isRtl = (element: Element) => getComputedStyle(element).direction === 'rtl';

interface ResizeHandleProps {
  label: string;
  /** The column's set width, or undefined while it shares the free space. */
  width: number | undefined;
  min: number;
  max: number;
  /** The header cell's rendered width, for the start of a drag and for `aria-valuenow`. */
  measure: () => number;
  /** While dragging: the width to show. */
  onPreview: (width: number) => void;
  /** At the end of a drag, or per key press: the width to keep. */
  onCommit: (width: number) => void;
  /** Double-click: back to the column's default width. */
  onReset: () => void;
}

/**
 * A focusable separator at the header's end edge (the ARIA window splitter pattern): drag it, or
 * use the arrow keys (Shift for bigger steps), Home and End.
 */
export function ResizeHandle({
  label,
  width,
  min,
  max,
  measure,
  onPreview,
  onCommit,
  onReset,
}: ResizeHandleProps) {
  const drag = useRef<{ x: number; start: number; direction: number; width: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(0);
  const current = width ?? measured;

  // A column that shares the free space has no set width: announce its rendered one.
  useEffect(() => {
    const cell = ref.current?.parentElement;
    if (width !== undefined || !cell) return;
    const observer = new ResizeObserver(() =>
      setMeasured(Math.round(cell.getBoundingClientRect().width)),
    );
    observer.observe(cell);
    return () => observer.disconnect();
  }, [width]);

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    // No text selection, and no header drag (column reordering) from the handle.
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const start = width ?? measure();
    drag.current = {
      x: event.clientX,
      start,
      direction: isRtl(event.currentTarget) ? -1 : 1,
      width: start,
    };
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    state.width = Math.min(
      Math.max(Math.round(state.start + (event.clientX - state.x) * state.direction), min),
      max,
    );
    onPreview(state.width);
  }

  function endDrag() {
    const state = drag.current;
    drag.current = null;
    if (state) onCommit(state.width);
  }

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 50 : 10;
    const forward = isRtl(event.currentTarget) ? 'ArrowLeft' : 'ArrowRight';
    const back = isRtl(event.currentTarget) ? 'ArrowRight' : 'ArrowLeft';
    const start = width ?? measure();
    let next: number | null = null;
    if (event.key === forward) next = start + step;
    else if (event.key === back) next = start - step;
    else if (event.key === 'Home') next = min;
    else if (event.key === 'End') next = max;
    if (next === null) return;
    event.preventDefault();
    onCommit(Math.min(Math.max(Math.round(next), min), max));
  }

  return (
    // A focusable separator is a widget (ARIA window splitter), so it takes keys and pointer drags.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(current)}
      aria-valuemin={min}
      aria-valuemax={max}
      // The window splitter pattern: a focusable separator with a value.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={styles.resizeHandle}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={keyDown}
      onDoubleClick={onReset}
      onClick={(event) => event.stopPropagation()}
    />
  );
}

export interface ChooserColumn {
  id: string;
  label: string;
  visible: boolean;
  pinned: DataTableColumnPin | null;
  hideable: boolean;
}

interface ColumnChooserProps {
  /** Every column, hidden ones too, in display order. */
  columns: ChooserColumn[];
  onVisibleChange: (id: string, visible: boolean) => void;
  onStep: (id: string, step: -1 | 1) => void;
  onPin: (id: string, pin: DataTableColumnPin | null) => void;
  onReset: () => void;
  labels: DataTableLabels;
}

/** The “Columns” button: a popover that shows, hides, orders and pins columns. */
export function ColumnChooser({
  columns,
  onVisibleChange,
  onStep,
  onPin,
  onReset,
  labels,
}: ColumnChooserProps) {
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  const visibleCount = columns.filter((column) => column.visible).length;
  const groupOf = (column: ChooserColumn) =>
    columns.filter((other) => other.pinned === column.pinned);

  function step(column: ChooserColumn, direction: -1 | 1) {
    const group = groupOf(column);
    const position = group.indexOf(column) + direction;
    // Render the new order now, so focus can go back to the same button in it.
    flushSync(() => {
      onStep(column.id, direction);
      setAnnouncement(labels.columnMoved(column.label, position + 1, group.length));
    });
    const item = listRef.current?.querySelector(`[data-column-id="${CSS.escape(column.id)}"]`);
    const buttons = item ? [...item.querySelectorAll<HTMLButtonElement>('button[data-step]')] : [];
    // At the end of the group the button is disabled: use the other one.
    const target =
      buttons.find((button) => button.dataset.step === String(direction) && !button.disabled) ??
      buttons.find((button) => !button.disabled);
    target?.focus();
  }

  return (
    // The popover and its controls are DataTable's own parts: only datatable events are emitted.
    <EventScope silent>
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="end"
        aria-label={labels.columns}
        className={styles.chooserPopover}
        content={
          <EventScope silent>
            <div className={styles.chooser}>
              <p className={styles.filterTitle}>{labels.columns}</p>
              <ul ref={listRef} className={styles.chooserList} aria-label={labels.columns}>
                {columns.map((column) => {
                  const group = groupOf(column);
                  const index = group.indexOf(column);
                  return (
                    <li key={column.id} data-column-id={column.id} className={styles.chooserItem}>
                      <Checkbox
                        checked={column.visible}
                        // The last shown column stays: a table needs one.
                        disabled={!column.hideable || (column.visible && visibleCount === 1)}
                        onChange={(event) => onVisibleChange(column.id, event.target.checked)}
                        className={styles.chooserName}
                      >
                        {column.label}
                      </Checkbox>
                      <Select
                        size="sm"
                        aria-label={labels.pinColumn(column.label)}
                        value={column.pinned ?? ''}
                        onChange={(event) =>
                          onPin(
                            column.id,
                            (event.target.value || null) as DataTableColumnPin | null,
                          )
                        }
                        className={styles.chooserPin}
                      >
                        <option value="">{labels.notPinned}</option>
                        <option value="start">{labels.pinStart}</option>
                        <option value="end">{labels.pinEnd}</option>
                      </Select>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        data-step="-1"
                        aria-label={labels.moveUp(column.label)}
                        disabled={index === 0}
                        icon={<ArrowIcon direction="up" />}
                        onClick={() => step(column, -1)}
                      />
                      <IconButton
                        variant="ghost"
                        size="sm"
                        data-step="1"
                        aria-label={labels.moveDown(column.label)}
                        disabled={index === group.length - 1}
                        icon={<ArrowIcon direction="down" />}
                        onClick={() => step(column, 1)}
                      />
                    </li>
                  );
                })}
              </ul>
              <p role="status" className={styles.visuallyHidden}>
                {announcement}
              </p>
              <div className={styles.filterActions}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    onReset();
                    setAnnouncement('');
                  }}
                >
                  {labels.resetColumns}
                </Button>
              </div>
            </div>
          </EventScope>
        }
      >
        <Button size="sm" variant="secondary" className={styles.chooserButton}>
          <ColumnsIcon />
          {labels.columns}
        </Button>
      </Popover>
    </EventScope>
  );
}

function ArrowIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={clsx(direction === 'down' && styles.arrowDown)}
    >
      <path d="M8 13V3M4 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ColumnsIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={styles.chooserIcon}
    >
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M6 3v10M10 3v10" />
    </svg>
  );
}
