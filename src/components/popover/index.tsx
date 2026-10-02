'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import styles from './popover.module.css';

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps extends Omit<ComponentProps<'div'>, 'content' | 'children'> {
  /** Interactive content: text, links, form controls, buttons. */
  content: ReactNode;
  /** The trigger: one button-like element that accepts `ref` and spreads props, e.g. `Button`. */
  children: ReactElement;
  /** Preferred side; it flips when there is no room. */
  side?: PopoverSide;
  align?: PopoverAlign;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Non-modal interactive content anchored to a trigger. Focus moves in on open and
 * back to the trigger on close; Escape and an outside click close it.
 * Positioning, focus and dismissal come from Radix Popover.
 */
export function Popover({
  content,
  children,
  side = 'bottom',
  align = 'center',
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...props
}: PopoverProps) {
  return (
    <RadixPopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{children}</RadixPopover.Trigger>
      {/* No portal: a portal to <body> would sit behind a modal <dialog> in the top layer. */}
      <RadixPopover.Content
        side={side}
        align={align}
        sideOffset={4}
        collisionPadding={8}
        className={clsx(styles.popover, className)}
        {...props}
      >
        {content}
      </RadixPopover.Content>
    </RadixPopover.Root>
  );
}
