import { clsx } from 'clsx';
import type { ElementType, HTMLAttributes, Ref } from 'react';
import styles from './text.module.css';

export type TextElement = 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';
export type TextSize = 'xs' | 'sm' | 'md' | 'lg';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'default' | 'muted' | 'subtle' | 'danger' | 'success';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Rendered element. Defaults to `p`. */
  as?: TextElement;
  size?: TextSize;
  weight?: TextWeight;
  tone?: TextTone;
  ref?: Ref<HTMLElement>;
}

export function Text({
  as = 'p',
  size = 'md',
  weight = 'regular',
  tone = 'default',
  className,
  ...props
}: TextProps) {
  // Public props are typed by the component; ElementType only bridges the element-specific ref type.
  const Tag = as as ElementType;
  return (
    <Tag
      className={clsx(styles.text, styles[size], styles[weight], styles[`tone-${tone}`], className)}
      {...props}
    />
  );
}
