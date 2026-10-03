'use client';

import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { useEmit } from '../../events/react';
import styles from './dropdown-menu.module.css';

export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left';
export type DropdownMenuAlign = 'start' | 'center' | 'end';
export type DropdownMenuItemTone = 'default' | 'danger';

export interface DropdownMenuProps
  extends Omit<ComponentProps<'div'>, 'content' | 'children'>, EventDataProps {
  /** The menu: `DropdownMenuItem`, `DropdownMenuSeparator` and `DropdownMenuLabel`. */
  content: ReactNode;
  /** The trigger: one button-like element that accepts `ref` and spreads props, e.g. `Button`. */
  children: ReactElement;
  /** Preferred side; it flips when there is no room. */
  side?: DropdownMenuSide;
  align?: DropdownMenuAlign;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A list of actions opened from a trigger. Roving focus, typeahead and
 * dismissal come from Radix DropdownMenu.
 */
export function DropdownMenu({
  content,
  children,
  side = 'bottom',
  align = 'start',
  open,
  defaultOpen,
  onOpenChange,
  eventData,
  className,
  ...props
}: DropdownMenuProps) {
  const emit = useEmit();
  return (
    // Non-modal: no scroll lock and no aria-hidden on the rest of the page, like Popover.
    <RadixMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => {
        onOpenChange?.(next);
        emit(next ? 'dropdownmenu.state.onOpen' : 'dropdownmenu.state.onClose', {
          source: eventSource(props.id, undefined, eventData),
        });
      }}
      modal={false}
    >
      <RadixMenu.Trigger asChild>{children}</RadixMenu.Trigger>
      {/* No portal: a portal to <body> would sit behind a modal <dialog> in the top layer. */}
      <RadixMenu.Content
        side={side}
        align={align}
        sideOffset={4}
        collisionPadding={8}
        // A long menu scrolls; its container must be focusable for keyboard scrolling.
        // No extra tab stop: Radix blocks Tab inside the menu.
        tabIndex={0}
        className={clsx(styles.content, className)}
        {...props}
      >
        {content}
      </RadixMenu.Content>
    </RadixMenu.Root>
  );
}

export interface DropdownMenuItemProps
  extends Omit<ComponentProps<'div'>, 'onSelect'>, EventDataProps {
  /** Called when the item is chosen by click, Enter or Space. The menu then closes. */
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  tone?: DropdownMenuItemTone;
  /** Render the consumer's element instead, e.g. a router link. */
  asChild?: boolean;
  /** Text used for typeahead when the children are not plain text. */
  textValue?: string;
}

export function DropdownMenuItem({
  tone = 'default',
  onSelect,
  eventData,
  className,
  ...props
}: DropdownMenuItemProps) {
  const emit = useEmit();
  return (
    <RadixMenu.Item
      className={clsx(styles.item, tone === 'danger' && styles.danger, className)}
      onSelect={(event) => {
        onSelect?.(event);
        emit('dropdownmenu.interaction.onSelect', {
          label:
            props.textValue ?? (typeof props.children === 'string' ? props.children : undefined),
          source: eventSource(props.id, undefined, eventData),
        });
      }}
      {...props}
    />
  );
}

export type DropdownMenuSeparatorProps = ComponentProps<'div'>;

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return <RadixMenu.Separator className={clsx(styles.separator, className)} {...props} />;
}

export type DropdownMenuLabelProps = ComponentProps<'div'>;

/** A non-interactive heading for the items that follow. */
export function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  return <RadixMenu.Label className={clsx(styles.label, className)} {...props} />;
}
