'use client';

import { clsx } from 'clsx';
import { useEffect, useEffectEvent, useRef } from 'react';
import { eventSource } from '../../events/define-events';
import { EventScope, useEmit } from '../../events/react';
import { Modal, type ModalProps, type ModalSize } from '../modal';
import styles from './drawer.module.css';

export type DrawerSide = 'start' | 'end' | 'bottom';
export type DrawerSize = ModalSize;

export interface DrawerProps extends ModalProps {
  /** Edge the panel is attached to. `start` / `end` follow the writing direction. */
  side?: DrawerSide;
  /** Width of a `start` / `end` panel, as Modal's sizes. A `bottom` panel fits its content. */
  size?: DrawerSize;
}

/**
 * A `Modal` attached to an edge of the screen: the same native `<dialog>`, title, close button,
 * footer, focus handling and scroll lock, placed as a full-height (or full-width) panel.
 */
export function Drawer({ side = 'end', className, ...props }: DrawerProps) {
  const emit = useEmit();
  const wasOpen = useRef(false);
  const reportOpenChange = useEffectEvent((isOpen: boolean) => {
    emit(isOpen ? 'drawer.state.onOpen' : 'drawer.state.onClose', {
      side,
      source: eventSource(props.id, undefined, props.eventData),
    });
  });
  useEffect(() => {
    if (props.open === wasOpen.current) return;
    wasOpen.current = props.open;
    reportOpenChange(props.open);
  }, [props.open]);

  return (
    // The Modal inside is Drawer's own part: drawer events replace modal events.
    <EventScope silent>
      <Modal className={clsx(styles.drawer, styles[side], className)} {...props} />
    </EventScope>
  );
}
