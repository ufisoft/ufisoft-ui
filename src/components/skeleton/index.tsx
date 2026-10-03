import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import styles from './skeleton.module.css';

export type SkeletonShape = 'text' | 'rect' | 'circle';
export type SkeletonSize = 'sm' | 'md' | 'lg';

export interface SkeletonProps extends ComponentProps<'div'> {
  /** `text`: lines of text; `rect`: a block such as an image or card; `circle`: an avatar. */
  shape?: SkeletonShape;
  /** Number of lines for `shape="text"`; the last of several is shorter. */
  lines?: number;
  /** Height of `rect`, diameter of `circle` (the control heights). Set other sizes with `className`. */
  size?: SkeletonSize;
}

/**
 * A placeholder in the shape of content that is still loading.
 * It is hidden from assistive technology; mark the loading region with `aria-busy`.
 */
export function Skeleton({
  shape = 'text',
  lines = 1,
  size = 'md',
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(styles.skeleton, styles[shape], styles[size], className)}
      {...props}
    >
      {shape === 'text' &&
        Array.from({ length: Math.max(1, lines) }, (_, i) => (
          <span key={i} className={styles.line} />
        ))}
    </div>
  );
}
