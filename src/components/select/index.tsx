'use client';

import { clsx } from 'clsx';
import { useRef, type ComponentProps } from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { useEmit } from '../../events/react';
import { useFormField } from '../form-field';
import styles from './select.module.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps
  extends Omit<ComponentProps<'select'>, 'size' | 'multiple'>, EventDataProps {
  /** Visual size. Shares heights with `Input` and `Button`. */
  size?: SelectSize;
  /** Marks the value as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
}

export function Select({
  size = 'md',
  invalid,
  className,
  onFocus,
  onChange,
  eventData,
  ...props
}: SelectProps) {
  const fieldProps = useFormField({ ...props, 'aria-invalid': invalid ?? props['aria-invalid'] });
  const emit = useEmit();
  // The value before a change: read when the select takes focus, which every user change follows.
  const previous = useRef('');

  return (
    <select
      className={clsx(styles.select, styles[size], className)}
      {...fieldProps}
      onFocus={(event) => {
        onFocus?.(event);
        previous.current = event.currentTarget.value;
      }}
      onChange={(event) => {
        onChange?.(event);
        const value = event.currentTarget.value;
        emit('select.state.onChange', {
          value,
          previousValue: previous.current,
          source: eventSource(props.id, props.name, eventData),
        });
        previous.current = value;
      }}
    />
  );
}
