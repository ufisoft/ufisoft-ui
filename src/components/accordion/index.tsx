'use client';

import { clsx } from 'clsx';
import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { eventSource, type EventDataProps } from '../../events/define-events';
import { useEmit } from '../../events/react';
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

export interface AccordionItemProps
  extends Omit<ComponentProps<'details'>, 'title'>, EventDataProps {
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
  eventData,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const { name } = useContext(AccordionContext);
  // Uncontrolled: set the attribute once; afterwards the browser owns it.
  const [initialOpen] = useState(defaultOpen);
  const emit = useEmit();
  // The browser also fires toggle for an item rendered open: only real changes are events.
  const wasOpen = useRef(open ?? initialOpen);

  return (
    <details
      name={name}
      open={open ?? initialOpen}
      className={clsx(styles.item, className)}
      onToggle={(event) => {
        onToggle?.(event);
        const isOpen = event.currentTarget.open;
        onOpenChange?.(isOpen);
        if (isOpen === wasOpen.current) return;
        wasOpen.current = isOpen;
        emit(isOpen ? 'accordion.state.onOpen' : 'accordion.state.onClose', {
          source: eventSource(props.id, undefined, eventData),
        });
      }}
      {...props}
    >
      <summary className={styles.summary}>{title}</summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
