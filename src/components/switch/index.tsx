'use client';

import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { useEmit } from '../../events/react';
import { useFormField } from '../form-field';
import styles from './switch.module.css';

export interface SwitchProps
  extends Omit<ComponentProps<'input'>, 'type' | 'role' | 'children'>, EventDataProps {
  /** Visible label. Clicking it toggles the switch. */
  children?: ReactNode;
}

/** An on/off setting that takes effect immediately. A native checkbox with `role="switch"`. */
export function Switch({ children, className, onChange, eventData, ...props }: SwitchProps) {
  const fieldProps = useFormField(props);
  const emit = useEmit();

  return (
    <label className={clsx(styles.root, className)}>
      <input
        type="checkbox"
        role="switch"
        className={styles.input}
        {...fieldProps}
        onChange={(event) => {
          onChange?.(event);
          emit('switch.state.onChange', {
            checked: event.target.checked,
            source: eventSource(props.id, props.name, eventData),
          });
        }}
      />
      {children != null && <span className={styles.label}>{children}</span>}
    </label>
  );
}
