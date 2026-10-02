import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import styles from './card.module.css';

export type CardVariant = 'outlined' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends ComponentProps<'div'> {
  /** `outlined` sits on the page; `elevated` lifts off it with a shadow. */
  variant?: CardVariant;
  /** Inner spacing. Use `none` for edge-to-edge media and add padding inside. */
  padding?: CardPadding;
  /**
   * Renders the single child element instead of a `<div>`, merging card styles
   * and props into it — e.g. an `<article>`, `<section>` or `<li>`.
   */
  asChild?: boolean;
}

/** A surface that groups related content. Lay out its content with `Stack`, `Heading` and `Text`. */
export function Card({
  variant = 'outlined',
  padding = 'md',
  asChild = false,
  className,
  ...props
}: CardProps) {
  const Element = asChild ? Slot : 'div';
  return (
    <Element
      className={clsx(styles.card, styles[variant], styles[`padding-${padding}`], className)}
      {...props}
    />
  );
}
