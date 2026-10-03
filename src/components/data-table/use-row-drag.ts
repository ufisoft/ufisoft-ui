'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { dropAt, type DataTableDropPosition } from './virtual';

export interface RowDropTarget {
  id: string;
  position: DataTableDropPosition;
}

interface RowDrag {
  id: string;
  mode: 'pointer' | 'keyboard';
  target: RowDropTarget | null;
  /** Keyboard: the list position the row would move to. */
  to: number;
}

interface RowDragLabels {
  rowPickedUp: (row: string, position: number, count: number) => string;
  rowMoved: (row: string, position: number, count: number) => string;
  rowDropped: (row: string, position: number, count: number) => string;
  rowDragCancelled: (row: string) => string;
}

interface RowDragOptions {
  /** Row ids in the order shown. */
  ids: string[];
  labelOf: (id: string) => string;
  tableRef: RefObject<HTMLTableElement | null>;
  scrollToIndex: (index: number) => void;
  onDrop: (id: string, target: RowDropTarget) => void;
  labels: RowDragLabels;
}

/** Pixels the pointer moves before a press on the handle becomes a drag. */
const threshold = 4;
/** Distance from the scroll region's edge where dragging scrolls it. */
const edge = 40;

/**
 * Row drag and drop from a handle: with a pointer (mouse, pen, touch), or with the keyboard —
 * Space or Enter picks the row up, the arrow keys move it, Space or Enter drops, Escape cancels.
 * Every keyboard step is announced through `announcement` (render it in a status region).
 */
export function useRowDrag({
  ids,
  labelOf,
  tableRef,
  scrollToIndex,
  onDrop,
  labels,
}: RowDragOptions) {
  const [drag, setDragState] = useState<RowDrag | null>(null);
  // The live drag for event handlers: pointermove is not rendered before a quick pointerup, so
  // state read in a handler can be one event behind.
  const live = useRef<RowDrag | null>(null);
  const setDrag = (next: RowDrag | null) => {
    live.current = next;
    setDragState(next);
  };
  const [announcement, setAnnouncement] = useState('');
  const pending = useRef<{ id: string; y: number } | null>(null);
  const pointerY = useRef(0);
  const autoScroll = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(autoScroll.current), []);

  const region = () => tableRef.current?.parentElement ?? null;

  /** The row under the pointer: before it in its top half, after it in its bottom half. */
  function targetAt(y: number, id: string): RowDropTarget | null {
    const rows = [...(tableRef.current?.tBodies[0]?.querySelectorAll('tr[data-row-id]') ?? [])];
    let target: RowDropTarget | null = null;
    for (const row of rows) {
      const rect = row.getBoundingClientRect();
      const rowId = (row as HTMLElement).dataset.rowId as string;
      if (y < rect.top + rect.height / 2) {
        target = { id: rowId, position: 'before' };
        break;
      }
      target = { id: rowId, position: 'after' };
    }
    return target && target.id !== id ? target : null;
  }

  function stopAutoScroll() {
    clearInterval(autoScroll.current);
    autoScroll.current = undefined;
  }

  /** Near the top or bottom of the scroll region, keep scrolling while the pointer stays. */
  function followEdge(id: string) {
    const scroll = region();
    if (!scroll) return;
    const rect = scroll.getBoundingClientRect();
    const header = tableRef.current?.tHead?.getBoundingClientRect().bottom ?? rect.top;
    const step =
      pointerY.current < Math.max(rect.top, header) + edge
        ? -8
        : pointerY.current > rect.bottom - edge
          ? 8
          : 0;
    if (step === 0) return stopAutoScroll();
    if (autoScroll.current !== undefined) return;
    autoScroll.current = setInterval(() => {
      scroll.scrollTop += step;
      const current = live.current;
      if (current) setDrag({ ...current, target: targetAt(pointerY.current, id) });
    }, 16);
  }

  function finish(commit: boolean) {
    stopAutoScroll();
    pending.current = null;
    const current = live.current;
    if (commit && current?.target) onDrop(current.id, current.target);
    setDrag(null);
  }

  function handleProps(id: string) {
    const label = labelOf(id);
    const count = ids.length;
    return {
      onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
        if (event.button !== 0) return;
        // No text selection while dragging; keep focus on the handle for Escape.
        event.preventDefault();
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        pending.current = { id, y: event.clientY };
      },
      onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
        const drag = live.current;
        pointerY.current = event.clientY;
        const start = pending.current;
        if (drag?.mode === 'keyboard') return;
        if (!drag && (!start || Math.abs(event.clientY - start.y) < threshold)) return;
        const target = targetAt(event.clientY, id);
        setDrag({ id, mode: 'pointer', target, to: -1 });
        followEdge(id);
      },
      onPointerUp() {
        finish(live.current?.mode === 'pointer');
      },
      onPointerCancel() {
        finish(false);
      },
      onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        const drag = live.current;
        const from = ids.indexOf(id);
        const picking = event.key === ' ' || event.key === 'Enter';
        if (!drag || drag.id !== id) {
          if (!picking) return;
          event.preventDefault();
          setDrag({ id, mode: 'keyboard', target: null, to: from });
          setAnnouncement(labels.rowPickedUp(label, from + 1, count));
          return;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          finish(false);
          setAnnouncement(labels.rowDragCancelled(label));
        } else if (picking && drag.mode === 'keyboard') {
          event.preventDefault();
          finish(true);
          setAnnouncement(labels.rowDropped(label, (drag.target ? drag.to : from) + 1, count));
        } else if (
          (event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
          drag.mode === 'keyboard'
        ) {
          event.preventDefault();
          const to = Math.min(Math.max(drag.to + (event.key === 'ArrowUp' ? -1 : 1), 0), count - 1);
          const drop = dropAt(from, to);
          setDrag({
            ...drag,
            to,
            target: drop ? { id: ids[drop.target] as string, position: drop.position } : null,
          });
          scrollToIndex(to);
          setAnnouncement(labels.rowMoved(label, to + 1, count));
        }
      },
      onBlur() {
        const drag = live.current;
        if (drag?.id !== id || drag.mode !== 'keyboard') return;
        finish(false);
        setAnnouncement(labels.rowDragCancelled(label));
      },
    };
  }

  return { drag, announcement, handleProps };
}
