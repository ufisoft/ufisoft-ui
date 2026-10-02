'use client';

import { clsx } from 'clsx';
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react';
import { useFormField, useFormFieldContext } from '../form-field/use-form-field';
import styles from './radio.module.css';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

interface RadioGroupContextValue {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<
  ComponentProps<'div'>,
  'onChange' | 'defaultValue' | 'role'
> {
  /** Shared `name` of the radios. Generated when omitted; set it for native form submission. */
  name?: string;
  /** Selected value (controlled). */
  value?: string;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  orientation?: RadioGroupOrientation;
  /** Disables every radio in the group. Inherited from `FormField`. */
  disabled?: boolean;
  /** One of the radios must be selected. Inherited from `FormField`. */
  required?: boolean;
  /** Marks the group as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
}

/**
 * Groups `Radio`s into one single-choice field. Selection and arrow-key
 * navigation are the browser's native radio behaviour.
 */
export function RadioGroup({
  name,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  disabled,
  required,
  invalid,
  className,
  ...props
}: RadioGroupProps) {
  const generatedName = useId();
  const field = useFormFieldContext();
  const {
    disabled: groupDisabled,
    required: groupRequired,
    'aria-invalid': ariaInvalid,
    ...groupProps
  } = useFormField({
    ...props,
    disabled,
    required,
    'aria-invalid': invalid ?? props['aria-invalid'],
  });

  // A <label for> cannot name a group, so point at the FormLabel instead.
  const labelledBy = props['aria-labelledby'] ?? (props['aria-label'] ? undefined : field?.labelId);

  return (
    <RadioGroupContext
      value={{
        name: name ?? generatedName,
        value,
        defaultValue,
        onValueChange,
        disabled: groupDisabled,
        required: groupRequired,
      }}
    >
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-invalid={ariaInvalid}
        aria-required={groupRequired || undefined}
        aria-disabled={groupDisabled || undefined}
        className={clsx(styles.group, styles[orientation], className)}
        {...groupProps}
      />
    </RadioGroupContext>
  );
}

export interface RadioProps extends Omit<ComponentProps<'input'>, 'type' | 'children' | 'value'> {
  /** Visible label. Clicking it selects the radio. */
  children?: ReactNode;
  value: string;
}

export function Radio({ children, className, onChange, ...props }: RadioProps) {
  const group = useContext(RadioGroupContext);

  let selection = {};
  if (group?.value !== undefined) selection = { checked: group.value === props.value };
  else if (group?.defaultValue !== undefined)
    selection = { defaultChecked: group.defaultValue === props.value };

  return (
    <label className={clsx(styles.root, className)}>
      <input
        type="radio"
        className={styles.input}
        name={group?.name}
        required={group?.required}
        {...selection}
        {...props}
        disabled={group?.disabled || props.disabled}
        onChange={(event) => {
          onChange?.(event);
          group?.onValueChange?.(event.target.value);
        }}
      />
      {children != null && <span className={styles.label}>{children}</span>}
    </label>
  );
}
