import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableColumn, type DataTableProps } from '.';

interface Item {
  id: number;
  name: string;
  role: string;
  orders: number;
}

const items: Item[] = [
  { id: 1, name: 'Ada', role: 'Editor', orders: 5 },
  { id: 2, name: 'Bora', role: 'Admin', orders: 10 },
  { id: 3, name: 'Ceren', role: 'Editor', orders: 1 },
];

const columns: DataTableColumn<Item>[] = [
  { id: 'name', header: 'Name', value: (item) => item.name, aggregate: 'count' },
  { id: 'role', header: 'Role', value: (item) => item.role, groupable: true },
  { id: 'orders', header: 'Orders', value: (item) => item.orders, align: 'end', aggregate: 'sum' },
];

function Items(props: Partial<DataTableProps<Item>>) {
  return (
    <DataTable
      caption="Items"
      locale="en-US"
      columns={columns}
      data={items}
      getRowId={(item) => String(item.id)}
      {...props}
    />
  );
}

const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map(
      (row) =>
        within(row).queryByRole('button')?.textContent ??
        (row as HTMLTableRowElement).cells[0]?.textContent,
    );

describe('DataTable grouping and totals', () => {
  it('groups rows under toggles with counts and aggregates', async () => {
    const user = userEvent.setup();
    render(<Items defaultGroupBy={['role']} />);

    expect(names()).toEqual(['Role: Admin (1)', 'Bora', 'Role: Editor (2)', 'Ada', 'Ceren', '3']);
    const editors = screen.getByRole('button', { name: 'Role: Editor (2)' });
    expect(editors).toHaveAttribute('aria-expanded', 'true');
    // The group row sums its orders.
    expect(
      within(editors.closest('tr') as HTMLElement).getByRole('cell', { name: '6' }),
    ).toBeInTheDocument();

    await user.click(editors);
    expect(editors).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('cell', { name: 'Ada' })).not.toBeInTheDocument();
  });

  it('shows a totals row and turns paging off while grouped', () => {
    render(<Items defaultGroupBy={['role']} defaultPageSize={1} />);
    const totals = screen.getAllByRole('row').at(-1) as HTMLElement;
    expect([...(totals as HTMLTableRowElement).cells].map((cell) => cell.textContent)).toEqual([
      '3',
      '',
      '16',
    ]);
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
  });

  it('labels the totals row when the first column has no aggregate', () => {
    render(
      <Items
        totals
        columns={[columns[1] as DataTableColumn<Item>, columns[2] as DataTableColumn<Item>]}
      />,
    );
    expect(screen.getByRole('cell', { name: 'Total' })).toBeInTheDocument();
  });

  it('groups and ungroups from the column menu and the chips', async () => {
    const user = userEvent.setup();
    const onGroupByChange = vi.fn();
    render(<Items columnMenu onGroupByChange={onGroupByChange} />);

    await user.click(screen.getByRole('button', { name: 'Column options for Role' }));
    await user.click(screen.getByRole('menuitem', { name: 'Group by this column' }));
    expect(onGroupByChange).toHaveBeenLastCalledWith(['role']);
    const chips = screen.getByRole('list', { name: 'Grouped by' });
    await user.click(within(chips).getByRole('button', { name: 'Stop grouping by Role' }));
    expect(onGroupByChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole('list', { name: 'Grouped by' })).not.toBeInTheDocument();
  });
});

describe('DataTable column menu', () => {
  it('sorts, adds a secondary sort and clears it', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<Items columnMenu onSortChange={onSortChange} />);

    await user.click(screen.getByRole('button', { name: 'Column options for Orders' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sort descending' }));
    expect(onSortChange).toHaveBeenLastCalledWith([{ columnId: 'orders', direction: 'desc' }]);

    await user.click(screen.getByRole('button', { name: 'Column options for Name' }));
    await user.click(screen.getByRole('menuitem', { name: 'Then sort ascending' }));
    expect(onSortChange).toHaveBeenLastCalledWith([
      { columnId: 'orders', direction: 'desc' },
      { columnId: 'name', direction: 'asc' },
    ]);

    await user.click(screen.getByRole('button', { name: 'Column options for Orders' }));
    await user.click(screen.getByRole('menuitem', { name: 'Clear sort' }));
    expect(onSortChange).toHaveBeenLastCalledWith([{ columnId: 'name', direction: 'asc' }]);
  });

  it('pins and hides a column', async () => {
    const user = userEvent.setup();
    const onColumnStateChange = vi.fn();
    render(<Items columnMenu onColumnStateChange={onColumnStateChange} />);

    await user.click(screen.getByRole('button', { name: 'Column options for Orders' }));
    await user.click(screen.getByRole('menuitem', { name: 'Pin left' }));
    expect(onColumnStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ pinned: { orders: 'start' } }),
    );
    await user.click(screen.getByRole('button', { name: 'Column options for Orders' }));
    expect(screen.getByRole('menuitem', { name: 'Unpin' })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Hide column' }));
    expect(screen.queryByRole('columnheader', { name: 'Orders' })).not.toBeInTheDocument();
  });

  it('offers no grouping for columns that are not groupable', async () => {
    const user = userEvent.setup();
    render(<Items columnMenu />);
    await user.click(screen.getByRole('button', { name: 'Column options for Name' }));
    expect(
      screen.queryByRole('menuitem', { name: 'Group by this column' }),
    ).not.toBeInTheDocument();
  });
});

