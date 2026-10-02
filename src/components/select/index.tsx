'use client';

import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import { useFormField } from '../form-field';
import styles from './select.module.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<ComponentProps<'select'>, 'size' | 'multiple'> {
  /** Visual size. Shares heights with `Input` and `Button`. */
  size?: SelectSize;
  /** Marks the value as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
}

export function Select({ size = 'md', invalid, className, ...props }: SelectProps) {
  const fieldProps = useFormField({ ...props, 'aria-invalid': invalid ?? props['aria-invalid'] });

  return <select className={clsx(styles.select, styles[size], className)} {...fieldProps} />;
}
