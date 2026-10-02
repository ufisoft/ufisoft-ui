import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import styles from './label.module.css';

export interface LabelProps extends ComponentProps<'label'> {
  /**
   * Shows a visual required marker. It is purely visual: mark the control
   * itself `required` so assistive technology announces it.
   */
  required?: boolean;
}

export function Label({ required = false, className, children, ...props }: LabelProps) {
  return (
    <label className={clsx(styles.label, className)} {...props}>
      {children}
      {required && (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
