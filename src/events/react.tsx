'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  type ReactNode,
} from 'react';
import type { EventBus, EventListener } from './event-bus';
import { eventBus, type UfiEventMap, type UfiEventName } from './registry';

type UfiEventBus = EventBus<UfiEventMap>;

const EventBusContext = createContext<UfiEventBus | null>(null);

export interface EventBusProviderProps {
  /** The bus for every UfiSoft UI component inside, e.g. one per request or per test. */
  bus: UfiEventBus;
  children: ReactNode;
}

/**
 * Makes components inside emit on `bus` instead of the global `eventBus`: isolates requests on
 * the server, tests, or several apps on one page.
 */
export function EventBusProvider({ bus, children }: EventBusProviderProps) {
  return <EventBusContext value={bus}>{children}</EventBusContext>;
}

/** The bus components here emit on: the nearest `EventBusProvider`'s, or the global `eventBus`. */
export function useEventBus(): UfiEventBus {
  return useContext(EventBusContext) ?? eventBus;
}

/** Listens to one event while the component is mounted. The latest `listener` is always called. */
export function useEventListener<N extends UfiEventName>(
  name: N,
  listener: EventListener<UfiEventMap[N], N>,
): void {
  const bus = useEventBus();
  const onEvent = useEffectEvent(listener);
  useEffect(() => bus.on(name, (payload, meta) => onEvent(payload, meta)), [bus, name]);
}

/*
 * Internal: a composite component silences the components it uses inside, so only it emits —
 * e.g. DatePicker's calendar button, the Modal inside a Drawer. Components that render the
 * application's content (Modal's body) turn events back on around it.
 */
const SilentContext = createContext(false);

export function EventScope({ silent, children }: { silent: boolean; children: ReactNode }) {
  return <SilentContext value={silent}>{children}</SilentContext>;
}

/** Internal: the emit function for a component — a no-op inside a silenced scope. */
export function useEmit(): UfiEventBus['emit'] {
  const bus = useEventBus();
  const silent = useContext(SilentContext);
  return useCallback<UfiEventBus['emit']>(
    (name, payload) => {
      if (!silent) bus.emit(name, payload);
    },
    [bus, silent],
  );
}
