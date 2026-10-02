'use client';

import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import { useFormField } from '../form-field';
import styles from './input.module.css';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  /** Visual size. Use the native `htmlSize` for the character-width attribute. */
  size?: InputSize;
  htmlSize?: number;
  /** Marks the value as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
}

export function Input({
  size = 'md',
  htmlSize,
  invalid,
  type = 'text',
  className,
  ...props
}: InputProps) {
  const fieldProps = useFormField({ ...props, 'aria-invalid': invalid ?? props['aria-invalid'] });

  return (
    <input
      type={type}
      size={htmlSize}
      className={clsx(styles.input, styles[size], className)}
      {...fieldProps}
    />
  );
}
