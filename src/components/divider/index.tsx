import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import type { SpaceToken } from '../../tokens';
import styles from './divider.module.css';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends ComponentProps<'hr'> {
  orientation?: DividerOrientation;
  /** Space on both sides of the line, from the spacing scale. */
  spacing?: SpaceToken;
}

/** A thin line that separates content. A native `<hr>`, so it is announced as a separator. */
export function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  className,
  ...props
}: DividerProps) {
  return (
    <hr
      // <hr> is horizontal by default; the vertical one says so.
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      className={clsx(styles.divider, styles[orientation], styles[`spacing-${spacing}`], className)}
      {...props}
    />
  );
}
