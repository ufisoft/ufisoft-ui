'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { EventScope, useEmit } from '../../events/react';
import styles from './popover.module.css';

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps
  extends Omit<ComponentProps<'div'>, 'content' | 'children'>, EventDataProps {
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
  eventData,
  className,
  ...props
}: PopoverProps) {
  const emit = useEmit();
  return (
    <RadixPopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => {
        onOpenChange?.(next);
        emit(next ? 'popover.state.onOpen' : 'popover.state.onClose', {
          source: eventSource(props.id, undefined, eventData),
        });
      }}
    >
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
        {/* The content is the application's: it emits even when a composite silences this Popover. */}
        <EventScope silent={false}>{content}</EventScope>
      </RadixPopover.Content>
    </RadixPopover.Root>
  );
}
