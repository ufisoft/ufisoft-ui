import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createStore, shallowEqual } from './create-store';

const initial = () => ({ selectedDate: null as Date | null, category: 'all', count: 0 });

describe('createStore', () => {
  it('starts with the initial state', () => {
    const store = createStore(initial());
    expect(store.getState()).toEqual({ selectedDate: null, category: 'all', count: 0 });
  });

  it('merges partial updates into a new state object', () => {
    const store = createStore(initial());
    const before = store.getState();
    const date = new Date(2026, 9, 3);

    store.setState({ selectedDate: date });
    expect(store.getState()).toEqual({ selectedDate: date, category: 'all', count: 0 });
    expect(store.getState()).not.toBe(before);
    expect(before.selectedDate).toBeNull();
  });

  it('accepts an updater function of the current state', () => {
    const store = createStore(initial());
    store.setState((state) => ({ count: state.count + 1 }));
    store.setState((state) => ({ count: state.count + 1 }));
    expect(store.getState().count).toBe(2);
  });

  it('notifies subscribers with the new and the previous state', () => {
    const store = createStore(initial());
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ category: 'news' });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'news' }),
      expect.objectContaining({ category: 'all' }),
    );
  });

  it('skips updates that change nothing', () => {
    const store = createStore(initial());
    const listener = vi.fn();
    store.subscribe(listener);
    const before = store.getState();

    store.setState({ category: 'all', count: 0 });
    store.setState({});
    expect(listener).not.toHaveBeenCalled();
    expect(store.getState()).toBe(before);
  });

  it('stops notifying after unsubscribe', () => {
    const store = createStore(initial());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.setState({ count: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('notifies every subscriber, even when one unsubscribes during the update', () => {
    const store = createStore(initial());
    const second = vi.fn();
    const unsubscribeFirst = store.subscribe(() => unsubscribeFirst());
    store.subscribe(second);

    store.setState({ count: 1 });
    expect(second).toHaveBeenCalledOnce();
  });

  it('keeps the state type', () => {
    const store = createStore(initial());
    expectTypeOf(store.getState().selectedDate).toEqualTypeOf<Date | null>();
    // @ts-expect-error — not a key of the state
    store.setState({ unknown: true });
    // @ts-expect-error — wrong value type
    store.setState({ count: 'one' });
  });
});

describe('shallowEqual', () => {
  it('compares one level deep', () => {
    expect(shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(shallowEqual({ a: { deep: 1 } }, { a: { deep: 1 } })).toBe(false);
    expect(shallowEqual([1, 2], [1, 2])).toBe(true);
  });
});
