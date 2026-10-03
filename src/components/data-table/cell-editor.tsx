'use client';

/**
 * DataTable's inline cell editor: the control that replaces a cell's content while it is edited.
 * Internal: DataTable is the public component.
 */

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import type { DayPickerLocale } from 'react-day-picker';
import { EventScope } from '../../events/react';
import { DatePicker } from '../date-picker';
import { Input } from '../input';
import { Select } from '../select';
import { Spinner } from '../spinner';
import styles from './data-table.module.css';
import type { DataTableCellEditor, EditDraft } from './editing';

interface CellEditorProps {
  editor: DataTableCellEditor<never>;
  /** The starting content: the cell's value, or the key typed to start editing. */
  initial: EditDraft;
  /** Typing started the edit: keep the caret after the typed text instead of selecting it. */
  typed: boolean;
  /** The control's name, e.g. “Edit Email for Ayşe Kaya”. */
  label: string;
  error: string | null;
  saving: boolean;
  savingLabel: string;
  dateLocale?: DayPickerLocale;
  /** Enter, Tab (with the direction to move) or leaving the cell. */
  onCommit: (draft: EditDraft, move: -1 | 0 | 1) => void;
  onCancel: () => void;
}

export function CellEditor({
  editor,
  initial,
  typed,
  label,
  error,
  saving,
  savingLabel,
  dateLocale,
  onCommit,
  onCancel,
}: CellEditorProps) {
  const errorId = useId();
  const container = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<EditDraft>(initial);
  // The date field reports a typed date on Enter just before this editor's Enter handler runs:
  // read the latest draft from a ref, not from state.
  const latest = useRef(draft);
  // After Enter, Tab or Escape the editor closes: its blur must not commit again.
  const closing = useRef(false);

  const update = (next: EditDraft) => {
    latest.current = next;
    setDraft(next);
  };

  useEffect(() => {
    const control = container.current?.querySelector<HTMLInputElement | HTMLSelectElement>(
      'input:not([type=hidden]), select',
    );
    control?.focus();
    if (control instanceof HTMLInputElement && !typed) control.select();
  }, [typed]);

  // A failed save or validation reopens the editor for another try.
  useEffect(() => {
    if (error) closing.current = false;
  }, [error]);

  function commit(move: -1 | 0 | 1) {
    closing.current = true;
    onCommit(latest.current, move);
  }

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    // The date picker's calendar handles its own keys.
    if ((event.target as Element).closest('[role="dialog"]')) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      commit(0);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closing.current = true;
      onCancel();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();
      commit(event.shiftKey ? -1 : 1);
    }
  }

  function blur(event: FocusEvent<HTMLDivElement>) {
    // Focus moved within the editor (the date picker's button or calendar): still editing.
    if (container.current?.contains(event.relatedTarget as Node | null)) return;
    if (!closing.current && !saving) commit(0);
  }

  const invalid = error !== null;
  const shared = {
    'aria-label': label,
    'aria-describedby': invalid ? errorId : undefined,
    invalid,
    readOnly: saving,
  };

  let control;
  switch (editor.type) {
    case 'text':
      control = (
        <Input
          size="sm"
          value={typeof draft === 'string' ? draft : ''}
          maxLength={editor.maxLength}
          onChange={(event) => update(event.target.value)}
          {...shared}
        />
      );
      break;
    case 'number':
      control = (
        <Input
          size="sm"
          inputMode="decimal"
          value={typeof draft === 'string' ? draft : ''}
          onChange={(event) => update(event.target.value)}
          {...shared}
        />
      );
      break;
    case 'select':
      control = (
        <Select
          size="sm"
          value={typeof draft === 'string' ? draft : ''}
          onChange={(event) => update(event.target.value)}
          {...shared}
          disabled={saving}
        >
          {!editor.required && <option value="" />}
          {editor.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
      break;
    case 'date':
      control = (
        <DatePicker
          size="sm"
          value={draft instanceof Date ? draft : null}
          onValueChange={update}
          min={editor.min}
          max={editor.max}
          locale={dateLocale}
          {...shared}
        />
      );
      break;
  }

  return (
    // The editor's controls are DataTable's own parts: only datatable.interaction.onCellEdit is emitted.
    <EventScope silent>
      {/* Keys and focus are handled for the controls inside; the div itself is not interactive. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={container}
        data-cell-editor=""
        className={styles.cellEditor}
        aria-busy={saving || undefined}
        onKeyDown={keyDown}
        onBlur={blur}
      >
        <div className={styles.cellEditorRow}>
          {control}
          {saving && <Spinner size="sm" label={savingLabel} />}
        </div>
        {invalid && (
          <span id={errorId} role="alert" className={styles.cellError}>
            {error}
          </span>
        )}
      </div>
    </EventScope>
  );
}
