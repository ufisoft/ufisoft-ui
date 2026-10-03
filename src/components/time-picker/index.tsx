'use client';

import { autoUpdate, computePosition, flip, offset, size } from '@floating-ui/dom';
import { clsx } from 'clsx';
import { format, isValid, parse, type Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useCombobox } from 'downshift';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type Ref,
  type RefObject,
} from 'react';
import { useFormFieldContext } from '../form-field/use-form-field';
import { Input, type InputSize } from '../input';
import styles from './time-picker.module.css';

export type TimePickerSize = InputSize;

export interface TimePickerProps extends Omit<
  ComponentProps<'input'>,
  'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step'
> {
  /** Selected time as `HH:mm` (24-hour, like a native time input). `null` for no time. */
  value?: string | null;
  /** Initially selected time (uncontrolled), `HH:mm`. */
  defaultValue?: string | null;
  /** Called with the new time as `HH:mm`, or `null` when the field is emptied. */
  onValueChange?: (value: string | null) => void;
  size?: TimePickerSize;
  /** Marks the value as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
  /** Earliest accepted time, `HH:mm`. */
  min?: string;
  /** Latest accepted time, `HH:mm`. */
  max?: string;
  /** Minutes between the suggested times in the list. Any time can still be typed. */
  step?: number;
  /** Sets the default format, e.g. `tr` from `date-fns/locale` (`HH:mm`); `en-US` shows `h:mm a`. */
  locale?: Locale;
  /** date-fns pattern for showing the time. Defaults to the locale's short time. */
  timeFormat?: string;
}

interface TimeOption {
  value: string;
  label: string;
}

/** Other common ways to type a time, tried after the shown pattern. */
const typedPatterns = ['H:mm', 'H.mm', 'HHmm', 'H', 'h:mm a', 'h:mma', 'h a', 'ha'];
const referenceDate = new Date(2000, 0, 1);

function toMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(total: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function parseTime(text: string, pattern: string, locale?: Locale) {
  for (const candidate of [pattern, ...typedPatterns]) {
    const date = parse(text, candidate, referenceDate, { locale });
    if (isValid(date)) return fromMinutes(date.getHours() * 60 + date.getMinutes());
  }
  return null;
}

/** “9” finds 09:00 and 9:00 AM; spaces and case are ignored. */
function simplify(text: string) {
  return text.toLowerCase().replace(/\s/g, '').replace(/^0/, '');
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as RefObject<T | null>).current = node;
}

/**
 * A time field: type any time or pick one from a list of suggested times.
 * ARIA combobox behaviour comes from Downshift; positioning from Floating UI.
 */
