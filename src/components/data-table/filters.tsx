'use client';

/**
 * DataTable's filter UI: the filter button and editor in a column header, and the active filter
 * list above the table. Internal: DataTable is the public component.
 */

import { clsx } from 'clsx';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import type { DayPickerLocale } from 'react-day-picker';
import { EventScope } from '../../events/react';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { DateRangePicker } from '../date-range-picker';
import { FormField, FormLabel } from '../form-field';
import { IconButton } from '../icon-button';
import { Input } from '../input';
import { Popover } from '../popover';
import { Select } from '../select';
import styles from './data-table.module.css';
import type {
  DataTableColumnFilter,
  DataTableFilter,
  DataTableFilters,
  DataTableTextOperator,
} from './filtering';
import type { DataTableLabels } from '.';

export interface FilterColumn {
  id: string;
  /** Plain-text name, for labels and summaries. */
  label: string;
  filter: DataTableColumnFilter;
}

const operators: DataTableTextOperator[] = ['contains', 'equals', 'startsWith'];

/** A short, readable description of an active filter: “Role: Admin, Editor”. */
export function describeFilter(
  column: FilterColumn,
  filter: DataTableFilter,
  labels: DataTableLabels,
  locale: string | undefined,
): string {
  const number = new Intl.NumberFormat(locale);
  const date = (value: Date) => value.toLocaleDateString(locale);
  switch (filter.type) {
    case 'text':
      return `${column.label} ${labels.operators[filter.operator]} “${filter.value.trim()}”`;
    case 'number':
      if (filter.min !== null && filter.max !== null) {
        return `${column.label}: ${number.format(filter.min)}–${number.format(filter.max)}`;
      }
      return filter.min !== null
        ? `${column.label} ≥ ${number.format(filter.min)}`
        : `${column.label} ≤ ${number.format(filter.max ?? 0)}`;
    case 'select': {
      const options = column.filter.type === 'select' ? column.filter.options : [];
      const names = filter.values.map(
        (value) => options.find((o) => o.value === value)?.label ?? value,
      );
      return `${column.label}: ${names.join(', ')}`;
    }
    case 'date':
      if (filter.from && filter.to)
        return `${column.label}: ${date(filter.from)} – ${date(filter.to)}`;
      return filter.from
        ? `${column.label} ≥ ${date(filter.from)}`
        : `${column.label} ≤ ${date(filter.to as Date)}`;
    case 'boolean': {
      const config = column.filter.type === 'boolean' ? column.filter : undefined;
      return `${column.label}: ${filter.value ? (config?.trueLabel ?? labels.yes) : (config?.falseLabel ?? labels.no)}`;
    }
  }
}

interface FilterButtonProps {
  column: FilterColumn;
  value: DataTableFilter | undefined;
  onChange: (filter: DataTableFilter | null) => void;
  labels: DataTableLabels;
  dateLocale?: DayPickerLocale;
}

/** The filter button in a column header; its popover edits the column's filter. */
export function FilterButton({ column, value, onChange, labels, dateLocale }: FilterButtonProps) {
  const [open, setOpen] = useState(false);
  const active = value !== undefined;
  return (
    // The popover and its button are DataTable's own parts: no popover or icon button events.
    <EventScope silent>
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="end"
        aria-label={labels.filter(column.label, false)}
        className={styles.filterPopover}
        content={
          // The editor's controls are DataTable's own parts: only datatable.state.onFilter is emitted.
          <EventScope silent>
            <FilterEditor
              // A new editor per opening starts from the current filter.
              key={String(open)}
              column={column}
              value={value}
              labels={labels}
              dateLocale={dateLocale}
              onApply={(filter) => {
                onChange(filter);
                setOpen(false);
              }}
            />
          </EventScope>
        }
      >
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={labels.filter(column.label, active)}
          className={clsx(styles.filterButton, active && styles.filterActive)}
          icon={<FilterIcon />}
        />
      </Popover>
    </EventScope>
  );
}

interface FilterEditorProps {
  column: FilterColumn;
  value: DataTableFilter | undefined;
  onApply: (filter: DataTableFilter | null) => void;
  labels: DataTableLabels;
  dateLocale?: DayPickerLocale;
}

