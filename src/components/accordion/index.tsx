'use client';

import { clsx } from 'clsx';
import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import styles from './accordion.module.css';

export type AccordionType = 'single' | 'multiple';

const AccordionContext = createContext<{ name?: string }>({});

export interface AccordionProps extends ComponentProps<'div'> {
  /** `single`: opening one item closes the others. `multiple`: items open independently. */
  type?: AccordionType;
}

/**
 * A stack of collapsible sections built on native `<details>`/`<summary>`:
 * keyboard and exclusive opening (`<details name>`) come from the browser.
 */
export function Accordion({ type = 'multiple', className, ...props }: AccordionProps) {
  const name = useId();
  return (
    <AccordionContext value={{ name: type === 'single' ? name : undefined }}>
      <div className={clsx(styles.accordion, className)} {...props} />
    </AccordionContext>
  );
}

export interface AccordionItemProps extends Omit<ComponentProps<'details'>, 'title'> {
  /** The always-visible header; it toggles the item. */
  title: ReactNode;
  /** Open on first render (uncontrolled). */
  defaultOpen?: boolean;
  /** Open state (controlled); pair with `onOpenChange`. */
  open?: boolean;
  /** Called with the new open state when the user (or a sibling in a `single` accordion) toggles it. */
  onOpenChange?: (open: boolean) => void;
}

export function AccordionItem({
  title,
  defaultOpen = false,
  open,
  onOpenChange,
  onToggle,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const { name } = useContext(AccordionContext);
  // Uncontrolled: set the attribute once; afterwards the browser owns it.
  const [initialOpen] = useState(defaultOpen);

  return (
    <details
      name={name}
      open={open ?? initialOpen}
      className={clsx(styles.item, className)}
      onToggle={(event) => {
        onToggle?.(event);
        onOpenChange?.(event.currentTarget.open);
      }}
      {...props}
    >
      <summary className={styles.summary}>{title}</summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
