/** DataTable's CSV export: pure text building, and the browser download. */

export type DataTableCsvDelimiter = ',' | ';' | '\t';

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** A cell as text: dates as `yyyy-mm-dd` (with `hh:mm` when not midnight), lists joined. */
function text(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    const day = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
    const time =
      value.getHours() || value.getMinutes()
        ? ` ${pad(value.getHours())}:${pad(value.getMinutes())}`
        : '';
    return day + time;
  }
  if (Array.isArray(value)) return value.map(text).join(', ');
  return String(value);
}

/**
 * One CSV field. Text starting with = + - @ (or a tab or carriage return) gets a leading `'` so
 * spreadsheets do not run it as a formula (CSV injection); numbers are left alone.
 */
function field(value: unknown, delimiter: DataTableCsvDelimiter): string {
  let content = text(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(content)) content = `'${content}`;
  const needsQuotes =
    content.includes(delimiter) ||
    content.includes('"') ||
    content.includes('\n') ||
    content.includes('\r') ||
    content !== content.trim();
  return needsQuotes ? `"${content.replaceAll('"', '""')}"` : content;
}

/** Rows as CSV: a header line, then one line per row, lines ending in CRLF. */
export function toCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  delimiter: DataTableCsvDelimiter = ',',
): string {
  const lines = [columns.map((column) => field(column.header, delimiter)).join(delimiter)];
  for (const row of rows) {
    lines.push(columns.map((column) => field(column.value(row), delimiter)).join(delimiter));
  }
  return lines.join('\r\n') + '\r\n';
}

/** Saves text as a file. A byte order mark makes Excel read UTF-8 (ç, ğ, ş…) correctly. */
export function downloadCsv(csv: string, fileName: string) {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
