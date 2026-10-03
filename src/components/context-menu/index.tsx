'use client';

import * as RadixContextMenu from '@radix-ui/react-context-menu';
import { clsx } from 'clsx';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { useEmit } from '../../events/react';
import styles from './context-menu.module.css';

export type ContextMenuItemTone = 'default' | 'danger';

export interface ContextMenuProps
  extends Omit<ComponentProps<'div'>, 'content' | 'children'>, EventDataProps {
  /** The menu: `ContextMenuItem`, `ContextMenuSeparator` and `ContextMenuLabel`. */
  content: ReactNode;
  /** The area that opens the menu: one element that accepts `ref` and spreads props. Make it focusable. */
  children: ReactElement;
  onOpenChange?: (open: boolean) => void;
  /** Leaves the browser's own context menu in place. */
  disabled?: boolean;
}

/**
 * A list of actions opened at the pointer by right-click or long-press, or by the
 * Menu key / Shift+F10 on the focused area. Behaviour comes from Radix ContextMenu.
 */
export function ContextMenu({
  content,
  children,
  onOpenChange,
  disabled,
  eventData,
  className,
  ...props
}: ContextMenuProps) {
  const emit = useEmit();
  return (
    // Non-modal: no scroll lock and no aria-hidden on the rest of the page, like DropdownMenu.
    <RadixContextMenu.Root
      onOpenChange={(next) => {
        onOpenChange?.(next);
        emit(next ? 'contextmenu.state.onOpen' : 'contextmenu.state.onClose', {
          source: eventSource(props.id, undefined, eventData),
        });
      }}
      modal={false}
    >
      <RadixContextMenu.Trigger asChild disabled={disabled}>
        {children}
      </RadixContextMenu.Trigger>
      {/* No portal: a portal to <body> would sit behind a modal <dialog> in the top layer. */}
      <RadixContextMenu.Content
        collisionPadding={8}
        // A long menu scrolls; its container must be focusable for keyboard scrolling.
        tabIndex={0}
        className={clsx(styles.content, className)}
        {...props}
      >
        {content}
      </RadixContextMenu.Content>
    </RadixContextMenu.Root>
  );
}

export interface ContextMenuItemProps
  extends Omit<ComponentProps<'div'>, 'onSelect'>, EventDataProps {
  /** Called when the item is chosen by click, Enter or Space. The menu then closes. */
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  tone?: ContextMenuItemTone;
  /** Render the consumer's element instead, e.g. a router link. */
  asChild?: boolean;
  /** Text used for typeahead when the children are not plain text. */
  textValue?: string;
}

export function ContextMenuItem({
  tone = 'default',
  onSelect,
  eventData,
  className,
  ...props
}: ContextMenuItemProps) {
  const emit = useEmit();
  return (
    <RadixContextMenu.Item
      className={clsx(styles.item, tone === 'danger' && styles.danger, className)}
      onSelect={(event) => {
        onSelect?.(event);
        emit('contextmenu.interaction.onSelect', {
          label:
            props.textValue ?? (typeof props.children === 'string' ? props.children : undefined),
          source: eventSource(props.id, undefined, eventData),
        });
      }}
      {...props}
    />
  );
}

export type ContextMenuSeparatorProps = ComponentProps<'div'>;

export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return <RadixContextMenu.Separator className={clsx(styles.separator, className)} {...props} />;
}

export type ContextMenuLabelProps = ComponentProps<'div'>;

/** A non-interactive heading for the items that follow. */
export function ContextMenuLabel({ className, ...props }: ContextMenuLabelProps) {
  return <RadixContextMenu.Label className={clsx(styles.label, className)} {...props} />;
}
