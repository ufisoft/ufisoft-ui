import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import styles from './heading.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface HeadingProps extends ComponentProps<'h2'> {
  /** Document outline level (`h1`–`h6`). Choose it for structure, not looks. */
  level?: HeadingLevel;
  /** Visual size. Defaults to the size matching `level`. */
  size?: HeadingSize;
}

const defaultSizeByLevel: Record<HeadingLevel, HeadingSize> = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'md',
  5: 'sm',
  6: 'xs',
};

export function Heading({ level = 2, size, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={clsx(
        styles.heading,
        styles[`size-${size ?? defaultSizeByLevel[level]}`],
        className,
      )}
      {...props}
    />
  );
}
