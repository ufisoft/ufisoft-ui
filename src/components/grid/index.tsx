import { clsx } from 'clsx';
import type { ElementType, HTMLAttributes, Ref } from 'react';
import type { Breakpoint, SpaceToken } from '../../tokens';
import styles from './grid.module.css';

export type GridElement = 'div' | 'section' | 'ul' | 'ol';
export type GridAlign = 'start' | 'center' | 'end' | 'stretch';
export type GridColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
/** One count for every screen, or counts from a breakpoint up (`{ base: 1, sm: 2, lg: 4 }`). */
export type GridColumns = GridColumnCount | Partial<Record<'base' | Breakpoint, GridColumnCount>>;

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** Rendered element. Defaults to `div`; use `ul` with `li` children for a list. */
  as?: GridElement;
  /** Number of equal columns. Defaults to 1. */
  columns?: GridColumns;
  /** Space between items, in both directions, from the spacing scale. */
  gap?: SpaceToken;
  /** Vertical alignment of the items in a line. */
  align?: GridAlign;
  ref?: Ref<HTMLElement>;
}

/** Lays out children in equal columns that wrap onto new lines; the column count can change per breakpoint. */
export function Grid({
  as = 'div',
  columns = 1,
  gap = 'md',
  align = 'stretch',
  className,
  ...props
}: GridProps) {
  // Public props are typed by the component; ElementType only bridges the element-specific ref type.
  const Tag = as as ElementType;
  const counts = typeof columns === 'number' ? { base: columns } : columns;
  return (
    <Tag
      className={clsx(
        styles.grid,
        Object.entries(counts).map(([breakpoint, n]) =>
          breakpoint === 'base' ? styles[`columns-${n}`] : styles[`${breakpoint}-columns-${n}`],
        ),
        styles[`gap-${gap}`],
        styles[`align-${align}`],
        className,
      )}
      {...props}
    />
  );
}
