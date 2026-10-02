import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import type { ComponentProps, MouseEvent } from 'react';
import { Spinner } from '../spinner';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Shows a spinner and blocks activation while keeping the button focusable.
   * Ignored when `asChild` is set.
   */
  loading?: boolean;
  /**
   * Renders the single child element instead of a `<button>`, merging
   * button styles and props into it — e.g. a router link styled as a button.
   */
  asChild?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  asChild = false,
  type = 'button',
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const classes = clsx(styles.button, styles[variant], styles[size], className);

  if (asChild) {
    return (
      <Slot className={classes} onClick={onClick} {...props}>
        {children}
      </Slot>
    );
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // aria-disabled (not `disabled`) keeps focus on the button while loading,
    // so activation has to be blocked manually.
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      type={type}
      className={classes}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      data-loading={loading || undefined}
      onClick={handleClick}
      {...props}
    >
      {loading && <Spinner size="sm" className={styles.spinner} aria-hidden="true" />}
      <span className={styles.content}>{children}</span>
    </button>
  );
}
