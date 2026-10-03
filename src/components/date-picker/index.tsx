'use client';

import { clsx } from 'clsx';
import { useState, type ComponentProps } from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { EventScope, useEmit } from '../../events/react';
import { DayPicker, type DayPickerLocale } from 'react-day-picker';
import { useFormFieldContext } from '../form-field/use-form-field';
import { IconButton } from '../icon-button';
import type { InputSize } from '../input';
import { Popover } from '../popover';
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
} from './date-field';
import styles from './date-picker.module.css';

export type DatePickerSize = InputSize;

export interface DatePickerProps
  extends
    Omit<
      ComponentProps<'input'>,
      'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max'
    >,
    EventDataProps {
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
  eventData,
  className,
  ...props
}: DatePickerProps) {
  const field = useFormFieldContext();
  const isDisabled = disabled ?? field?.disabled;
  const pattern = datePattern(locale, dateFormat);

  const [innerValue, setInnerValue] = useState(defaultValue);
  const selected = value !== undefined ? value : innerValue;
  const [open, setOpen] = useState(false);
  const emit = useEmit();
  const source = () => eventSource(props.id, name, eventData);

  function change(next: Date | null) {
    if (sameDate(next, selected)) return;
    if (value === undefined) setInnerValue(next);
    onValueChange?.(next);
    emit('datepicker.state.onChange', { value: next, previousValue: selected, source: source() });
    if (next === null && selected !== null) {
      emit('datepicker.state.onClear', { previousValue: selected, source: source() });
    }
  }

  function toggle(nextOpen: boolean, current: Date | null = selected) {
    if (nextOpen === open) return;
    setOpen(nextOpen);
    emit(nextOpen ? 'datepicker.state.onOpen' : 'datepicker.state.onClose', {
      value: current,
      source: source(),
    });
  }

  return (
    <div className={clsx(styles.datePicker, className)}>
      <DateField
        {...props}
        date={selected}
        pattern={pattern}
        locale={locale}
        accepts={(date) => withinBounds(date, min, max)}
        onDateChange={change}
        size={size}
        invalid={invalid}
        disabled={disabled}
        readOnly={readOnly}
      />
      {name && <input type="hidden" name={name} value={isoDate(selected)} disabled={isDisabled} />}
      {/* The calendar's Popover and button are DatePicker's own parts: only DatePicker emits. */}
      <EventScope silent>
        <Popover
          open={open}
          onOpenChange={(next) => toggle(next)}
          align="end"
          aria-label={calendarLabel}
          className={popoverClassName}
          content={
            <DayPicker
              mode="single"
              required
              selected={selected ?? undefined}
              onSelect={(date) => {
                change(date);
                toggle(false, date);
              }}
              defaultMonth={openingMonth(selected, min, max)}
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
