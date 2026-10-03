'use client';

/**
 * DataTable's row and bulk action UI: the row menu button, the row context menu items and the bar
 * shown while rows are selected. Internal: DataTable is the public component.
 */

import type { ReactNode, RefObject } from 'react';
import { EventScope } from '../../events/react';
import { Button } from '../button';
import { ContextMenuItem } from '../context-menu';
import { DropdownMenu, DropdownMenuItem } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import styles from './data-table.module.css';
import type { DataTableBulkAction, DataTableLabels, DataTableRowAction } from '.';

interface RowActionsButtonProps<T> {
  row: T;
  rowLabel: string;
  actions: DataTableRowAction<T>[];
  onAction: (action: DataTableRowAction<T>) => void;
  labels: DataTableLabels;
}

/** The “⋯” button at the end of a row; it opens the row's actions. */
export function RowActionsButton<T>({
  row,
  rowLabel,
  actions,
  onAction,
  labels,
}: RowActionsButtonProps<T>) {
  return (
    // The menu and its button are DataTable's own parts: only datatable.interaction.onRowAction is emitted.
    <EventScope silent>
      <DropdownMenu
        align="end"
        content={actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            tone={action.tone}
            disabled={action.disabled?.(row)}
            onSelect={() => onAction(action)}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      >
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={labels.rowActions(rowLabel)}
          icon={<MoreIcon />}
        />
      </DropdownMenu>
    </EventScope>
  );
}

/** The same actions for the context menu (right-click, long-press, Menu key) of a row. */
export function rowContextItems<T>(
  row: T,
  actions: DataTableRowAction<T>[],
  onAction: (action: DataTableRowAction<T>) => void,
): ReactNode {
  return actions.map((action) => (
    <ContextMenuItem
      key={action.id}
      tone={action.tone}
      disabled={action.disabled?.(row)}
      onSelect={() => onAction(action)}
    >
      {action.label}
    </ContextMenuItem>
  ));
}

interface BulkBarProps<T> {
  /** “3 selected” or “All 245 results selected”. */
  status: string;
  actions: DataTableBulkAction<T>[];
  onAction: (action: DataTableBulkAction<T>) => void;
  /** Shown when the whole page is selected and more results exist. */
  selectAllMatching?: string;
  onSelectAllMatching: () => void;
  onClear: () => void;
  labels: DataTableLabels;
  ref: RefObject<HTMLDivElement | null>;
  clearRef: RefObject<HTMLButtonElement | null>;
}

/** The bar above the table while rows are selected: the count, the bulk actions and the clear button. */
export function BulkBar<T>({
  status,
  actions,
  onAction,
  selectAllMatching,
  onSelectAllMatching,
  onClear,
  labels,
  ref,
  clearRef,
}: BulkBarProps<T>) {
  return (
    <div ref={ref} role="group" aria-label={labels.bulkActions} className={styles.bulkBar}>
      {/* A status region: a new count, or “all results selected”, is announced. */}
      <span role="status" className={styles.bulkStatus}>
        {status}
      </span>
      {/* The bar's buttons are DataTable's own parts: only datatable events are emitted. */}
      <EventScope silent>
        {selectAllMatching && (
          <Button size="sm" variant="ghost" onClick={onSelectAllMatching}>
            {selectAllMatching}
          </Button>
        )}
        {actions.length > 0 && (
          <div className={styles.bulkActions}>
            {actions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant={action.tone === 'danger' ? 'danger' : 'secondary'}
                onClick={() => onAction(action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
        <Button ref={clearRef} size="sm" variant="ghost" onClick={onClear}>
          {labels.clearSelection}
        </Button>
      </EventScope>
    </div>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="3.5" cy="8" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="12.5" cy="8" r="1.25" />
    </svg>
  );
}

/** The row drag handle: two columns of dots. */
export function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="6" cy="4" r="1.25" />
      <circle cx="10" cy="4" r="1.25" />
      <circle cx="6" cy="8" r="1.25" />
      <circle cx="10" cy="8" r="1.25" />
      <circle cx="6" cy="12" r="1.25" />
      <circle cx="10" cy="12" r="1.25" />
    </svg>
  );
}

export function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M6 4L10 8L6 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
