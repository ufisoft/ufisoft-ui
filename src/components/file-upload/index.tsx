'use client';

import { clsx } from 'clsx';
import {
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
  type ReactNode,
} from 'react';
import { useFormField } from '../form-field';
import styles from './file-upload.module.css';

/** A file that was not accepted, and why. */
export interface FileRejection {
  file: File;
  reason: 'type' | 'size';
}

export interface FileUploadProps extends Omit<
  ComponentProps<'input'>,
  'type' | 'value' | 'defaultValue' | 'size' | 'children'
> {
  /** Called with the accepted files each time the user picks or drops files. */
  onFilesChange?: (files: File[]) => void;
  /** Called with the files that do not match `accept` or exceed `maxSize`. */
  onFilesReject?: (rejections: FileRejection[]) => void;
  /** Largest accepted file, in bytes. */
  maxSize?: number;
  /** Marks the field as invalid (sets `aria-invalid`). Inherited from `FormField`. */
  invalid?: boolean;
  /** Content of the drop zone. Describe what can be uploaded. */
  children?: ReactNode;
}

/** `accept` tokens: `.pdf`, `image/*`, `image/png`. */
function matchesAccept(file: File, accept: string | undefined) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .some((token) =>
      token.startsWith('.')
        ? name.endsWith(token)
        : token.endsWith('/*')
          ? type.startsWith(token.slice(0, -1))
          : type === token,
    );
}

/**
 * A drop zone around a native `<input type="file">`: click or press Enter/Space to pick files,
 * or drop them on it. The input stays in the form, so files submit natively.
 */
export function FileUpload({
  onFilesChange,
  onFilesReject,
  maxSize,
  invalid,
  accept,
  multiple,
  onChange,
  className,
  children = 'Drop files here or click to choose',
  ref,
  ...props
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  const promptId = useId();
  const [dragging, setDragging] = useState(false);

  const fieldProps = useFormField({
    ...props,
    'aria-invalid': invalid ?? props['aria-invalid'],
    'aria-describedby': clsx(promptId, props['aria-describedby']),
  });
  const disabled = fieldProps.disabled;

  function receive(list: FileList | null, fromDrop: boolean) {
    const picked = Array.from(list ?? []);
    const rejections: FileRejection[] = [];
    const accepted = picked.filter((file) => {
      const reason = !matchesAccept(file, accept)
        ? 'type'
        : maxSize !== undefined && file.size > maxSize
          ? 'size'
          : null;
      if (reason) rejections.push({ file, reason });
      return !reason;
    });
    const files = multiple ? accepted : accepted.slice(0, 1);

    // Keep the input's files in line with what was accepted, so the form submits the same files.
    const input = inputRef.current;
    if (
      input &&
      (fromDrop || files.length !== picked.length) &&
      typeof DataTransfer !== 'undefined'
    ) {
      const transfer = new DataTransfer();
      files.forEach((file) => transfer.items.add(file));
      input.files = transfer.files;
    }

    if (rejections.length > 0) onFilesReject?.(rejections);
    onFilesChange?.(files);
  }

  const dragProps = disabled
    ? {}
    : {
        onDragOver: (event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragging(true);
        },
        onDragLeave: (event: DragEvent<HTMLDivElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        },
        onDrop: (event: DragEvent<HTMLDivElement>) => {
          // Handled here, not by the input: `accept` and `multiple` apply to dropped files too.
          event.preventDefault();
          setDragging(false);
          receive(event.dataTransfer.files, true);
        },
      };

  return (
    <div
      className={clsx(styles.fileUpload, dragging && styles.dragging, className)}
      data-disabled={disabled || undefined}
      {...dragProps}
    >
      <span id={promptId} className={styles.prompt}>
        <UploadIcon />
        {children}
      </span>
      {/* Covers the zone at zero opacity: a click anywhere opens the native file picker. */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        // No “No file chosen” tooltip over the whole zone.
        title=""
        className={styles.input}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          receive(event.currentTarget.files, false);
        }}
        {...fieldProps}
      />
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M12 16V4m0 0L7 9m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" strokeLinecap="round" />
    </svg>
  );
}