describe('DataTable CSV export', () => {
  let exported: Blob | undefined;
  let fileName = '';

  beforeEach(() => {
    exported = undefined;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      exported = blob;
      return 'blob:csv';
    });
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      fileName = this.download;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('exports the matching rows in the shown columns and order', async () => {
    const user = userEvent.setup();
    render(
      <Items
        csvExport={{ fileName: 'items', delimiter: ';' }}
        defaultSort={[{ columnId: 'orders', direction: 'desc' }]}
        defaultColumnState={{ hidden: ['role'] }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));
    expect(fileName).toBe('items.csv');
    // A byte order mark first, so Excel reads UTF-8 (text() drops it when decoding).
    const bytes = new Uint8Array((await exported?.arrayBuffer()) ?? new ArrayBuffer(0));
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(await exported?.text()).toBe('Name;Orders\r\nBora;10\r\nAda;5\r\nCeren;1\r\n');
  });

  it('exports only the selected rows when there are some', async () => {
    const user = userEvent.setup();
    render(<Items csvExport selectable defaultSelection={{ ids: ['3'], allMatching: false }} />);

    await user.click(screen.getByRole('button', { name: 'Export 1 selected' }));
    expect(fileName).toBe('export.csv');
    expect(await exported?.text()).toBe('Name,Role,Orders\r\nCeren,Editor,1\r\n');
  });
});

describe('DataTable saved views', () => {
  afterEach(() => window.localStorage.clear());

  it('saves the current view, applies it and deletes it', async () => {
    const user = userEvent.setup();
    const onViewsChange = vi.fn();
    const onQueryChange = vi.fn();
    render(
      <Items
        savedViews
        columnMenu
        globalSearch
        searchDebounce={0}
        onViewsChange={onViewsChange}
        onQueryChange={onQueryChange}
      />,
    );

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'a');
    await user.click(screen.getByRole('button', { name: 'Views' }));
    const popover = screen.getByRole('dialog', { name: 'Views' });
    expect(within(popover).getByText('No saved views yet.')).toBeInTheDocument();

    await user.click(within(popover).getByRole('button', { name: 'Save view' }));
    expect(within(popover).getByRole('alert')).toHaveTextContent('Enter a name for the view');
    await user.type(within(popover).getByRole('textbox', { name: 'View name' }), 'With A{Enter}');
    expect(onViewsChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'With A', state: expect.objectContaining({ search: 'a' }) }),
    ]);
    expect(within(popover).getByRole('status')).toHaveTextContent('Saved view “With A”.');

    // Change the table, then bring the view back.
    await user.keyboard('{Escape}');
    await user.clear(screen.getByRole('searchbox', { name: 'Search' }));
    await user.click(screen.getByRole('button', { name: 'Views' }));
    onQueryChange.mockClear();
    await user.click(screen.getByRole('button', { name: 'Apply view With A' }));
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('a');
    expect(onQueryChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Views' }));
    await user.click(screen.getByRole('button', { name: 'Delete view With A' }));
    expect(onViewsChange).toHaveBeenLastCalledWith([]);
  });

  it('keeps views in localStorage under storageKey', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Items savedViews storageKey="items" />);

    await user.click(screen.getByRole('button', { name: 'Views' }));
    await user.type(screen.getByRole('textbox', { name: 'View name' }), 'Mine{Enter}');
    unmount();

    render(<Items savedViews storageKey="items" />);
    await user.click(screen.getByRole('button', { name: 'Views' }));
    expect(screen.getByRole('button', { name: 'Apply view Mine' })).toBeInTheDocument();
  });
});
