'use client';

import { clsx } from 'clsx';
import { isAfter, isBefore } from 'date-fns';
import { useId, useState, type ComponentProps } from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { EventScope, useEmit } from '../../events/react';
import { DayPicker, type DayPickerLocale } from 'react-day-picker';
import {
  boundsMatchers,
  CalendarIcon,
  calendarClassNames,
  DateField,
  datePattern,
  isoDate,
  openingMonth,
  popoverClassName,
  sameDate,
  withinBounds,
} from '../date-picker/date-field';
import { useFormFieldContext } from '../form-field/use-form-field';
import { IconButton } from '../icon-button';
import type { InputSize } from '../input';
import { Popover } from '../popover';
import styles from './date-range-picker.module.css';

export type DateRangePickerSize = InputSize;

/** A range of days; either end is `null` while not chosen. */
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface DateRangePickerProps
  extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'>, EventDataProps {
  /** Selected range (controlled). */
  value?: DateRange;
  /** Initially selected range (uncontrolled). */
  defaultValue?: DateRange;
  /** Called with the new range; its dates are at local midnight. */
  onValueChange?: (value: DateRange) => void;
  size?: DateRangePickerSize;
  /** Marks both fields as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
  /** Inherited from `FormField`. */
  disabled?: boolean;
  /** Inherited from `FormField`. */
  required?: boolean;
  readOnly?: boolean;
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** Month and day names, week start and calendar labels, e.g. `tr` from `react-day-picker/locale`. */
  locale?: DayPickerLocale;
  /** date-fns pattern for showing and typing dates. Defaults to the locale's short date (`dd.MM.yyyy` for `tr`). */
  dateFormat?: string;
  /** Accessible name of the start field. */
  startLabel?: string;
  /** Accessible name of the end field. */
  endLabel?: string;
  /** Accessible name of the calendar button and the calendar popover. */
  calendarLabel?: string;
  /** Form field name of the start date, submitted as `yyyy-MM-dd`. */
  startName?: string;
  /** Form field name of the end date, submitted as `yyyy-MM-dd`. */
  endName?: string;
}

const emptyRange: DateRange = { from: null, to: null };

/**
 * Two date fields for a start and an end date, typed or picked from one calendar.
 * The calendar comes from react-day-picker; parsing and formatting from date-fns.
 */
export function DateRangePicker({
  value,
  defaultValue = emptyRange,
  onValueChange,
  size = 'md',
  invalid,
  disabled,
  required,
  readOnly,
  min,
  max,
  locale,
  dateFormat,
  startLabel = 'Start date',
  endLabel = 'End date',
  calendarLabel = 'Choose dates',
  startName,
  endName,
  eventData,
  className,
  ...props
}: DateRangePickerProps) {
  const field = useFormFieldContext();
  const generatedId = useId();
  const isDisabled = disabled ?? field?.disabled;
  const pattern = datePattern(locale, dateFormat);

  const [innerValue, setInnerValue] = useState(defaultValue);
  const range = value ?? innerValue;
  const { from, to } = range;
  const [open, setOpen] = useState(false);
  const emit = useEmit();
  const source = () => eventSource(props.id, undefined, eventData);

  function change(next: DateRange) {
    if (sameDate(next.from, from) && sameDate(next.to, to)) return;
    if (value === undefined) setInnerValue(next);
    onValueChange?.(next);
    emit('daterangepicker.state.onChange', {
      value: next,
      previousValue: { from, to },
      source: source(),
    });
  }

  function toggle(nextOpen: boolean, current: DateRange = { from, to }) {
    if (nextOpen === open) return;
    setOpen(nextOpen);
    emit(nextOpen ? 'daterangepicker.state.onOpen' : 'daterangepicker.state.onClose', {
      value: current,
      source: source(),
    });
  }

  // Both fields join a surrounding FormField; the start field takes its id, so the label focuses it.
  const fieldProps = { size, invalid, disabled, required, readOnly, pattern, locale };

  return (
    <div
      role="group"
      aria-labelledby={field?.labelId}
      className={clsx(styles.dateRangePicker, className)}
      {...props}
    >
      <DateField
        {...fieldProps}
        id={field?.controlId ?? `${generatedId}-start`}
        aria-label={startLabel}
        date={from}
        // A start after the end is undone, like any text that is not an accepted date.
        accepts={(date) => withinBounds(date, min, max) && !(to && isAfter(date, to))}
        onDateChange={(date) => change({ from: date, to })}
      />
      <span className={styles.separator} aria-hidden="true">
        –
      </span>
      <DateField
        {...fieldProps}
        id={`${generatedId}-end`}
        aria-label={endLabel}
        date={to}
        accepts={(date) => withinBounds(date, min, max) && !(from && isBefore(date, from))}
        onDateChange={(date) => change({ from, to: date })}
      />
      {startName && (
        <input type="hidden" name={startName} value={isoDate(from)} disabled={isDisabled} />
      )}
      {endName && <input type="hidden" name={endName} value={isoDate(to)} disabled={isDisabled} />}
      {/* The calendar's Popover and button are part of DateRangePicker: only it emits. */}
      <EventScope silent>
        <Popover
          open={open}
          onOpenChange={(next) => toggle(next)}
          align="end"
          aria-label={calendarLabel}
          className={popoverClassName}
          content={
            <DayPicker
              mode="range"
              // A click on a complete range starts a new one, so two clicks always pick start and end.
              resetOnSelect
              selected={{ from: from ?? undefined, to: to ?? undefined }}
              onSelect={(next) => {
                const range = { from: next?.from ?? null, to: next?.to ?? null };
                change(range);
                if (range.from && range.to) toggle(false, range);
              }}
              defaultMonth={openingMonth(from ?? to, min, max)}
              startMonth={min}
              endMonth={max}
              disabled={boundsMatchers(min, max)}
              locale={locale}
              classNames={calendarClassNames}
              // The user opened the calendar dialog: focus goes to the selected day, not the nav buttons.
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          }
        >
          <IconButton
            variant="secondary"
            size={size}
            icon={<CalendarIcon />}
            aria-label={calendarLabel}
            disabled={isDisabled || readOnly}
          />
        </Popover>
      </EventScope>
    </div>
  );
}
