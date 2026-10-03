import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableColumn, type DataTableProps } from '.';

interface Item {
  id: number;
  name: string;
}

const makeItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

const columns: DataTableColumn<Item>[] = [
  { id: 'name', header: 'Name', value: (item) => item.name },
];

function Items(props: Partial<DataTableProps<Item>>) {
  return (
    <DataTable
      caption="Items"
      columns={columns}
      data={makeItems(5)}
      getRowId={(item) => String(item.id)}
      {...props}
    />
  );
}

/** jsdom has no layout: give the scroll region a size and the body a position that scrolls. */
function layOut(viewport: number, scrollHeight = 0) {
  const region = screen.getByRole('region', { name: 'Items' });
  Object.defineProperty(region, 'clientHeight', { configurable: true, value: viewport });
  Object.defineProperty(region, 'scrollHeight', { configurable: true, value: scrollHeight });
  const body = region.querySelector('tbody') as HTMLElement;
  // The body starts 40px down (caption and header) and moves up as the region scrolls.
  body.getBoundingClientRect = () => ({ top: 40 - region.scrollTop }) as DOMRect;
  return region;
}

function scrollTo(region: HTMLElement, top: number) {
  region.scrollTop = top;
  fireEvent.scroll(region);
}

/** Rows stacked 40px apart from y = 0, as a browser would lay them out. */
function layOutRows() {
  screen
    .getByRole('region', { name: 'Items' })
    .querySelectorAll<HTMLElement>('tbody tr[data-row-id]')
    .forEach((row, index) => {
      row.getBoundingClientRect = () => ({ top: index * 40, height: 40 }) as DOMRect;
    });
}

describe('DataTable virtualization', () => {
  it('renders only some of 10,000 rows and says how many there are', () => {
    render(<Items virtualized paginated={false} locale="en-US" data={makeItems(10_000)} />);

    expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '10001');
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeLessThan(40);
    expect(rows[0]).toHaveAttribute('aria-rowindex', '1');
    expect(screen.getByRole('row', { name: 'Item 1' })).toHaveAttribute('aria-rowindex', '2');
    expect(screen.getByRole('status')).toHaveTextContent('1–10,000 of 10,000');
  });

  it('renders the rows in view as the region scrolls', async () => {
    render(<Items virtualized paginated={false} data={makeItems(10_000)} />);
    const region = layOut(400);

    // Row 5,001 starts at 5,000 × 41px (the estimated height).
    act(() => scrollTo(region, 40 + 5000 * 41));
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(screen.getByRole('row', { name: 'Item 5001' })).toHaveAttribute('aria-rowindex', '5002');
    expect(screen.queryByRole('row', { name: 'Item 1' })).not.toBeInTheDocument();
  });

  it('keeps the focused row rendered when it scrolls out of view', async () => {
    render(<Items virtualized selectable paginated={false} data={makeItems(10_000)} />);
    const region = layOut(400);

    screen.getByRole('checkbox', { name: 'Select Item 2' }).focus();
    act(() => scrollTo(region, 40 + 5000 * 41));
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(screen.getByRole('checkbox', { name: 'Select Item 2' })).toHaveFocus();
    expect(screen.getByRole('row', { name: /Item 5001/ })).toBeInTheDocument();
  });
});

