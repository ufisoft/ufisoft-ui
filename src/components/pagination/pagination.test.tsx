import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '.';

/**
 * The visible items in order: page numbers, “…” and the previous/next labels.
 * Read from the list's children because the “…” items are aria-hidden, so role queries skip them.
 */
function visibleItems() {
  const list = within(screen.getByRole('navigation')).getByRole('list');
  return Array.from(list.children, (item) => item.textContent);
}

describe('Pagination', () => {
  it('shows every page when there are 7 or fewer', () => {
    render(<Pagination page={1} pageCount={5} />);
    expect(visibleItems()).toEqual(['Previous', '1', '2', '3', '4', '5', 'Next']);
  });

  it('collapses long ranges around the current page into 7 page items', () => {
    const { rerender } = render(<Pagination page={1} pageCount={20} />);
    expect(visibleItems()).toEqual(['Previous', '1', '2', '3', '4', '5', '…', '20', 'Next']);

    rerender(<Pagination page={10} pageCount={20} />);
    expect(visibleItems()).toEqual(['Previous', '1', '…', '9', '10', '11', '…', '20', 'Next']);

    rerender(<Pagination page={20} pageCount={20} />);
    expect(visibleItems()).toEqual(['Previous', '1', '…', '16', '17', '18', '19', '20', 'Next']);
  });

  it('hides the ellipsis from assistive technology', () => {
    render(<Pagination page={10} pageCount={20} />);
    const list = within(screen.getByRole('navigation')).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(7);
    expect(list.children).toHaveLength(9);
  });

  it('names the landmark and pages, and marks the current page', () => {
    render(<Pagination page={3} pageCount={5} />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(within(nav).getByRole('button', { name: 'Page 3' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('button', { name: 'Page 2' })).not.toHaveAttribute('aria-current');
  });

  it('requests pages from buttons and disables previous on the first page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    function Controlled() {
      const [page, setPage] = useState(1);
      return (
        <Pagination
          page={page}
          pageCount={10}
          onPageChange={(next) => {
            setPage(next);
            onPageChange(next);
          }}
        />
      );
    }
    render(<Controlled />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('button', { name: 'Page 5' }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);
  });

  it('renders links with getHref and a non-link disabled control at the edge', () => {
    render(<Pagination page={5} pageCount={5} getHref={(page) => `?page=${page}`} />);
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('href', '?page=2');
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', '?page=4');
    expect(screen.queryByRole('link', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.getByText('Next')).toHaveAttribute('aria-disabled', 'true');
  });

  it('uses translated labels', () => {
    render(
      <Pagination
        page={1}
        pageCount={3}
        aria-label="Sayfalar"
        previousLabel="Önceki"
        nextLabel="Sonraki"
        getPageLabel={(n) => `Sayfa ${n}`}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Sayfalar' });
    expect(within(nav).getByRole('button', { name: 'Sonraki' })).toBeEnabled();
    expect(within(nav).getByRole('button', { name: 'Sayfa 2' })).toBeInTheDocument();
  });

  it('renders nothing for a single page and forwards ref otherwise', () => {
    const { container, rerender } = render(<Pagination page={1} pageCount={1} />);
    expect(container).toBeEmptyDOMElement();

    const ref = createRef<HTMLElement>();
    rerender(<Pagination page={1} pageCount={2} ref={ref} />);
    expect(ref.current?.tagName).toBe('NAV');
  });
});
