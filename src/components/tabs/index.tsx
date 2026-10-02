'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import styles from './tabs.module.css';

export type TabsOrientation = 'horizontal' | 'vertical';

export interface TabsProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'dir'> {
  /** Selected tab (controlled). */
  value?: string;
  /** Initially selected tab (uncontrolled). */
  defaultValue?: string;
  /** Called with the newly selected tab's value. */
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
}

/**
 * Switches between panels of related content in one place. ARIA wiring and
 * arrow-key navigation come from Radix Tabs.
 */
export function Tabs({ orientation = 'horizontal', className, ...props }: TabsProps) {
  return (
    <RadixTabs.Root
      orientation={orientation}
      className={clsx(styles.tabs, styles[orientation], className)}
      {...props}
    />
  );
}

export type TabsListProps = ComponentProps<'div'>;

/** The row (or column) of tabs. Name it with `aria-label` when the page has several. */
export function TabsList({ className, ...props }: TabsListProps) {
  return <RadixTabs.List className={clsx(styles.list, className)} {...props} />;
}

export interface TabsTriggerProps extends Omit<ComponentProps<'button'>, 'value'> {
  /** Connects the tab to the `TabsPanel` with the same value. */
  value: string;
}

export function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return <RadixTabs.Trigger className={clsx(styles.trigger, className)} {...props} />;
}

export interface TabsPanelProps extends ComponentProps<'div'> {
  /** Shown while the tab with the same value is selected. */
  value: string;
}

export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return <RadixTabs.Content className={clsx(styles.panel, className)} {...props} />;
}