export function TimePicker({
  value,
  defaultValue = null,
  onValueChange,
  size: inputSize = 'md',
  invalid,
  min = '00:00',
  max = '23:59',
  step = 30,
  locale,
  timeFormat,
  name,
  id,
  className,
  ref,
  ...props
}: TimePickerProps) {
  const field = useFormFieldContext();
  const generatedId = useId();
  const inputId = id ?? field?.controlId ?? generatedId;
  const pattern = timeFormat ?? (locale ?? enUS).formatLong?.time({ width: 'short' }) ?? 'p';
  const toText = (time: string | null) => {
    if (!time) return '';
    const minutes = toMinutes(time);
    return format(new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60), pattern, {
      locale,
    });
  };

  const [innerValue, setInnerValue] = useState(defaultValue);
  const selected = value !== undefined ? value : innerValue;

  const minMinutes = toMinutes(min);
  const maxMinutes = toMinutes(max);
  const inBounds = (time: string) => toMinutes(time) >= minMinutes && toMinutes(time) <= maxMinutes;

  const options: TimeOption[] = [];
  for (let minutes = minMinutes; minutes <= maxMinutes; minutes += Math.max(1, step)) {
    const time = fromMinutes(minutes);
    options.push({ value: time, label: toText(time) });
  }
  const selectedOption = options.find((option) => option.value === selected) ?? null;

  const [inputValue, setInputValue] = useState(() => toText(selected));
  // Show a new value set from outside (controlled `value`).
  const [shown, setShown] = useState(selected);
  if (shown !== selected) {
    setShown(selected);
    setInputValue(toText(selected));
  }

  // The whole list while the field shows the value; typed text narrows it.
  const visible = (text: string) =>
    text.trim() === '' || text === toText(selected)
      ? options
      : options.filter((option) => simplify(option.label).startsWith(simplify(text)));
  const filtered = visible(inputValue);

  function change(next: string | null) {
    if (next === selected) return;
    if (value === undefined) setInnerValue(next);
    onValueChange?.(next);
  }

  // Typed text becomes the value on blur or Enter; text that is not a time in range is undone.
  function commit() {
    const typed = inputValue.trim();
    if (typed === '') return change(null);
    const time = parseTime(typed, pattern, locale);
    const ok = time !== null && inBounds(time);
    if (ok) change(time);
    setInputValue(toText(ok ? time : selected));
  }

  const { isOpen, highlightedIndex, getInputProps, getMenuProps, getItemProps, closeMenu } =
    useCombobox<TimeOption>({
      items: filtered,
      itemToString: (option) => option?.label ?? '',
      itemToKey: (option) => option?.value,
      selectedItem: selectedOption,
      inputValue,
      onInputValueChange: ({ inputValue: next, type }) => {
        // A value outside the list has no option; keep its text instead of Downshift's ''.
        if (type !== useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem) {
          setInputValue(next);
        }
      },
      onSelectedItemChange: ({ selectedItem: option }) => {
        if (option) change(option.value);
      },
      inputId,
      labelId: field?.labelId,
      stateReducer: (_state, { type, changes }) => {
        // Escape never clears the value (empty the field for that), it only closes the list.
        if (type === useCombobox.stateChangeTypes.InputKeyDownEscape) {
          return { ...changes, selectedItem: _state.selectedItem, inputValue: _state.inputValue };
        }
        // No list when nothing matches: the typed time is still accepted on blur.
        if (changes.isOpen && visible(changes.inputValue ?? '').length === 0) {
          return { ...changes, isOpen: false };
        }
        return changes;
      },
    });

  // Position the list with fixed coordinates so scrolling containers (Modal body, Table) do not clip it.
  const anchorRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const anchor = anchorRef.current;
    const popup = popupRef.current;
    if (!isOpen || !anchor || !popup) return;
    return autoUpdate(anchor, popup, () => {
      void computePosition(anchor, popup, {
        strategy: 'fixed',
        placement: 'bottom-start',
        middleware: [
          offset(4),
          flip({ padding: 8 }),
          size({
            padding: 8,
            apply({ rects, availableHeight }) {
              Object.assign(popup.style, {
                width: `${rects.reference.width}px`,
                // Never negative (an invalid max-height would leave the list unbounded).
                maxHeight: `${Math.max(120, Math.min(availableHeight, 320))}px`,
              });
            },
          }),
        ],
      }).then(({ x, y }) => Object.assign(popup.style, { left: `${x}px`, top: `${y}px` }));
    });
  }, [isOpen]);

  // Downshift selects a highlighted option on Enter and blur; otherwise the typed text counts.
  const optionWillBeSelected = isOpen && highlightedIndex >= 0;
  const { ref: downshiftInputRef, ...inputProps } = getInputProps({
    ...props,
    onKeyDown: (event) => {
      props.onKeyDown?.(event);
      if (event.key === 'Enter' && !optionWillBeSelected) {
        commit();
        closeMenu();
      }
      // On a closed list Escape belongs to the surroundings, e.g. it closes a Modal.
      if (event.key === 'Escape' && !isOpen) {
        (
          event.nativeEvent as KeyboardEvent & { preventDownshiftDefault?: boolean }
        ).preventDownshiftDefault = true;
      }
    },
    onBlur: (event) => {
      props.onBlur?.(event);
      if (!optionWillBeSelected) commit();
    },
  });
  const menuProps = getMenuProps();
  // Without a FormLabel, Downshift would point aria-labelledby at a label that does not exist.
  if (!field) {
    delete inputProps['aria-labelledby'];
    menuProps['aria-labelledby'] = undefined;
    menuProps['aria-label'] = props['aria-label'];
  }

  return (
    <div ref={anchorRef} className={clsx(styles.timePicker, className)}>
      <Input
        {...inputProps}
        // Downshift needs the input element; so does the consumer's ref.
        ref={(node: HTMLInputElement | null) => {
          assignRef(downshiftInputRef, node);
          assignRef(ref, node);
        }}
        id={inputId}
        size={inputSize}
        invalid={invalid}
        placeholder={props.placeholder ?? pattern.toLowerCase()}
        autoComplete="off"
        className={styles.input}
      />
      {name && (
        <input
          type="hidden"
          name={name}
          value={selected ?? ''}
          disabled={props.disabled ?? field?.disabled}
        />
      )}
      <div ref={popupRef} className={styles.popup} hidden={!isOpen}>
        <ul {...menuProps} className={styles.list}>
          {isOpen &&
            filtered.map((option, index) => (
              <li
                key={option.value}
                className={clsx(
                  styles.item,
                  highlightedIndex === index && styles.highlighted,
                  option.value === selected && styles.selected,
                )}
                {...getItemProps({ item: option, index })}
              >
                {option.label}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
