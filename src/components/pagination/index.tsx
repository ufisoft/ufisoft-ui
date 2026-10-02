import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '../button';
import styles from './pagination.module.css';

type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

/**
 * First and last page, the current page with one neighbour on each side, and
 * ellipses for the gaps. Always 7 items once there are more than 7 pages, so
 * the controls do not jump around while paging.
 */
function getPageItems(page: number, pageCount: number): PageItem[] {
  const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (pageCount <= 7) return range(1, pageCount);
  if (page <= 4) return [...range(1, 5), 'end-ellipsis', pageCount];
  if (page >= pageCount - 3) return [1, 'start-ellipsis', ...range(pageCount - 4, pageCount)];
  return [1, 'start-ellipsis', page - 1, page, page + 1, 'end-ellipsis', pageCount];
}

export interface PaginationProps extends Omit<ComponentProps<'nav'>, 'onChange'> {
  /** Current page, starting at 1. */
  page: number;
  /** Total number of pages. Nothing is rendered when it is below 2. */
  pageCount: number;
  /** Called with the requested page, from a button or (with `getHref`) a link click. */
  onPageChange?: (page: number) => void;
  /** Renders links instead of buttons, e.g. `(page) => \`?page=${page}\``. */
  getHref?: (page: number) => string;
  /** Names the landmark. */
  'aria-label'?: string;
  previousLabel?: ReactNode;
  nextLabel?: ReactNode;
  /** Accessible name of a page control. */
  getPageLabel?: (page: number) => string;
}

/** Moves between the pages of a long list or table. */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  getHref,
  'aria-label': ariaLabel = 'Pagination',
  previousLabel = 'Previous',
  nextLabel = 'Next',
  getPageLabel = (n) => `Page ${n}`,
  className,
  ...props
}: PaginationProps) {
  if (pageCount < 2) return null;
  const current = Math.min(Math.max(page, 1), pageCount);

  function control(
    target: number,
    content: ReactNode,
    extra: { label?: string; isCurrent?: boolean; disabled?: boolean },
  ) {
    const shared = {
      variant: extra.isCurrent ? ('primary' as const) : ('ghost' as const),
      size: 'sm' as const,
      'aria-label': extra.label,
      'aria-current': extra.isCurrent ? ('page' as const) : undefined,
    };
    if (getHref) {
      // There is nowhere to go at the edge: plain text, not focusable and not announced as a link.
      return (
        <Button asChild {...shared}>
          {extra.disabled ? (
            <span aria-disabled="true">{content}</span>
          ) : (
            <a href={getHref(target)} onClick={() => onPageChange?.(target)}>
              {content}
            </a>
          )}
        </Button>
      );
    }
    return (
      <Button
        {...shared}
        disabled={extra.disabled}
        onClick={extra.isCurrent ? undefined : () => onPageChange?.(target)}
      >
        {content}
      </Button>
    );
  }

  return (
    <nav aria-label={ariaLabel} className={clsx(styles.pagination, className)} {...props}>
      <ul className={styles.list}>
        <li>{control(current - 1, previousLabel, { disabled: current === 1 })}</li>
        {getPageItems(current, pageCount).map((item) =>
          typeof item === 'number' ? (
            <li key={item} className={styles.page}>
              {control(item, item, { label: getPageLabel(item), isCurrent: item === current })}
            </li>
          ) : (
            // The page labels already say which pages exist; the gap is visual only.
            <li key={item} className={styles.ellipsis} aria-hidden="true">
              …
            </li>
          ),
        )}
        <li>{control(current + 1, nextLabel, { disabled: current === pageCount })}</li>
      </ul>
    </nav>
  );
}
