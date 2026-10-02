import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';
import styles from './alert.module.css';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<ComponentProps<'div'>, 'title'> {
  tone?: AlertTone;
  /** Short summary shown above the content. */
  title?: ReactNode;
}

/**
 * `warning` and `danger` default to `role="alert"` (announced immediately);
 * `info` and `success` default to `role="status"` (announced politely).
 * Pass `role` to override, e.g. `role={undefined}` for static page content.
 */
const defaultRole: Record<AlertTone, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
};

export function Alert({ tone = 'info', title, className, children, ...props }: AlertProps) {
  return (
    <div
      role={defaultRole[tone]}
      className={clsx(styles.alert, styles[tone], className)}
      {...props}
    >
      {title != null && <div className={styles.title}>{title}</div>}
      {children != null && <div className={styles.content}>{children}</div>}
    </div>
  );
}
