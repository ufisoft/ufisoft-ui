'use client';

import { clsx } from 'clsx';
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
  return <Modal className={clsx(styles.drawer, styles[side], className)} {...props} />;
}
