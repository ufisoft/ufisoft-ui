'use client';

import { clsx } from 'clsx';
import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { IconButton } from '../icon-button';
import styles from './modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps extends Omit<ComponentProps<'dialog'>, 'open' | 'title'> {
  /** Controlled open state. */
  open: boolean;
  /** Called when the user asks to close (Escape, backdrop click, close button). */
  onOpenChange: (open: boolean) => void;
  /** Dialog title; also its accessible name. */
  title: ReactNode;
  /** Optional supporting text; becomes the accessible description. */
  description?: ReactNode;
  /** Actions area, typically buttons. */
  footer?: ReactNode;
  size?: ModalSize;
  /** Accessible label of the close button. */
  closeLabel?: string;
}

/**
 * Built on the native `<dialog>` element: the browser provides the top layer,
 * focus containment, inert background, Escape handling and focus restoration.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = 'md',
  closeLabel = 'Close',
  className,
  children,
  onCancel,
  onClose,
  onClick,
  ref,
  ...props
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Escape: keep the dialog controlled — ask the owner instead of closing natively.
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    onCancel?.(event);
    event.preventDefault();
    onOpenChange(false);
  };

  // Closed natively (e.g. <form method="dialog">): sync the controlled state.
  const handleClose = (event: SyntheticEvent<HTMLDialogElement>) => {
    onClose?.(event);
    if (open) onOpenChange(false);
  };

  // A click whose target is the <dialog> itself landed on the backdrop.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    onClick?.(event);
    if (event.target === event.currentTarget) onOpenChange(false);
  };

  return (
    // The dialog element is interactive natively; click only adds backdrop dismissal.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className={clsx(styles.dialog, styles[size], className)}
      aria-labelledby={titleId}
      aria-describedby={description != null ? descriptionId : undefined}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleClick}
      {...props}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description != null && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
          </div>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={closeLabel}
            icon={<CloseIcon />}
            onClick={() => onOpenChange(false)}
          />
        </header>
        {children != null && <div className={styles.body}>{children}</div>}
        {footer != null && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}
