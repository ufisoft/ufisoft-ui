import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createStore, shallowEqual, type Store } from './create-store';
import { useStore } from './use-store';

interface Filters {
  category: string;
  page: number;
  tags: string[];
}

function setup() {
  return createStore<Filters>({ category: 'all', page: 1, tags: [] });
}

function counter() {
  const renders = { count: 0 };
  return renders;
}

describe('useStore', () => {
  it('reads the whole state and re-renders on every change', () => {
    const store = setup();
    const renders = counter();
    function Whole() {
      renders.count += 1;
      const state = useStore(store);
      return <p>{`${state.category}/${state.page}`}</p>;
    }
    render(<Whole />);
    expect(screen.getByText('all/1')).toBeInTheDocument();

    act(() => store.setState({ page: 2 }));
    expect(screen.getByText('all/2')).toBeInTheDocument();
    act(() => store.setState({ category: 'news' }));
    expect(renders.count).toBe(3);
  });

  it('re-renders a selector only when its slice changes', () => {
    const store = setup();
    const renders = counter();
    function Category() {
      renders.count += 1;
      const category = useStore(store, (state) => state.category);
      return <p>{category}</p>;
    }
    render(<Category />);

    act(() => store.setState({ page: 2 }));
    act(() => store.setState({ page: 3 }));
    expect(renders.count).toBe(1);

    act(() => store.setState({ category: 'news' }));
    expect(screen.getByText('news')).toBeInTheDocument();
    expect(renders.count).toBe(2);
  });

  it('uses isEqual for selectors that build a new object', () => {
    const store = setup();
    const renders = counter();
    function Summary({ s }: { s: Store<Filters> }) {
      renders.count += 1;
      const { category, page } = useStore(
        s,
        (state) => ({ category: state.category, page: state.page }),
        shallowEqual,
      );
      return <p>{`${category}:${page}`}</p>;
    }
    render(<Summary s={store} />);

    act(() => store.setState({ tags: ['a'] }));
    expect(renders.count).toBe(1);
    act(() => store.setState({ page: 4 }));
    expect(screen.getByText('all:4')).toBeInTheDocument();
    expect(renders.count).toBe(2);
  });

  it('follows a selector that depends on props', () => {
    const store = createStore({ items: ['a', 'b', 'c'] });
    function Item({ index }: { index: number }) {
      return <p>{useStore(store, (state) => state.items[index])}</p>;
    }
    const { rerender } = render(<Item index={0} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    rerender(<Item index={2} />);
    expect(screen.getByText('c')).toBeInTheDocument();
  });

  it('unsubscribes on unmount', () => {
    const store = setup();
    function Page() {
      return <p>{useStore(store, (state) => state.page)}</p>;
    }
    const { unmount } = render(<Page />);
    unmount();
    expect(() => act(() => store.setState({ page: 9 }))).not.toThrow();
  });
});
