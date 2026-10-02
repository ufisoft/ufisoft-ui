'use client';

import { clsx } from 'clsx';
import { useEffect, useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { useFormField } from '../form-field';
import styles from './checkbox.module.css';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'children'> {
  /** Visible label. Clicking it toggles the checkbox. */
  children?: ReactNode;
  /** Mixed state, e.g. for a "select all" checkbox. Visual and announced; not a value. */
  indeterminate?: boolean;
  /** Marks the value as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
}

export function Checkbox({
  children,
  indeterminate = false,
  invalid,
  className,
  ref,
  ...props
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  // `indeterminate` exists only as a DOM property, not as an HTML attribute.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const fieldProps = useFormField({ ...props, 'aria-invalid': invalid ?? props['aria-invalid'] });

  return (
    <label className={clsx(styles.root, className)}>
      <input ref={inputRef} type="checkbox" className={styles.input} {...fieldProps} />
      {children != null && <span className={styles.label}>{children}</span>}
    </label>
  );
}
