import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import styles from './button-group.module.css';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupProps extends ComponentProps<'div'> {
  orientation?: ButtonGroupOrientation;
}

/**
 * Joins related buttons into one visual control. A `role="group"`; name it with `aria-label`.
 * Each child keeps its own Tab stop and its own props (`variant`, `size`, `disabled`).
 */
export function ButtonGroup({ orientation = 'horizontal', className, ...props }: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={clsx(styles.buttonGroup, styles[orientation], className)}
      {...props}
    />
  );
}
