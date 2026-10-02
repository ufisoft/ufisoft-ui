import { clsx } from 'clsx';
import type { ElementType, HTMLAttributes, Ref } from 'react';
import type { SpaceToken } from '../../tokens';
import styles from './stack.module.css';

export type StackElement = 'div' | 'section' | 'ul' | 'ol' | 'nav' | 'form' | 'fieldset';
export type StackDirection = 'vertical' | 'horizontal';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Rendered element. Defaults to `div`. */
  as?: StackElement;
  direction?: StackDirection;
  /** Space between children, from the spacing scale. */
  gap?: SpaceToken;
  /** Cross-axis alignment. */
  align?: StackAlign;
  /** Main-axis distribution. */
  justify?: StackJustify;
  wrap?: boolean;
  ref?: Ref<HTMLElement>;
}

export function Stack({
  as = 'div',
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  ...props
}: StackProps) {
  // Public props are typed by the component; ElementType only bridges the element-specific ref type.
  const Tag = as as ElementType;
  return (
    <Tag
      className={clsx(
        styles.stack,
        styles[direction],
        styles[`gap-${gap}`],
        styles[`align-${align}`],
        styles[`justify-${justify}`],
        wrap && styles.wrap,
        className,
      )}
      {...props}
    />
  );
}
