'use client';

import { clsx } from 'clsx';
import { useCallback, useEffect, useId, useMemo, useState, type ComponentProps } from 'react';
import { Label, type LabelProps } from '../label';
import styles from './form-field.module.css';
import { FormFieldContext, useFormFieldContext } from './use-form-field';

export { useFormField, type FormFieldControlProps } from './use-form-field';

export interface FormFieldProps extends ComponentProps<'div'> {
  /** Id of the control. Generated when omitted. */
  controlId?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Groups a label, a control, a description and a validation message,
 * and wires their ids and aria attributes together.
 */
export function FormField({
  controlId,
  invalid = false,
  required = false,
  disabled = false,
  className,
  children,
  ...props
}: FormFieldProps) {
  const baseId = useId();
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const registerDescription = useCallback(() => {
    setDescriptionCount((count) => count + 1);
    return () => setDescriptionCount((count) => count - 1);
  }, []);

  const registerMessage = useCallback(() => {
    setMessageCount((count) => count + 1);
    return () => setMessageCount((count) => count - 1);
  }, []);

  const value = useMemo(
    () => ({
      controlId: controlId ?? `${baseId}-control`,
      labelId: `${baseId}-label`,
      descriptionId: `${baseId}-description`,
      messageId: `${baseId}-message`,
      hasDescription: descriptionCount > 0,
      hasMessage: messageCount > 0,
      invalid,
      required,
      disabled,
      registerDescription,
      registerMessage,
    }),
    [
      controlId,
      baseId,
      descriptionCount,
      messageCount,
      invalid,
      required,
      disabled,
      registerDescription,
      registerMessage,
    ],
  );

  return (
    <FormFieldContext value={value}>
      <div
        className={clsx(styles.field, className)}
        data-disabled={disabled || undefined}
        {...props}
      >
        {children}
      </div>
    </FormFieldContext>
  );
}

export type FormLabelProps = Omit<LabelProps, 'htmlFor'>;

export function FormLabel(props: FormLabelProps) {
  const field = useFormFieldContext();
  return (
    <Label id={field?.labelId} htmlFor={field?.controlId} required={field?.required} {...props} />
  );
}

export type FormDescriptionProps = ComponentProps<'p'>;

export function FormDescription({ className, ...props }: FormDescriptionProps) {
  const field = useFormFieldContext();
  const register = field?.registerDescription;
  useEffect(() => register?.(), [register]);

  return <p id={field?.descriptionId} className={clsx(styles.description, className)} {...props} />;
}

export type FormMessageProps = ComponentProps<'p'>;

/**
 * Validation feedback for the field. Styled as an error while the field is `invalid`.
 * Render it conditionally; it is linked to the control via `aria-describedby`.
 */
export function FormMessage({ className, ...props }: FormMessageProps) {
  const field = useFormFieldContext();
  const register = field?.registerMessage;
  useEffect(() => register?.(), [register]);

  return (
    <p
      id={field?.messageId}
      className={clsx(styles.message, field?.invalid && styles.invalid, className)}
      {...props}
    />
  );
}
