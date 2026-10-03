/**
 * A typed publish/subscribe bus. Framework-independent: components publish what happened,
 * anything — another component, the application, devtools — can listen without knowing who
 * published it. An event reports something that happened; it is not state (see `createStore`).
 */

import type { EventMapOf, EventRegistry } from './define-events';
import { isDevelopment, logEvent } from './logger';

/** Event name → payload type. Interfaces work too: `interface MyEvents { 'a.state.onB': { … } }`. */
export type EventMap<M> = Record<keyof M, object>;

export interface EventMeta<N extends string = string> {
  name: N;
  /** `Date.now()` when the event was emitted. */
  timestamp: number;
}

export type EventListener<P, N extends string = string> = (payload: P, meta: EventMeta<N>) => void;

/** Any event of a map, with its name: what `onAny` listeners receive. */
export type AnyEvent<M extends EventMap<M>> = {
  [N in keyof M & string]: EventMeta<N> & { payload: M[N] };
}[keyof M & string];

export type Unsubscribe = () => void;

export interface EventBus<M extends EventMap<M>> {
  /** Calls every listener of `name` with the payload, in subscription order. */
  emit: <N extends keyof M & string>(name: N, payload: M[N]) => void;
  /** Listens to one event. Returns the function that stops listening. */
  on: <N extends keyof M & string>(name: N, listener: EventListener<M[N], N>) => Unsubscribe;
  /** Listens to the next emission of one event only. */
  once: <N extends keyof M & string>(name: N, listener: EventListener<M[N], N>) => Unsubscribe;
  /** Stops a listener added with `on`. */
  off: <N extends keyof M & string>(name: N, listener: EventListener<M[N], N>) => void;
  /** Listens to every event, e.g. for logging or devtools. */
  onAny: (listener: (event: AnyEvent<M>) => void) => Unsubscribe;
  /** Turns console logging on or off. It never logs in production builds. */
  setDebug: (enabled: boolean) => void;
  /** Removes every listener — for tests and teardown. */
  clear: () => void;
}

export interface EventBusOptions<R extends EventRegistry> {
  /** Event definitions; the logger shows their descriptions and the map type is inferred from them. */
  registry?: R;
  /** Log every event to the console. Defaults to on in development, off otherwise. */
  debug?: boolean;
}

type Handler = (payload: unknown, meta: EventMeta) => void;

/** A listener that throws must not break the component that emitted, nor the other listeners. */
function report(error: unknown) {
  if (typeof globalThis.reportError === 'function') globalThis.reportError(error);
  else console.error(error);
}

/** Creates a bus typed by a registry: `createEventBus({ registry })`. */
export function createEventBus<R extends EventRegistry>(
  options: EventBusOptions<R> & { registry: R },
): EventBus<EventMapOf<R>>;
/** Creates a bus typed by an explicit map: `createEventBus<MyEvents>()`. */
export function createEventBus<M extends EventMap<M>>(options?: { debug?: boolean }): EventBus<M>;
// The overloads are the public signatures; the implementation works on untyped names and payloads.
export function createEventBus(options: EventBusOptions<EventRegistry> = {}): object {
  const listeners = new Map<string, Set<Handler>>();
  const anyListeners = new Set<(event: EventMeta & { payload: unknown }) => void>();
  let debug = options.debug ?? isDevelopment();

  function on(name: string, listener: Handler): Unsubscribe {
    let set = listeners.get(name);
    if (!set) listeners.set(name, (set = new Set()));
    set.add(listener);
    return () => off(name, listener);
  }

  function off(name: string, listener: Handler) {
    listeners.get(name)?.delete(listener);
  }

  const bus = {
    emit: (name: string, payload: unknown) => {
      const meta: EventMeta = { name, timestamp: Date.now() };
      // Never in production: the bundler makes the condition false and minifiers drop the block.
      if (process.env.NODE_ENV !== 'production' && debug) {
        logEvent({ ...meta, payload, description: options.registry?.[name]?.description });
      }
      // Copies, so listeners that unsubscribe (or `once`) during the loop do not skip others.
      for (const listener of [...(listeners.get(name) ?? [])]) {
        try {
          listener(payload, meta);
        } catch (error) {
          report(error);
        }
      }
      for (const listener of [...anyListeners]) {
        try {
          listener({ ...meta, payload });
        } catch (error) {
          report(error);
        }
      }
    },
    on,
    once: (name: string, listener: Handler) => {
      const unsubscribe = on(name, (payload, meta) => {
        unsubscribe();
        listener(payload, meta);
      });
      return unsubscribe;
    },
    off,
    onAny: (listener: (event: EventMeta & { payload: unknown }) => void) => {
      anyListeners.add(listener);
      return () => {
        anyListeners.delete(listener);
      };
    },
    setDebug: (enabled: boolean) => {
      debug = enabled;
    },
    clear: () => {
      listeners.clear();
      anyListeners.clear();
    },
  };
  return bus;
}
