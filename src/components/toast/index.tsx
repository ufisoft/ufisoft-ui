'use client';

import * as RadixToast from '@radix-ui/react-toast';
import { clsx } from 'clsx';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import styles from './toast.module.css';

export type ToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  /** `danger` toasts are announced immediately (assertive); the others politely. */
  tone?: ToastTone;
  /** Milliseconds before it closes. Defaults to the provider's `duration`. */
  duration?: number;
  /** One optional action, e.g. Undo. `altText` tells screen-reader users how to do it otherwise. */
  action?: { label: string; onClick: () => void; altText?: string };
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Shows toasts from anywhere inside a `ToastProvider`. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider.');
  return context;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Default time in milliseconds before a toast closes. */
  duration?: number;
  /** Name of the notifications region. `{hotkey}` is replaced by the shortcut (F8). */
  label?: string;
  /** Announced with each toast, e.g. “Notification”. */
  toastLabel?: string;
  /** Accessible name of each toast's close button. */
  closeLabel?: string;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Renders the toast region and provides `useToast()`. Place it once, near the app root.
 * Timing, pausing on hover/focus, swipe-to-dismiss and the F8 hotkey come from Radix Toast.
 */
export function ToastProvider({
  children,
  duration = 5000,
  label = 'Notifications ({hotkey})',
  toastLabel = 'Notification',
  closeLabel = 'Close',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const viewportRef = useRef<HTMLOListElement>(null);
  const shownCount = useRef(0);

  const toast = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((current) => [...current, { ...options, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  // The region is a manual popover so it is drawn in the top layer, above a modal <dialog>.
  // Re-showing it when a toast arrives moves it above anything opened since.
  // It stays inert while a modal is open (the browser's rule); docs say to close the modal first.
  useEffect(() => {
    const viewport = viewportRef.current;
    const previous = shownCount.current;
    shownCount.current = toasts.length;
    if (!viewport || typeof viewport.showPopover !== 'function') return;
    const open = viewport.matches(':popover-open');
    if (toasts.length === 0) {
      if (open) viewport.hidePopover();
    } else if (toasts.length > previous) {
      if (open) viewport.hidePopover();
      viewport.showPopover();
    }
  }, [toasts.length]);

  return (
    <ToastContext value={value}>
      <RadixToast.Provider duration={duration} label={toastLabel}>
        {children}
        {toasts.map(({ id, title, description, tone = 'neutral', action, ...item }) => (
          <RadixToast.Root
            key={id}
            type={tone === 'danger' ? 'foreground' : 'background'}
            duration={item.duration}
            onOpenChange={(open) => {
              if (!open) dismiss(id);
            }}
            className={clsx(styles.toast, styles[tone])}
          >
            <div className={styles.text}>
              <RadixToast.Title className={styles.title}>{title}</RadixToast.Title>
              {description != null && (
                <RadixToast.Description className={styles.description}>
                  {description}
                </RadixToast.Description>
              )}
            </div>
            {action && (
              <RadixToast.Action altText={action.altText ?? action.label} asChild>
                <Button size="sm" variant="secondary" onClick={action.onClick}>
                  {action.label}
                </Button>
              </RadixToast.Action>
            )}
            <RadixToast.Close asChild>
              <IconButton aria-label={closeLabel} size="sm" variant="ghost" icon={<CloseIcon />} />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport
          ref={viewportRef}
          label={label}
          popover="manual"
          className={styles.viewport}
        />
      </RadixToast.Provider>
    </ToastContext>
  );
}
