'use client';

import { clsx } from 'clsx';
import type { MouseEvent, ReactNode } from 'react';
import { eventSource } from '../../events/define-events';
import { EventScope, useEmit } from '../../events/react';
import { Button, type ButtonProps } from '../button';
import styles from './icon-button.module.css';

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'asChild'> {
  /** Decorative icon element. It is hidden from assistive technology. */
  icon: ReactNode;
  /** Required: an icon alone has no accessible name. */
  'aria-label': string;
}

export function IconButton({ icon, className, onClick, eventData, ...props }: IconButtonProps) {
  const emit = useEmit();
  return (
    // The inner Button is IconButton's own part: it emits iconbutton.interaction.onClick instead.
    <EventScope silent>
      <Button
        className={clsx(styles.iconButton, className)}
        // Button calls this only when the click is not blocked (loading).
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          emit('iconbutton.interaction.onClick', {
            label: props['aria-label'],
            source: eventSource(props.id, props.name, eventData),
          });
        }}
        {...props}
      >
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      </Button>
    </EventScope>
  );
}
