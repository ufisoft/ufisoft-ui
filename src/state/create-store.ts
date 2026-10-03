/**
 * A small observable store for application state. Framework-independent: React reads it through
 * `useStore`, anything else through `subscribe`. A store never emits events on its own — state is
 * what *is*; events (see `createEventBus`) are what *happened*.
 */

export type StoreListener<T> = (state: T, previousState: T) => void;

/** A partial state, or a function of the current state that returns one. */
export type StoreUpdate<T> = Partial<T> | ((state: T) => Partial<T>);

export interface Store<T extends object> {
  /** The current state. Treat it as read-only: change it with `setState`. */
  getState: () => T;
  /**
   * Merges the given keys into the state. Listeners are called only when at least one value
   * changed (compared with `Object.is`); the new state is a new object, the old one is untouched.
   */
  setState: (update: StoreUpdate<T>) => void;
  /** Calls `listener` after every change. Returns the function that unsubscribes it. */
  subscribe: (listener: StoreListener<T>) => () => void;
}

export function createStore<T extends object>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<StoreListener<T>>();

  return {
    getState: () => state,
    setState: (update) => {
      const partial = typeof update === 'function' ? update(state) : update;
      const changed = (Object.keys(partial) as (keyof T)[]).some(
        (key) => !Object.is(partial[key], state[key]),
      );
      if (!changed) return;
      const previousState = state;
      state = { ...state, ...partial };
      // A copy, so a listener that unsubscribes (or subscribes) during the loop does not skip anyone.
      for (const listener of [...listeners]) listener(state, previousState);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Equality for selectors that return a new object or array each time: compares one level deep. */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  const keysA = Object.keys(a) as (keyof T)[];
  const keysB = Object.keys(b);
  return keysA.length === keysB.length && keysA.every((key) => Object.is(a[key], b[key]));
}
