'use client';

import { clsx } from 'clsx';
import { format, isAfter, isBefore, isSameDay, isValid, parse, startOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useState, type ComponentProps } from 'react';
import { DayPicker, type ClassNames, type DayPickerLocale, type Matcher } from 'react-day-picker';
import { useFormFieldContext } from '../form-field/use-form-field';
import { IconButton } from '../icon-button';
import { Input, type InputSize } from '../input';
import { Popover } from '../popover';
import styles from './date-picker.module.css';

export type DatePickerSize = InputSize;

export interface DatePickerProps extends Omit<
  ComponentProps<'input'>,
  'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max'
> {
  /** Selected date (controlled). `null` for no date. */
  value?: Date | null;
  /** Initially selected date (uncontrolled). */
  defaultValue?: Date | null;
  /** Called with the new date (local midnight), or `null` when the field is emptied. */
  onValueChange?: (value: Date | null) => void;
  size?: DatePickerSize;
  /** Marks the value as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
  /** Earliest selectable date. */
  min?: Date;
  /** Latest selectable date. */
  max?: Date;
  /** Month and day names, week start and calendar labels, e.g. `tr` from `react-day-picker/locale`. */
  locale?: DayPickerLocale;
  /** date-fns pattern for showing and typing the date. Defaults to the locale's short date (`dd.MM.yyyy` for `tr`). */
  dateFormat?: string;
  /** Accessible name of the calendar button and the calendar popover. */
  calendarLabel?: string;
}

const calendarClassNames: Partial<ClassNames> = {
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
  today: styles.today,
  hidden: styles.hidden,
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" strokeLinecap="round" />
    </svg>
  );
}

function sameDate(a: Date | null, b: Date | null) {
  return a === b || (a !== null && b !== null && isSameDay(a, b));
}

/**
 * A date field: type the date or pick it from a calendar.
 * The calendar comes from react-day-picker; parsing and formatting from date-fns.
 */
export function DatePicker({
  value,
  defaultValue = null,
  onValueChange,
  size = 'md',
  invalid,
  min,
  max,
  locale,
  dateFormat,
  calendarLabel = 'Choose date',
  name,
  disabled,
  readOnly,
  className,
  onBlur,
  onKeyDown,
  ...props
}: DatePickerProps) {
  const field = useFormFieldContext();
  const isDisabled = disabled ?? field?.disabled;
  const pattern = dateFormat ?? (locale ?? enUS).formatLong?.date({ width: 'short' }) ?? 'P';

  const [innerValue, setInnerValue] = useState(defaultValue);
  const selected = value !== undefined ? value : innerValue;
  const toText = (date: Date | null) => (date ? format(date, pattern, { locale }) : '');

  const [text, setText] = useState(() => toText(selected));
  // Show a new value set from outside (controlled `value`).
  const [shown, setShown] = useState(selected);
  if (!sameDate(shown, selected)) {
    setShown(selected);
    setText(toText(selected));
  }

  const [open, setOpen] = useState(false);

  const inRange = (date: Date) =>
    !(min && isBefore(date, startOfDay(min))) && !(max && isAfter(date, startOfDay(max)));

  function change(next: Date | null) {
    if (!sameDate(next, selected)) {
      if (value === undefined) setInnerValue(next);
      onValueChange?.(next);
    }
    setText(toText(next));
  }

  // Typed text becomes a date on blur or Enter; text that is not a valid date in range is undone.
  function commit() {
    const typed = text.trim();
    if (typed === '') return change(null);
    const date = parse(typed, pattern, new Date(), { locale });
    if (isValid(date) && date.getFullYear() >= 1000 && inRange(date)) change(date);
    else setText(toText(selected));
  }

  // The calendar opens on the selected date, else today, kept inside min/max.
  const today = new Date();
  const month =
    selected ?? (min && isBefore(today, min) ? min : max && isAfter(today, max) ? max : today);

  const disabledDays: Matcher[] = [];
  if (min) disabledDays.push({ before: min });
  if (max) disabledDays.push({ after: max });

  return (
    <div className={clsx(styles.datePicker, className)}>
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
        size={size}
        invalid={invalid}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={props.placeholder ?? pattern.toLowerCase()}
        autoComplete="off"
        className={styles.input}
      />
      {name && (
        <input
          type="hidden"
          name={name}
          value={selected ? format(selected, 'yyyy-MM-dd') : ''}
          disabled={isDisabled}
        />
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="end"
        aria-label={calendarLabel}
        className={styles.popover}
        content={
          <DayPicker
            mode="single"
            required
            selected={selected ?? undefined}
            onSelect={(date) => {
              change(date);
              setOpen(false);
            }}
            defaultMonth={month}
            startMonth={min}
            endMonth={max}
            disabled={disabledDays}
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
    </div>
  );
}
