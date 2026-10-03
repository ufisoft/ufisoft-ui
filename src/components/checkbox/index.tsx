'use client';

import { clsx } from 'clsx';
import { useEffect, useImperativeHandle, useRef, type ComponentProps, type ReactNode } from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { useEmit } from '../../events/react';
import { useFormField } from '../form-field';
import styles from './checkbox.module.css';

export interface CheckboxProps
  extends Omit<ComponentProps<'input'>, 'type' | 'children'>, EventDataProps {
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
  onChange,
  eventData,
  ...props
}: CheckboxProps) {
  const emit = useEmit();
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  // `indeterminate` exists only as a DOM property, not as an HTML attribute.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const fieldProps = useFormField({ ...props, 'aria-invalid': invalid ?? props['aria-invalid'] });

  return (
    <label className={clsx(styles.root, className)}>
      <input
        ref={inputRef}
        type="checkbox"
        className={styles.input}
        {...fieldProps}
        onChange={(event) => {
          onChange?.(event);
          emit('checkbox.state.onChange', {
            checked: event.target.checked,
            source: eventSource(props.id, props.name, eventData),
          });
        }}
      />
      {children != null && <span className={styles.label}>{children}</span>}
    </label>
  );
}
