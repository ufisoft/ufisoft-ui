'use client';

import { clsx } from 'clsx';
import type { Locale } from 'date-fns';
import { useId, useState, type ComponentProps } from 'react';
import { useFormFieldContext } from '../form-field/use-form-field';
import type { InputSize } from '../input';
import { TimePicker } from '../time-picker';
import styles from './time-range-picker.module.css';

export type TimeRangePickerSize = InputSize;

/** A range of times as `HH:mm`; either end is `null` while not chosen. */
export interface TimeRange {
  from: string | null;
  to: string | null;
}

export interface TimeRangePickerProps extends Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange'
> {
  /** Selected range (controlled). */
  value?: TimeRange;
  /** Initially selected range (uncontrolled). */
  defaultValue?: TimeRange;
  /** Called with the new range, its times as `HH:mm`. */
  onValueChange?: (value: TimeRange) => void;
  size?: TimeRangePickerSize;
  /** Marks both fields as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
  /** Inherited from `FormField`. */
  disabled?: boolean;
  /** Inherited from `FormField`. */
  required?: boolean;
  /** Earliest accepted time, `HH:mm`. */
  min?: string;
  /** Latest accepted time, `HH:mm`. */
  max?: string;
  /** Minutes between the suggested times in both lists. Any time can still be typed. */
  step?: number;
  /** Sets the default format, e.g. `tr` from `date-fns/locale` (`HH:mm`); `en-US` shows `h:mm a`. */
  locale?: Locale;
  /** date-fns pattern for showing the times. Defaults to the locale's short time. */
  timeFormat?: string;
  /** Accessible name of the start field. */
  startLabel?: string;
  /** Accessible name of the end field. */
  endLabel?: string;
  /** Form field name of the start time, submitted as `HH:mm`. */
  startName?: string;
  /** Form field name of the end time, submitted as `HH:mm`. */
  endName?: string;
}

const emptyRange: TimeRange = { from: null, to: null };

/** `HH:mm` strings sort like the times they hold. */
const earlier = (a: string | null, b?: string) => (a && (!b || a < b) ? a : b);
const later = (a: string | null, b?: string) => (a && (!b || a > b) ? a : b);

/**
 * Two time fields for a start and an end time within one day, each typed or picked from a list.
 * Each end bounds the other, so the start never comes after the end.
 */
export function TimeRangePicker({
  value,
  defaultValue = emptyRange,
  onValueChange,
  size = 'md',
  invalid,
  disabled,
  required,
  min,
  max,
  step,
  locale,
  timeFormat,
  startLabel = 'Start time',
  endLabel = 'End time',
  startName,
  endName,
  className,
  ...props
}: TimeRangePickerProps) {
  const field = useFormFieldContext();
  const generatedId = useId();

  const [innerValue, setInnerValue] = useState(defaultValue);
  const { from, to } = value ?? innerValue;

  function change(next: TimeRange) {
    if (next.from === from && next.to === to) return;
    if (value === undefined) setInnerValue(next);
    onValueChange?.(next);
  }

  const fieldProps = { size, invalid, disabled, required, step, locale, timeFormat };

  // Both fields join a surrounding FormField; the start field takes its id, so the label focuses it.
  return (
    <div
      role="group"
      aria-labelledby={field?.labelId}
      className={clsx(styles.timeRangePicker, className)}
      {...props}
    >
      <TimePicker
        {...fieldProps}
        id={field?.controlId ?? `${generatedId}-start`}
        aria-label={startLabel}
        name={startName}
        value={from}
        // A start after the end is undone, like any time outside min/max.
        min={min}
        max={earlier(to, max)}
        onValueChange={(time) => change({ from: time, to })}
        className={styles.field}
      />
      <span className={styles.separator} aria-hidden="true">
        –
      </span>
      <TimePicker
        {...fieldProps}
        id={`${generatedId}-end`}
        aria-label={endLabel}
        name={endName}
        value={to}
        min={later(from, min)}
        max={max}
        onValueChange={(time) => change({ from, to: time })}
        className={styles.field}
      />
    </div>
  );
}
