'use client';

import { createContext, useContext, type AriaAttributes } from 'react';

export interface FormFieldContextValue {
  controlId: string;
  descriptionId: string;
  messageId: string;
  hasDescription: boolean;
  hasMessage: boolean;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  registerDescription: () => () => void;
  registerMessage: () => () => void;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/** Internal: raw field context for FormLabel / FormDescription / FormMessage. */
export function useFormFieldContext() {
  return useContext(FormFieldContext);
}

export interface FormFieldControlProps {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
  required?: boolean;
  disabled?: boolean;
}

/**
 * Returns the accessibility props a form control needs to join the surrounding
 * `FormField`. Props passed directly to the control always win.
 * Outside a `FormField` it returns the given props unchanged.
 *
 * Use it to connect custom or third-party controls to `FormField`.
 */
export function useFormField<T extends FormFieldControlProps>(props: T): T {
  const field = useContext(FormFieldContext);
  if (!field) return props;

  const describedBy =
    [
      props['aria-describedby'],
      field.hasDescription && field.descriptionId,
      field.hasMessage && field.messageId,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const invalid = props['aria-invalid'] ?? field.invalid;

  // Cast: the merged values are the same prop types T declares.
  return {
    ...props,
    id: props.id ?? field.controlId,
    'aria-describedby': describedBy,
    'aria-invalid': invalid || undefined,
    required: props.required ?? (field.required || undefined),
    disabled: props.disabled ?? (field.disabled || undefined),
  } as T;
}
