'use client';

import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import { useFormField } from '../form-field';
import styles from './textarea.module.css';

export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends ComponentProps<'textarea'> {
  /** Visual size. Matches `Input` padding and font size. */
  size?: TextareaSize;
  /** Marks the value as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
}

export function Textarea({ size = 'md', invalid, rows = 3, className, ...props }: TextareaProps) {
  const fieldProps = useFormField({ ...props, 'aria-invalid': invalid ?? props['aria-invalid'] });

  return (
    <textarea
      rows={rows}
      className={clsx(styles.textarea, styles[size], className)}
      {...fieldProps}
    />
  );
}
