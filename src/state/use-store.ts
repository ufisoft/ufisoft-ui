'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';
import type { Store } from './create-store';

/**
 * Reads a store in a React component and re-renders when the read value changes.
 *
 * - `useStore(store)` returns the whole state: the component renders after every change.
 * - `useStore(store, selector)` returns a slice: the component renders only when the slice changes
 *   (compared with `isEqual`, `Object.is` by default; pass `shallowEqual` for selectors that build
 *   a new object or array).
 */
export function useStore<T extends object>(store: Store<T>): T;
export function useStore<T extends object, S>(
  store: Store<T>,
  selector: (state: T) => S,
  isEqual?: (a: S, b: S) => boolean,
): S;
export function useStore<T extends object, S>(
  store: Store<T>,
  selector?: (state: T) => S,
  isEqual: (a: S, b: S) => boolean = Object.is,
): T | S {
  // The last state, selector and selection: an equal selection returns the same reference, so
  // useSyncExternalStore sees no change and skips the render. The selector is part of the key, so
  // an inline selector that depends on props (`(s) => s.items[index]`) is never served stale.
  const cache = useRef<{ state: T; selector: (state: T) => S; selection: S } | null>(null);

  const getSnapshot = useCallback((): T | S => {
    const state = store.getState();
    if (!selector) return state;
    const cached = cache.current;
    if (cached && Object.is(cached.state, state) && cached.selector === selector) {
      return cached.selection;
    }
    const next = selector(state);
    const selection = cached && isEqual(cached.selection, next) ? cached.selection : next;
    cache.current = { state, selector, selection };
    return selection;
  }, [store, selector, isEqual]);

  // The server renders the current state too, so the first client render matches it.
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
