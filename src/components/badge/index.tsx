import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import styles from './badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends ComponentProps<'span'> {
  /** Colour by meaning; the text must carry the meaning on its own. */
  tone?: BadgeTone;
  size?: BadgeSize;
}

/** A short, non-interactive label for a status or category, e.g. “Draft” or “Published”. */
export function Badge({ tone = 'neutral', size = 'md', className, ...props }: BadgeProps) {
  return <span className={clsx(styles.badge, styles[tone], styles[size], className)} {...props} />;
}
