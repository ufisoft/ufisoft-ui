import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import type { ComponentProps } from 'react';
import styles from './breadcrumb.module.css';

export interface BreadcrumbProps extends ComponentProps<'nav'> {
  /** Names the landmark. Change it when the page has more than one breadcrumb. */
  'aria-label'?: string;
}

/** Shows where the current page sits in the site hierarchy. Children are `BreadcrumbItem`s. */
export function Breadcrumb({
  'aria-label': ariaLabel = 'Breadcrumb',
  className,
  children,
  ...props
}: BreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel} className={clsx(styles.breadcrumb, className)} {...props}>
      <ol className={styles.list}>{children}</ol>
    </nav>
  );
}

export interface BreadcrumbItemProps extends ComponentProps<'a'> {
  /** The current page: rendered as plain text with `aria-current="page"`, not as a link. */
  current?: boolean;
  /** Renders the single child element as the link instead of an `<a>`, e.g. a router link. */
  asChild?: boolean;
}

/** One level of the trail. `className` goes to the `<li>`; all other props go to the link. */
export function BreadcrumbItem({
  current = false,
  asChild = false,
  className,
  children,
  ...props
}: BreadcrumbItemProps) {
  const Link = asChild ? Slot : 'a';
  return (
    <li className={clsx(styles.item, className)}>
      {current ? (
        <span className={styles.current} aria-current="page">
          {children}
        </span>
      ) : (
        <Link className={styles.link} {...props}>
          {children}
        </Link>
      )}
    </li>
  );
}
