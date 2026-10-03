'use client';

import { clsx } from 'clsx';
import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from 'react';
import { IconButton } from '../icon-button';
import { Progress } from '../progress';
import styles from './file-preview.module.css';

/** A file that is already stored somewhere (e.g. on the server). */
export interface FileInfo {
  name: string;
  /** In bytes. */
  size?: number;
  /** MIME type, e.g. `image/png`. */
  type?: string;
  /** Address of the file; used as the thumbnail for images. */
  url?: string;
}

export interface FilePreviewProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** A `File` the user picked, or a stored file's details. */
  file: File | FileInfo;
  /** Shows a remove button; called when it is pressed. */
  onRemove?: () => void;
  /** Accessible name of the remove button. Defaults to “Remove <file name>”. */
  removeLabel?: string;
  /** Upload progress, 0–100. Shows a progress bar while below 100. */
  progress?: number;
  /** Shows an error instead of the size, e.g. “File is too large”. */
  error?: ReactNode;
  /** Locale for the file size, e.g. `tr`. Defaults to the browser's. */
  locale?: string;
}

const units = ['B', 'KB', 'MB', 'GB', 'TB'];

function formatSize(bytes: number, locale?: string) {
  const exponent = Math.min(Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)), 4);
  const value = bytes / 1024 ** exponent;
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: exponent === 0 ? 0 : 1 });
  return `${number.format(value)} ${units[exponent]}`;
}

function extension(name: string) {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1, dot + 5).toUpperCase() : '';
}

/**
 * An image thumbnail: a stored file's `url`, or an object URL for a picked `File`. The object URL
 * is set on the element directly and revoked on cleanup, so each effect run owns its own URL.
 */
function Thumbnail({ file }: { file: File | FileInfo }) {
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (!(file instanceof File) || !imgRef.current) return;
    const url = URL.createObjectURL(file);
    imgRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <img
      ref={imgRef}
      src={file instanceof File ? undefined : file.url}
      alt=""
      className={styles.image}
    />
  );
}

/** One file with its thumbnail, name, size, upload progress or error, and an optional remove button. */
export function FilePreview({
  file,
  onRemove,
  removeLabel,
  progress,
  error,
  locale,
  className,
  ...props
}: FilePreviewProps) {
  // A stored image needs a url; a picked image file always has a thumbnail.
  const hasThumbnail =
    (file.type?.startsWith('image/') ?? false) && (file instanceof File || Boolean(file.url));
  const nameId = useId();
  const uploading = progress !== undefined && progress < 100 && error == null;

  return (
    <div className={clsx(styles.filePreview, error != null && styles.failed, className)} {...props}>
      <span className={styles.thumbnail} aria-hidden="true">
        {hasThumbnail ? (
          <Thumbnail file={file} />
        ) : (
          <>
            <FileIcon />
            <span className={styles.extension}>{extension(file.name)}</span>
          </>
        )}
      </span>
      <span className={styles.details}>
        <span id={nameId} className={styles.name} title={file.name}>
          {file.name}
        </span>
        {error != null ? (
          <span className={styles.error}>{error}</span>
        ) : (
          file.size !== undefined && (
            <span className={styles.meta}>{formatSize(file.size, locale)}</span>
          )
        )}
        {uploading && <Progress value={progress} size="sm" aria-labelledby={nameId} />}
      </span>
      {onRemove && (
        <IconButton
          variant="ghost"
          size="sm"
          icon={<CloseIcon />}
          aria-label={removeLabel ?? `Remove ${file.name}`}
          onClick={onRemove}
        />
      )}
    </div>
  );
}

function FileIcon() {
  return (
    <svg
      className={styles.fileIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" strokeLinejoin="round" />
      <path d="M14 3v5h5" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}
