'use client';

import { clsx } from 'clsx';
import { useState, type ComponentProps } from 'react';
import styles from './avatar.module.css';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** The person's or entity's name: the accessible name and the source of the initials. */
  name: string;
  /** Image URL. Without it, or when it fails to load, the initials are shown. */
  src?: string;
  /** Accessible text. Defaults to `name`; pass `""` when the name is already visible next to the avatar. */
  alt?: string;
  size?: AvatarSize;
}

/**
 * Up to two initials: first and last word, e.g. “Ada King Lovelace” → “AL”.
 * Upper-casing is left to CSS, which follows the page `lang` (Turkish “i” → “İ”).
 */
function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = (word?: string) => (word ? (Array.from(word)[0] ?? '') : '');
  return words.length > 1 ? first(words[0]) + first(words[words.length - 1]) : first(words[0]);
}

/** A picture or initials that represent a person or an entity, e.g. the author of a page. */
export function Avatar({ name, src, alt = name, size = 'md', className, ...props }: AvatarProps) {
  // Remember which src failed instead of a boolean, so a new src is tried again.
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = src !== undefined && src !== failedSrc;
  const decorative = alt === '';

  return (
    <span
      className={clsx(styles.avatar, styles[size], className)}
      // The initials fallback is a picture of the name, not text to read letter by letter.
      role={showImage || decorative ? undefined : 'img'}
      aria-label={showImage || decorative ? undefined : alt}
      aria-hidden={decorative || undefined}
      {...props}
    >
      {showImage ? (
        <img className={styles.image} src={src} alt={alt} onError={() => setFailedSrc(src)} />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {getInitials(name)}
        </span>
      )}
    </span>
  );
}
