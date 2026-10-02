'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import styles from './tooltip.module.css';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps extends Omit<ComponentProps<'div'>, 'content' | 'children'> {
  /** Short text shown on hover and focus. Linked to the trigger with `aria-describedby`. */
  content: ReactNode;
  /** The trigger: one focusable element that accepts `ref` and spreads props, e.g. `Button`. */
  children: ReactElement;
  /** Preferred side; it flips when there is no room. */
  side?: TooltipSide;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A short hint for the element it wraps, shown on hover and keyboard focus.
 * Positioning, delay and dismissal come from Radix Tooltip.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...props
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        {/* No portal: a portal to <body> would sit behind a modal <dialog> in the top layer. */}
        <RadixTooltip.Content
          side={side}
          sideOffset={4}
          collisionPadding={8}
          className={clsx(styles.tooltip, className)}
          {...props}
        >
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
