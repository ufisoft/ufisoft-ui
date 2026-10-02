'use client';

import { clsx } from 'clsx';
import { useId, type ComponentProps, type ReactNode } from 'react';
import styles from './table.module.css';

export type TableCellAlign = 'start' | 'center' | 'end';

export interface TableProps extends ComponentProps<'table'> {
  /** The table's title. Required: it names the table and its scroll area. */
  caption: ReactNode;
}

/**
 * A native `<table>` for comparing structured data. Wide tables scroll
 * horizontally inside a focusable region named by the caption.
 */
export function Table({ caption, className, children, ...props }: TableProps) {
  const captionId = useId();
  return (
    // Focusable so keyboard users can scroll a wide table; named so it is announced on focus.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className={styles.scroll} role="region" aria-labelledby={captionId} tabIndex={0}>
      <table className={clsx(styles.table, className)} {...props}>
        <caption id={captionId} className={styles.caption}>
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export type TableHeaderProps = ComponentProps<'thead'>;

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead className={clsx(styles.header, className)} {...props} />;
}

export type TableBodyProps = ComponentProps<'tbody'>;

export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={clsx(styles.body, className)} {...props} />;
}

export type TableRowProps = ComponentProps<'tr'>;

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={clsx(styles.row, className)} {...props} />;
}

// The deprecated native `align` attribute is replaced by a logical one.
export interface TableHeadProps extends Omit<ComponentProps<'th'>, 'align'> {
  /** Use `end` for numbers so digits line up. */
  align?: TableCellAlign;
}

/** A header cell. `scope` defaults to `col`; use `scope="row"` for the first cell of a body row. */
export function TableHead({ align = 'start', scope = 'col', className, ...props }: TableHeadProps) {
  return <th scope={scope} className={clsx(styles.head, styles[align], className)} {...props} />;
}

export interface TableCellProps extends Omit<ComponentProps<'td'>, 'align'> {
  /** Use `end` for numbers so digits line up. */
  align?: TableCellAlign;
}

export function TableCell({ align = 'start', className, ...props }: TableCellProps) {
  return <td className={clsx(styles.cell, styles[align], className)} {...props} />;
}
