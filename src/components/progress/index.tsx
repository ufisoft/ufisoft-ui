import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import styles from './progress.module.css';

export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressTone = 'default' | 'success' | 'danger';

export interface ProgressProps extends Omit<ComponentProps<'progress'>, 'value' | 'children'> {
  /** Amount done, from 0 to `max`. Leave it out while the amount is unknown (indeterminate). */
  value?: number;
  /** Amount for “done”. Defaults to 100. */
  max?: number;
  size?: ProgressSize;
  tone?: ProgressTone;
}

/** Shows how much of a task is done. A native `<progress>`, named by `aria-label` or a `<label for>`. */
export function Progress({
  value,
  max = 100,
  size = 'md',
  tone = 'default',
  className,
  ...props
}: ProgressProps) {
  return (
    <progress
      // Out-of-range values are clamped, like the native element's own rendering.
      value={value === undefined ? undefined : Math.min(Math.max(value, 0), max)}
      max={max}
      className={clsx(styles.progress, styles[size], styles[`tone-${tone}`], className)}
      {...props}
    />
  );
}
