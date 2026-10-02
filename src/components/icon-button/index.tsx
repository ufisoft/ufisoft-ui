import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '../button';
import styles from './icon-button.module.css';

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'asChild'> {
  /** Decorative icon element. It is hidden from assistive technology. */
  icon: ReactNode;
  /** Required: an icon alone has no accessible name. */
  'aria-label': string;
}

export function IconButton({ icon, className, ...props }: IconButtonProps) {
  return (
    <Button className={clsx(styles.iconButton, className)} {...props}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    </Button>
  );
}
