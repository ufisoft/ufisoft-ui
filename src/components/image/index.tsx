'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import styles from './image.module.css';

export type ImageFit = 'cover' | 'contain';
export type ImageRatio = 'auto' | '1/1' | '4/3' | '3/2' | '16/9';
export type ImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface ImageProps extends Omit<ComponentProps<'img'>, 'alt'> {
  /** Required. Describe the image, or pass `""` when it is decorative. */
  alt: string;
  /** How the image fills its box when `ratio` differs from its own. */
  fit?: ImageFit;
  /** Box aspect ratio. `auto` keeps the image's own; the others fill the parent's width. */
  ratio?: ImageRatio;
  radius?: ImageRadius;
  /** Shown in the same box when the image fails to load. Defaults to an empty placeholder. */
  fallback?: ReactNode;
}

const ratioClass: Record<ImageRatio, string | undefined> = {
  auto: undefined,
  '1/1': styles['ratio-1-1'],
  '4/3': styles['ratio-4-3'],
  '3/2': styles['ratio-3-2'],
  '16/9': styles['ratio-16-9'],
};

/**
 * A native `<img>` that loads lazily, keeps an aspect ratio and shows a fallback when it fails.
 * `ref` reaches the `<img>` (it is `null` while the fallback is shown).
 */
export function Image({
  alt,
  fit = 'cover',
  ratio = 'auto',
  radius = 'none',
  fallback,
  src,
  loading = 'lazy',
  decoding = 'async',
  onError,
  className,
  ref,
  ...props
}: ImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  // The failed source, so a new `src` is tried again.
  const [failedSrc, setFailedSrc] = useState<string>();
  const failed = src === undefined || src === '' || failedSrc === src;

  // An image can fail before React attaches onError (server-rendered HTML): check once mounted.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0 && img.currentSrc) setFailedSrc(src);
  }, [src]);

  const boxClass = clsx(styles.image, ratioClass[ratio], styles[`radius-${radius}`], className);

  if (failed) {
    return (
      <span
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={clsx(boxClass, styles.fallback)}
      >
        {fallback}
      </span>
    );
  }

  return (
    <img
      ref={(node) => {
        imgRef.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={(event) => {
        onError?.(event);
        setFailedSrc(src);
      }}
      className={clsx(boxClass, styles[fit])}
      {...props}
    />
  );
}
