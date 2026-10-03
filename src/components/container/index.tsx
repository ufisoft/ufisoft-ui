import { clsx } from 'clsx';
import type { ElementType, HTMLAttributes, Ref } from 'react';
import type { Breakpoint, SpaceToken } from '../../tokens';
import styles from './container.module.css';

export type ContainerElement = 'div' | 'main' | 'section' | 'article' | 'header' | 'footer';
export type ContainerSize = Breakpoint | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Rendered element. Defaults to `div`. */
  as?: ContainerElement;
  /** Maximum width, one per breakpoint (`md` = 768px). `full` spans the whole parent. */
  size?: ContainerSize;
  ref?: Ref<HTMLElement>;
}

/** Centres page content at a maximum width, with side padding. */
export function Container({ as = 'div', size = 'xl', className, ...props }: ContainerProps) {
  // Public props are typed by the component; ElementType only bridges the element-specific ref type.
  const Tag = as as ElementType;
  return <Tag className={clsx(styles.container, styles[`size-${size}`], className)} {...props} />;
}

export type RowElement = 'div' | 'section' | 'ul' | 'ol' | 'form' | 'fieldset';
export type RowAlign = 'start' | 'center' | 'end' | 'stretch';

export interface RowProps extends HTMLAttributes<HTMLElement> {
  /** Rendered element. Defaults to `div`. */
  as?: RowElement;
  /** Space between columns and between wrapped rows, from the spacing scale. */
  gap?: SpaceToken;
  /** Vertical alignment of the columns. */
  align?: RowAlign;
  ref?: Ref<HTMLElement>;
}

/** A 12-column grid row. Its `Col`s wrap onto a new line when their spans exceed 12. */
export function Row({ as = 'div', gap = 'md', align = 'stretch', className, ...props }: RowProps) {
  const Tag = as as ElementType;
  return (
    <Tag
      className={clsx(styles.row, styles[`gap-${gap}`], styles[`align-${align}`], className)}
      {...props}
    />
  );
}

export type ColElement = 'div' | 'section' | 'article' | 'aside' | 'li';
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
/** One value for every screen, or values from a breakpoint up (`{ base: 12, md: 6 }`). */
export type ColValue = ColSpan | Partial<Record<'base' | Breakpoint, ColSpan>>;

export interface ColProps extends HTMLAttributes<HTMLElement> {
  /** Rendered element. Defaults to `div`; use `li` inside a `Row as="ul"`. */
  as?: ColElement;
  /** Columns this one covers, out of 12. Defaults to 12 (the whole row). */
  span?: ColValue;
  /** Column line it starts at (1–12). Defaults to the next free place in the row. */
  start?: ColValue;
  ref?: Ref<HTMLElement>;
}

function responsiveClasses(name: 'span' | 'start', value: ColValue | undefined) {
  if (value === undefined) return [];
  const values = typeof value === 'number' ? { base: value } : value;
  return Object.entries(values).map(([breakpoint, n]) =>
    breakpoint === 'base' ? styles[`${name}-${n}`] : styles[`${breakpoint}-${name}-${n}`],
  );
}

/** A column in a `Row`. */
export function Col({ as = 'div', span, start, className, ...props }: ColProps) {
  const Tag = as as ElementType;
  return (
    <Tag
      className={clsx(
        styles.col,
        responsiveClasses('span', span),
        responsiveClasses('start', start),
        className,
      )}
      {...props}
    />
  );
}
