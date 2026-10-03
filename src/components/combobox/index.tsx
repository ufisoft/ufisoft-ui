'use client';

import { autoUpdate, computePosition, flip, offset, size } from '@floating-ui/dom';
import { clsx } from 'clsx';
import { useCombobox } from 'downshift';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { useEmit } from '../../events/react';
import { useFormFieldContext } from '../form-field/use-form-field';
import { Input, type InputSize } from '../input';
import styles from './combobox.module.css';

export type ComboboxSize = InputSize;

export interface ComboboxItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps
  extends
    Omit<ComponentProps<'input'>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'type'>,
    EventDataProps {
  items: ComboboxItem[];
  /** Selected value (controlled). `null` for no selection. */
  value?: string | null;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string | null;
  /** Called with the newly selected value, or `null` when cleared (Escape on a closed list). */
  onValueChange?: (value: string | null) => void;
  size?: ComboboxSize;
  /** Marks the value as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
  /** Shown when no item matches the typed text. */
  emptyMessage?: ReactNode;
  /** Decides whether an item matches the typed text. Defaults to a case- and accent-insensitive “contains”. */
  filter?: (item: ComboboxItem, query: string) => boolean;
  /** Announced to screen readers while the list is open. */
  getResultsMessage?: (count: number) => string;
}

/** Lower-cases and strips accents, so “canakkale” matches “Çanakkale” and “istanbul” matches “İstanbul”. */
function normalize(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/ı/g, 'i');
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as RefObject<T | null>).current = node;
}

function defaultFilter(item: ComboboxItem, query: string) {
  return normalize(item.label).includes(normalize(query));
}

/**
 * A text input with a filtered list of options: choose one value from a long list by typing.
 * ARIA combobox behaviour comes from Downshift; positioning from Floating UI.
 */
export function Combobox({
  items,
  value,
  defaultValue = null,
  onValueChange,
  size: inputSize = 'md',
  invalid,
  emptyMessage = 'No results',
  filter = defaultFilter,
  getResultsMessage = (count) => `${count} ${count === 1 ? 'result' : 'results'} available`,
  id,
  eventData,
  className,
  ref,
  ...props
}: ComboboxProps) {
  const field = useFormFieldContext();
  const generatedId = useId();
  const inputId = id ?? field?.controlId ?? generatedId;

  const [innerValue, setInnerValue] = useState(defaultValue);
  const selectedValue = value !== undefined ? value : innerValue;
  const selectedItem = items.find((item) => item.value === selectedValue) ?? null;
  const emit = useEmit();
  const source = () => eventSource(id, props.name, eventData);

  const [inputValue, setInputValue] = useState(selectedItem?.label ?? '');
  // Show every item while the input still shows the current selection.
  const filtered =
    inputValue === '' || inputValue === selectedItem?.label
      ? items
      : items.filter((item) => filter(item, inputValue));

  const { isOpen, highlightedIndex, getInputProps, getMenuProps, getItemProps } =
    useCombobox<ComboboxItem>({
      items: filtered,
      itemToString: (item) => item?.label ?? '',
      selectedItem,
      inputValue,
      onInputValueChange: ({ inputValue: next }) => setInputValue(next),
      onSelectedItemChange: ({ selectedItem: next }) => {
        const nextValue = next?.value ?? null;
        if (value === undefined) setInnerValue(nextValue);
        onValueChange?.(nextValue);
        emit('combobox.state.onChange', {
          value: nextValue,
          previousValue: selectedValue,
          source: source(),
        });
      },
      // Downshift reports the close before the selection: take the value from the same change.
      onIsOpenChange: ({ isOpen: open, selectedItem: item }) =>
        emit(open ? 'combobox.state.onOpen' : 'combobox.state.onClose', {
          value: item?.value ?? null,
          source: source(),
        }),
      isItemDisabled: (item) => Boolean(item.disabled),
      inputId,
      labelId: field?.labelId,
      getA11yStatusMessage: ({ isOpen: open }) => (open ? getResultsMessage(filtered.length) : ''),
      stateReducer: (_state, { type, changes }) =>
        // Leaving the field shows the selection again instead of half-typed text.
        type === useCombobox.stateChangeTypes.InputBlur
          ? { ...changes, inputValue: changes.selectedItem?.label ?? '' }
          : changes,
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

  const { ref: downshiftInputRef, ...inputProps } = getInputProps({
    ...props,
    onKeyDown: (event) => {
      props.onKeyDown?.(event);
      // Escape on a closed list clears the value; keep that press from also closing a
      // surrounding modal <dialog>. With nothing to clear, Escape reaches the dialog.
      if (event.key === 'Escape' && !isOpen && (selectedItem || inputValue)) {
        event.preventDefault();
      }
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
    <div ref={anchorRef} className={clsx(styles.combobox, className)}>
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
        className={styles.input}
      />
      <div ref={popupRef} className={styles.popup} hidden={!isOpen}>
        <ul {...menuProps} className={styles.list} hidden={filtered.length === 0}>
          {isOpen &&
            filtered.map((item, index) => (
              <li
                key={item.value}
                className={clsx(
                  styles.item,
                  highlightedIndex === index && styles.highlighted,
                  item.value === selectedValue && styles.selected,
                )}
                {...getItemProps({ item, index })}
              >
                {item.label}
              </li>
            ))}
        </ul>
        {isOpen && filtered.length === 0 && <div className={styles.empty}>{emptyMessage}</div>}
      </div>
    </div>
  );
}
