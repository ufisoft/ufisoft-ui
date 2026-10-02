import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import styles from './spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends ComponentProps<'span'> {
  size?: SpinnerSize;
  /** Text announced to screen readers. */
  label?: string;
}

export function Spinner({ size = 'md', label = 'Loading', className, ...props }: SpinnerProps) {
  return (
    <span role="status" className={clsx(styles.spinner, styles[size], className)} {...props}>
      <span className={styles.circle} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </span>
  );
}
