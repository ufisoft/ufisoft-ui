'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { prefixOffsets, rowRange } from './virtual';

/**
 * Measures rendered rows. Each measured element carries `data-measure-key`; the map holds its
 * height (border box) by that key.
 */
export function useRowHeights(enabled: boolean) {
  const [heights, setHeights] = useState<ReadonlyMap<string, number>>(() => new Map());
  const observer = useRef<ResizeObserver | null>(null);

  useEffect(() => () => observer.current?.disconnect(), []);

  /** A ref callback for a row: measured while it is rendered. */
  const measure = useCallback(
    (element: HTMLElement | null) => {
      if (!element || !enabled) return;
      observer.current ??= new ResizeObserver((entries) => {
        setHeights((previous) => {
          let next: Map<string, number> | null = null;
          for (const entry of entries) {
            const key = (entry.target as HTMLElement).dataset.measureKey;
            const height =
              entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
            if (!key || height <= 0 || previous.get(key) === height) continue;
            next ??= new Map(previous);
            next.set(key, height);
          }
          return next ?? previous;
        });
      });
      const current = observer.current;
      current.observe(element);
      return () => current.unobserve(element);
    },
    [enabled],
  );

  return { heights, measure };
}

interface VirtualRowsOptions {
  /** Render only the rows in view. */
  enabled: boolean;
  /** Listen to scrolling: for virtualization, or to load more rows near the end. */
  listen: boolean;
  /** Height of each row (with its open detail), measured or estimated. */
  heights: number[];
  overscan: number;
  /** Rows rendered before the first measurement, e.g. on the server. */
  initialCount: number;
  tableRef: RefObject<HTMLTableElement | null>;
  bodyRef: RefObject<HTMLTableSectionElement | null>;
  /** Called while the view is within one screen of the end. */
  onNearEnd?: () => void;
}

/**
 * The window of rows to render, from the scroll position of the table's scroll region (the
 * `maxHeight` box). Spacer rows stand in for the rest, so the scroll bar keeps its size.
 */
export function useVirtualRows({
  enabled,
  listen,
  heights,
  overscan,
  initialCount,
  tableRef,
  bodyRef,
  onNearEnd,
}: VirtualRowsOptions) {
  const offsets = prefixOffsets(heights);
  const [range, setRange] = useState<[number, number]>([0, initialCount]);
  const latest = useRef({ offsets, overscan, onNearEnd, enabled });
  useLayoutEffect(() => {
    latest.current = { offsets, overscan, onNearEnd, enabled };
  });

  const region = useCallback(() => tableRef.current?.parentElement ?? null, [tableRef]);

  /** Where the body starts inside the scroll region (below the caption and header). */
  const bodyTop = useCallback(
    (scroll: HTMLElement, body: HTMLElement) =>
      body.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop,
    [],
  );

  const update = useCallback(() => {
    const scroll = region();
    const body = bodyRef.current;
    if (!scroll || !body) return;
    const { offsets: current, overscan: extra, onNearEnd: nearEnd, enabled: on } = latest.current;
    if (on) {
      const next = rowRange(
        current,
        scroll.scrollTop - bodyTop(scroll, body),
        scroll.clientHeight,
        extra,
      );
      setRange((previous) =>
        previous[0] === next[0] && previous[1] === next[1] ? previous : next,
      );
    }
    const remaining = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight;
    if (scroll.clientHeight > 0 && remaining < scroll.clientHeight) nearEnd?.();
  }, [region, bodyRef, bodyTop]);

  useEffect(() => {
    const scroll = region();
    if (!listen || !scroll) return;
    scroll.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroll);
    return () => {
      scroll.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [listen, region, update]);

  // Other rows or heights (filtering, measuring, loading more): recompute after rendering.
  const total = offsets[offsets.length - 1] ?? 0;
  useEffect(() => {
    if (!listen) return;
    const timer = setTimeout(update, 0);
    return () => clearTimeout(timer);
  }, [listen, update, heights.length, total]);

  /** Scrolls just enough to show row `index` below the sticky header. */
  const scrollToIndex = useCallback(
    (index: number) => {
      const scroll = region();
      const body = bodyRef.current;
      const current = latest.current.offsets;
      if (!scroll || !body || index < 0 || index >= current.length - 1) return;
      const top = bodyTop(scroll, body);
      const header = tableRef.current?.tHead?.getBoundingClientRect().height ?? 0;
      const rowTop = top + (current[index] as number);
      const rowBottom = top + (current[index + 1] as number);
      if (rowTop - header < scroll.scrollTop) scroll.scrollTop = rowTop - header;
      else if (rowBottom > scroll.scrollTop + scroll.clientHeight) {
        scroll.scrollTop = rowBottom - scroll.clientHeight;
      }
    },
    [region, bodyRef, bodyTop, tableRef],
  );

  // A range past the end (rows were removed) falls back to the last rows.
  const count = heights.length;
  const shown: [number, number] =
    range[0] < count || count === 0
      ? [range[0], Math.min(range[1], count)]
      : [Math.max(count - initialCount, 0), count];

  return { offsets, range: shown, scrollToIndex };
}