/** A form per filter type; changes apply on submit (Enter or Apply), so a server is asked once. */
function FilterEditor({ column, value, onApply, labels, dateLocale }: FilterEditorProps) {
  const id = useId();
  const config = column.filter;
  const [text, setText] = useState(value?.type === 'text' ? value.value : '');
  const [operator, setOperator] = useState<DataTableTextOperator>(
    value?.type === 'text' ? value.operator : 'contains',
  );
  const [min, setMin] = useState(
    value?.type === 'number' && value.min !== null ? String(value.min) : '',
  );
  const [max, setMax] = useState(
    value?.type === 'number' && value.max !== null ? String(value.max) : '',
  );
  const [selected, setSelected] = useState<string[]>(value?.type === 'select' ? value.values : []);
  const [range, setRange] = useState({
    from: value?.type === 'date' ? value.from : null,
    to: value?.type === 'date' ? value.to : null,
  });
  const [flag, setFlag] = useState(value?.type === 'boolean' ? String(value.value) : '');

  const toNumber = (input: string) =>
    input.trim() === '' || Number.isNaN(Number(input)) ? null : Number(input);

  function draft(): DataTableFilter | null {
    switch (config.type) {
      case 'text':
        return { type: 'text', operator, value: text };
      case 'number':
        return { type: 'number', min: toNumber(min), max: toNumber(max) };
      case 'select':
        return { type: 'select', values: selected };
      case 'date':
        return { type: 'date', from: range.from, to: range.to };
      case 'boolean':
        return flag === '' ? null : { type: 'boolean', value: flag === 'true' };
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    onApply(draft());
  }

  let fields: ReactNode;
  switch (config.type) {
    case 'text':
      fields = (
        <>
          <FormField>
            <FormLabel>{labels.condition}</FormLabel>
            <Select
              size="sm"
              value={operator}
              onChange={(e) => setOperator(e.target.value as DataTableTextOperator)}
            >
              {operators.map((op) => (
                <option key={op} value={op}>
                  {labels.operators[op]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField>
            <FormLabel>{labels.value}</FormLabel>
            {/* The user opened the filter to type: focus goes to the value. */}
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <Input size="sm" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          </FormField>
        </>
      );
      break;
    case 'number':
      fields = (
        <div className={styles.filterRow}>
          <FormField>
            <FormLabel>{labels.min}</FormLabel>
            <Input size="sm" type="number" value={min} onChange={(e) => setMin(e.target.value)} />
          </FormField>
          <FormField>
            <FormLabel>{labels.max}</FormLabel>
            <Input size="sm" type="number" value={max} onChange={(e) => setMax(e.target.value)} />
          </FormField>
        </div>
      );
      break;
    case 'select':
      fields = config.multiple ? (
        <fieldset className={styles.filterOptions}>
          <legend className={styles.filterLegend}>{column.label}</legend>
          {config.options.map((option) => (
            <Checkbox
              key={option.value}
              checked={selected.includes(option.value)}
              onChange={(e) =>
                setSelected((current) =>
                  e.target.checked
                    ? [...current, option.value]
                    : current.filter((v) => v !== option.value),
                )
              }
            >
              {option.label}
            </Checkbox>
          ))}
        </fieldset>
      ) : (
        <FormField>
          <FormLabel>{column.label}</FormLabel>
          <Select
            size="sm"
            value={selected[0] ?? ''}
            onChange={(e) => setSelected(e.target.value ? [e.target.value] : [])}
          >
            <option value="">{labels.any}</option>
            {config.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      );
      break;
    case 'date':
      fields = (
        <DateRangePicker
          aria-label={column.label}
          size="sm"
          locale={dateLocale}
          value={range}
          onValueChange={setRange}
          startLabel={labels.from}
          endLabel={labels.to}
          calendarLabel={labels.chooseDates}
        />
      );
      break;
    case 'boolean':
      fields = (
        <FormField>
          <FormLabel>{column.label}</FormLabel>
          <Select size="sm" value={flag} onChange={(e) => setFlag(e.target.value)}>
            <option value="">{labels.any}</option>
            <option value="true">{config.trueLabel ?? labels.yes}</option>
            <option value="false">{config.falseLabel ?? labels.no}</option>
          </Select>
        </FormField>
      );
      break;
  }

  return (
    <form className={styles.filterForm} aria-labelledby={`${id}-title`} onSubmit={submit}>
      <span id={`${id}-title`} className={styles.filterTitle}>
        {labels.filter(column.label, false)}
      </span>
      {fields}
      <div className={styles.filterActions}>
        <Button size="sm" variant="ghost" onClick={() => onApply(null)}>
          {labels.clear}
        </Button>
        <Button size="sm" type="submit">
          {labels.apply}
        </Button>
      </div>
    </form>
  );
}

interface ActiveFiltersProps {
  columns: FilterColumn[];
  filters: DataTableFilters;
  onRemove: (columnId: string) => void;
  onClearAll: () => void;
  labels: DataTableLabels;
  locale: string | undefined;
}

/** The active filters as removable chips, and “Clear all”. */
export function ActiveFilters({
  columns,
  filters,
  onRemove,
  onClearAll,
  labels,
  locale,
}: ActiveFiltersProps) {
  const entries = columns.flatMap((column) => {
    const filter = filters[column.id];
    return filter ? [{ column, summary: describeFilter(column, filter, labels, locale) }] : [];
  });
  if (entries.length === 0) return null;
  return (
    // Its own parts: removing a chip emits datatable.state.onFilter, not a button click.
    <EventScope silent>
      <ul className={styles.chips} aria-label={labels.activeFilters}>
        {entries.map(({ column, summary }) => (
          <li key={column.id} className={styles.chip}>
            <span>{summary}</span>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={labels.removeFilter(summary)}
              icon={<CloseIcon />}
              onClick={() => onRemove(column.id)}
            />
          </li>
        ))}
        <li>
          <Button size="sm" variant="ghost" onClick={onClearAll}>
            {labels.clearAll}
          </Button>
        </li>
      </ul>
    </EventScope>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 3.5h11l-4.25 5v4l-2.5 1v-5z" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}
