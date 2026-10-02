'use client';

import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';
import { useFormField } from '../form-field';
import styles from './switch.module.css';

export interface SwitchProps extends Omit<ComponentProps<'input'>, 'type' | 'role' | 'children'> {
  /** Visible label. Clicking it toggles the switch. */
  children?: ReactNode;
}

/** An on/off setting that takes effect immediately. A native checkbox with `role="switch"`. */
export function Switch({ children, className, ...props }: SwitchProps) {
  const fieldProps = useFormField(props);

  return (
    <label className={clsx(styles.root, className)}>
      <input type="checkbox" role="switch" className={styles.input} {...fieldProps} />
      {children != null && <span className={styles.label}>{children}</span>}
    </label>
  );
}
