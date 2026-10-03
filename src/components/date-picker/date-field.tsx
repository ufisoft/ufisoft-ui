'use client';

/**
 * Internal building blocks shared by DatePicker and DateRangePicker: the typed date field,
 * the calendar's class names and icon, and min/max helpers. Not part of the public API.
 */

import { format, isAfter, isBefore, isSameDay, isValid, parse, startOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useState } from 'react';
import type { ClassNames, DayPickerLocale, Matcher } from 'react-day-picker';
import { Input, type InputProps } from '../input';
import styles from './date-field.module.css';

export const calendarClassNames: Partial<ClassNames> = {
  root: styles.calendar,
  month_caption: styles.caption,
  nav: styles.nav,
  button_previous: styles.navButton,
  button_next: styles.navButton,
  chevron: styles.chevron,
  month_grid: styles.grid,
  weekday: styles.weekday,
  day: styles.day,
  day_button: styles.dayButton,
  selected: styles.selected,
  range_middle: styles.rangeMiddle,
  today: styles.today,
  hidden: styles.hidden,
};

export const popoverClassName = styles.popover;

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" strokeLinecap="round" />
    </svg>
  );
}

/** The date-fns pattern to show and type: `dateFormat`, else the locale's short date. */
export function datePattern(locale?: DayPickerLocale, dateFormat?: string) {
  return dateFormat ?? (locale ?? enUS).formatLong?.date({ width: 'short' }) ?? 'P';
}

export function sameDate(a: Date | null, b: Date | null) {
  return a === b || (a !== null && b !== null && isSameDay(a, b));
}

/** The value a hidden form input submits, independent of the shown format. */
export function isoDate(date: Date | null) {
  return date ? format(date, 'yyyy-MM-dd') : '';
}

export function withinBounds(date: Date, min?: Date, max?: Date) {
  return !(min && isBefore(date, startOfDay(min))) && !(max && isAfter(date, startOfDay(max)));
}

/** Calendar days outside min/max. */
export function boundsMatchers(min?: Date, max?: Date) {
  const matchers: Matcher[] = [];
  if (min) matchers.push({ before: min });
  if (max) matchers.push({ after: max });
  return matchers;
}

/** The month the calendar opens on: the given date, else today, kept inside min/max. */
export function openingMonth(date: Date | null, min?: Date, max?: Date) {
  const today = new Date();
  return date ?? (min && isBefore(today, min) ? min : max && isAfter(today, max) ? max : today);
}

export interface DateFieldProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  date: Date | null;
  pattern: string;
  locale?: DayPickerLocale;
  /** Whether a typed, valid date may become the value (e.g. inside min/max). */
  accepts: (date: Date) => boolean;
  onDateChange: (date: Date | null) => void;
}

/**
 * A text field that shows `date` in `pattern`. Typed text becomes a date on blur or Enter;
 * text that is not a valid, accepted date is undone; an empty field gives `null`.
 */
export function DateField({
  date,
  pattern,
  locale,
  accepts,
  onDateChange,
  onBlur,
  onKeyDown,
  ...props
}: DateFieldProps) {
  const toText = (value: Date | null) => (value ? format(value, pattern, { locale }) : '');

  const [text, setText] = useState(() => toText(date));
  // Show a new date set from outside (calendar, controlled value).
  const [shown, setShown] = useState(date);
  if (!sameDate(shown, date)) {
    setShown(date);
    setText(toText(date));
  }

  function commit() {
    const typed = text.trim();
    if (typed === '') {
      if (date !== null) onDateChange(null);
      return;
    }
    const parsed = parse(typed, pattern, new Date(), { locale });
    const ok = isValid(parsed) && parsed.getFullYear() >= 1000 && accepts(parsed);
    if (ok && !sameDate(parsed, date)) onDateChange(parsed);
    setText(toText(ok ? parsed : date));
  }

  return (
    <Input
      {...props}
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={(event) => {
        commit();
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit();
        onKeyDown?.(event);
      }}
      placeholder={props.placeholder ?? pattern.toLowerCase()}
      autoComplete="off"
      className={styles.input}
    />
  );
}
