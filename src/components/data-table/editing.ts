/** DataTable's inline cell editing: editor types and pure parsing and validation. */

import type { DataTableFilterOption } from './filtering';

/** An error message, or nothing when the value is fine. */
type Validate<V, T> = (value: V, row: T) => string | null | undefined;

/** A column's editor; the type decides the control and the value `onCellEdit` receives. */
export type DataTableCellEditor<T> =
  | { type: 'text'; required?: boolean; maxLength?: number; validate?: Validate<string, T> }
  | {
      type: 'number';
      required?: boolean;
      min?: number;
      max?: number;
      validate?: Validate<number | null, T>;
    }
  | {
      type: 'select';
      options: DataTableFilterOption[];
      required?: boolean;
      validate?: Validate<string | null, T>;
    }
  | {
      type: 'date';
      required?: boolean;
      min?: Date;
      max?: Date;
      validate?: Validate<Date | null, T>;
    };

/** What the editor holds while editing: text, or a date for the date editor. */
export type EditDraft = string | Date | null;

export interface EditLabels {
  required: string;
  invalidNumber: string;
  numberMin: (min: number) => string;
  numberMax: (max: number) => string;
}

/** The editor's starting content for a cell value. */
export function draftOf(editor: DataTableCellEditor<unknown>, value: unknown): EditDraft {
  if (editor.type === 'date') {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    return null;
  }
  return value === null || value === undefined ? '' : String(value);
}

export type ParsedEdit = { value: unknown } | { error: string };

/**
 * Turns the draft into the value for `onCellEdit`: text as typed, a number (or null when empty),
 * the chosen option's value (or null), a date (or null). Then checks `required`, number bounds
 * and the column's `validate`.
 */
export function parseEdit<T>(
  editor: DataTableCellEditor<T>,
  draft: EditDraft,
  row: T,
  labels: EditLabels,
): ParsedEdit {
  const empty = draft === null || (typeof draft === 'string' && draft.trim() === '');
  if (empty && editor.required) return { error: labels.required };
  let message: string | null | undefined;
  switch (editor.type) {
    case 'text': {
      const value = typeof draft === 'string' ? draft : '';
      message = editor.validate?.(value, row);
      return message ? { error: message } : { value };
    }
    case 'number': {
      const text = typeof draft === 'string' ? draft.trim() : '';
      // Accept a decimal comma as typed in Turkish and most of Europe.
      const value = text === '' ? null : Number(text.replace(',', '.'));
      if (value !== null && !Number.isFinite(value)) return { error: labels.invalidNumber };
      if (value !== null && editor.min !== undefined && value < editor.min) {
        return { error: labels.numberMin(editor.min) };
      }
      if (value !== null && editor.max !== undefined && value > editor.max) {
        return { error: labels.numberMax(editor.max) };
      }
      message = editor.validate?.(value, row);
      return message ? { error: message } : { value };
    }
    case 'select': {
      const value = typeof draft === 'string' && draft !== '' ? draft : null;
      message = editor.validate?.(value, row);
      return message ? { error: message } : { value };
    }
    case 'date': {
      const value = draft instanceof Date ? draft : null;
      message = editor.validate?.(value, row);
      return message ? { error: message } : { value };
    }
  }
}

/** Whether an edit changes nothing (same text, number or day). */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  const blank = (value: unknown) => value === null || value === undefined || value === '';
  if (blank(a) && blank(b)) return true;
  return a === b || ((typeof a === 'number' || typeof b === 'number') && String(a) === String(b));
}