describe('DataTable infinite loading', () => {
  it('offers “Load more” without paging', async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    render(<Items paginated={false} hasMore onLoadMore={onLoadMore} />);

    await user.click(screen.getByRole('button', { name: 'Load more' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('loads more once per batch when scrolled near the end', () => {
    const onLoadMore = vi.fn();
    render(<Items paginated={false} maxHeight="sm" hasMore onLoadMore={onLoadMore} />);
    const region = layOut(300, 1000);

    scrollTo(region, 300);
    expect(onLoadMore).not.toHaveBeenCalled();
    scrollTo(region, 500);
    scrollTo(region, 600);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('has no “Load more” when nothing is left or the table pages', () => {
    const { rerender } = render(<Items paginated={false} onLoadMore={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
    rerender(<Items hasMore onLoadMore={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });
});

describe('DataTable row reordering', () => {
  const handle = (name: string) => screen.getByRole('button', { name: `Reorder ${name}` });

  it('adds a described drag handle to each row', () => {
    render(<Items reorderableRows />);
    expect(handle('Item 1')).toHaveAccessibleDescription(/Press Space or Enter to pick up the row/);
    expect(screen.getByRole('columnheader', { name: 'Reorder' })).toBeInTheDocument();
  });

  it('moves a row by keyboard, announcing each step', async () => {
    const user = userEvent.setup();
    const onRowReorder = vi.fn();
    render(<Items reorderableRows onRowReorder={onRowReorder} />);

    handle('Item 1').focus();
    await user.keyboard(' ');
    expect(screen.getByText('Picked up Item 1, position 1 of 5.')).toBeInTheDocument();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByText('Item 1: position 3 of 5.')).toBeInTheDocument();
    await user.keyboard('{Enter}');

    expect(onRowReorder).toHaveBeenCalledWith({
      row: { id: 1, name: 'Item 1' },
      rowId: '1',
      targetRowId: '3',
      position: 'after',
      fromIndex: 0,
      toIndex: 2,
    });
    expect(screen.getByText('Dropped Item 1 at position 3 of 5.')).toBeInTheDocument();
  });

  it('cancels a keyboard move with Escape or by leaving the handle', async () => {
    const user = userEvent.setup();
    const onRowReorder = vi.fn();
    render(<Items reorderableRows onRowReorder={onRowReorder} />);

    handle('Item 2').focus();
    await user.keyboard(' {ArrowUp}{Escape}');
    expect(
      screen.getByText('Reordering cancelled. Item 2 is back in its place.'),
    ).toBeInTheDocument();

    await user.keyboard(' {ArrowDown}');
    await user.tab();
    expect(onRowReorder).not.toHaveBeenCalled();
  });

  it('does not report a drop in the same place', async () => {
    const user = userEvent.setup();
    const onRowReorder = vi.fn();
    render(<Items reorderableRows onRowReorder={onRowReorder} />);

    handle('Item 2').focus();
    await user.keyboard(' {ArrowDown}{ArrowUp} ');
    expect(onRowReorder).not.toHaveBeenCalled();
    expect(screen.getByText('Dropped Item 2 at position 2 of 5.')).toBeInTheDocument();
  });

  it('moves a row by dragging its handle', () => {
    const onRowReorder = vi.fn();
    render(<Items reorderableRows onRowReorder={onRowReorder} />);
    layOutRows();

    fireEvent.pointerDown(handle('Item 1'), { button: 0, clientY: 10, pointerId: 1 });
    // Into the top half of the fourth row (120–160): before it.
    fireEvent.pointerMove(handle('Item 1'), { clientY: 130, pointerId: 1 });
    expect(screen.getByRole('row', { name: /Item 1/ })).toBeInTheDocument();
    fireEvent.pointerUp(handle('Item 1'), { clientY: 130, pointerId: 1 });

    expect(onRowReorder).toHaveBeenCalledWith(
      expect.objectContaining({ rowId: '1', targetRowId: '4', position: 'before', toIndex: 2 }),
    );
  });

  it('ignores a press that does not move', () => {
    const onRowReorder = vi.fn();
    render(<Items reorderableRows onRowReorder={onRowReorder} />);
    layOutRows();

    fireEvent.pointerDown(handle('Item 1'), { button: 0, clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(handle('Item 1'), { clientY: 12, pointerId: 1 });
    fireEvent.pointerUp(handle('Item 1'), { clientY: 12, pointerId: 1 });
    expect(onRowReorder).not.toHaveBeenCalled();
  });

  it('is off while the table is sorted', () => {
    render(<Items reorderableRows defaultSort={[{ columnId: 'name', direction: 'asc' }]} />);
    expect(handle('Item 1')).toBeDisabled();
  });
});
