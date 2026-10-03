import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableColumn, type DataTableProps } from '.';

interface Item {
  id: number;
  name: string;
  locked: boolean;
}

const items: Item[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  locked: i === 2,
}));

const columns: DataTableColumn<Item>[] = [
  { id: 'name', header: 'Name', value: (item) => item.name },
  { id: 'link', header: 'Link', cell: (item) => <a href={`#${item.id}`}>Open {item.name}</a> },
];

function Items(props: Partial<DataTableProps<Item>>) {
  return (
    <DataTable
      caption="Items"
      columns={columns}
      data={items}
      getRowId={(item) => String(item.id)}
      {...props}
    />
  );
}

const box = (name: string) => screen.getByRole('checkbox', { name });
const selectAll = () => box('Select all rows on this page');
const cell = (text: string) => screen.getByRole('cell', { name: text });

describe('DataTable selection', () => {
  it('selects rows with their checkboxes, named after the row', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Items selectable onSelectionChange={onSelectionChange} />);

    await user.click(box('Select Item 1'));
    expect(box('Select Item 1')).toBeChecked();
    expect(onSelectionChange).toHaveBeenLastCalledWith({ ids: ['1'], allMatching: false });
    expect(selectAll()).toBePartiallyChecked();
    expect(screen.getByRole('group', { name: 'Bulk actions' })).toHaveTextContent('1 selected');

    await user.click(box('Select Item 1'));
    expect(onSelectionChange).toHaveBeenLastCalledWith({ ids: [], allMatching: false });
    expect(screen.queryByRole('group', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });

  it('selects and clears the whole page from the header, keeping other pages', async () => {
    const user = userEvent.setup();
    render(<Items selectable defaultSelection={{ ids: ['25'], allMatching: false }} />);

    await user.click(selectAll());
    expect(selectAll()).toBeChecked();
    expect(box('Select Item 10')).toBeChecked();
    expect(screen.getByText('11 selected')).toBeInTheDocument();

    await user.click(selectAll());
    expect(selectAll()).not.toBeChecked();
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('offers to select every result once the page is selected', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Items selectable onSelectionChange={onSelectionChange} />);

    await user.click(selectAll());
    await user.click(screen.getByRole('button', { name: 'Select all 25 results' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      ids: items.map((item) => String(item.id)),
      allMatching: true,
    });
    expect(screen.getByText('All 25 results selected')).toBeInTheDocument();
    // The clicked button is gone: focus stays in the bar.
    expect(screen.getByRole('button', { name: 'Clear selection' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(box('Select Item 25')).toBeChecked();
  });

  it('counts every result on the server, and ends “all results” when a row is cleared', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Items
        selectable
        mode="server"
        data={items.slice(0, 10)}
        totalCount={500}
        onSelectionChange={onSelectionChange}
      />,
    );

    await user.click(selectAll());
    await user.click(screen.getByRole('button', { name: 'Select all 500 results' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      ids: items.slice(0, 10).map((item) => String(item.id)),
      allMatching: true,
    });
    expect(screen.getByText('All 500 results selected')).toBeInTheDocument();

    await user.click(box('Select Item 2'));
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      ids: ['1', '3', '4', '5', '6', '7', '8', '9', '10'],
      allMatching: false,
    });
    expect(screen.getByText('9 selected')).toBeInTheDocument();
  });

  it('ends “all results” when the search changes', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Items
        selectable
        globalSearch
        searchDebounce={0}
        defaultSelection={{ ids: ['1', '2'], allMatching: true }}
        onSelectionChange={onSelectionChange}
      />,
    );

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), '1');
    expect(onSelectionChange).toHaveBeenLastCalledWith({ ids: ['1', '2'], allMatching: false });
  });

  it('disables rows that cannot be selected and leaves them out of the page', async () => {
    const user = userEvent.setup();
    render(<Items selectable isRowSelectable={(item) => !item.locked} />);

    expect(box('Select Item 3')).toBeDisabled();
    await user.click(selectAll());
    expect(box('Select Item 3')).not.toBeChecked();
    expect(screen.getByText('9 selected')).toBeInTheDocument();
  });

  it('runs bulk actions with the selected rows, and clears the selection', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <Items
        selectable
        defaultSelection={{ ids: ['2', '20'], allMatching: false }}
        bulkActions={[{ id: 'delete', label: 'Delete', tone: 'danger', onSelect: onDelete }]}
      />,
    );

    const bar = screen.getByRole('group', { name: 'Bulk actions' });
    await user.click(within(bar).getByRole('button', { name: 'Delete' }));
    const context = onDelete.mock.calls[0]?.[0];
    expect(context.rows).toEqual([items[1], items[19]]);
    expect(context.selection).toEqual({ ids: ['2', '20'], allMatching: false });
    expect(context.query).toMatchObject({ page: 1, pageSize: 10, search: '' });

    await user.click(within(bar).getByRole('button', { name: 'Clear selection' }));
    expect(screen.queryByRole('group', { name: 'Bulk actions' })).not.toBeInTheDocument();
    // The bar is gone: focus moves to the header checkbox.
    expect(selectAll()).toHaveFocus();
  });

  it('uses getRowLabel for the row names', () => {
    render(<Items selectable getRowLabel={(item) => `#${item.id}`} />);
    expect(box('Select #1')).toBeInTheDocument();
  });

  it('works controlled', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Items
        selectable
        selection={{ ids: ['1'], allMatching: false }}
        onSelectionChange={onSelectionChange}
      />,
    );

    await user.click(box('Select Item 2'));
    expect(onSelectionChange).toHaveBeenCalledWith({ ids: ['1', '2'], allMatching: false });
    expect(box('Select Item 2')).not.toBeChecked();
  });
});

describe('DataTable row actions', () => {
  const actions = (onEdit = vi.fn(), onArchive = vi.fn()) => [
    { id: 'edit', label: 'Edit', onSelect: onEdit },
    {
      id: 'archive',
      label: 'Archive',
      tone: 'danger' as const,
      disabled: (item: Item) => item.locked,
      onSelect: onArchive,
    },
  ];

  it('opens a row menu from the row’s button', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Items rowActions={actions(onEdit)} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Item 2' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(items[1]);
  });

  it('disables an action for some rows', async () => {
    const user = userEvent.setup();
    render(<Items rowActions={actions()} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Item 3' }));
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('opens the same actions from the row’s context menu', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Items rowActions={actions(onEdit)} />);

    fireEvent.pointerOver(cell('Item 4'));
    fireEvent.contextMenu(cell('Item 4'));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(items[3]);
  });

  it('opens the context menu for the focused row from the keyboard', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Items rowActions={actions(onEdit)} />);

    act(() => screen.getByRole('link', { name: 'Open Item 5' }).focus());
    fireEvent.contextMenu(screen.getByRole('link', { name: 'Open Item 5' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(items[4]);
  });

  it('leaves the browser’s menu on the header', () => {
    render(<Items rowActions={actions()} />);
    const header = screen.getByRole('columnheader', { name: 'Link' });
    fireEvent.pointerOver(header);
    expect(fireEvent.contextMenu(header)).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('names the hidden header of the actions column', () => {
    render(<Items rowActions={actions()} />);
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
  });
});

describe('DataTable row click', () => {
  it('calls onRowClick for clicks outside the row’s controls', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<Items selectable onRowClick={onRowClick} />);

    await user.click(cell('Item 6'));
    expect(onRowClick).toHaveBeenCalledWith(items[5], expect.anything());

    onRowClick.mockClear();
    await user.click(box('Select Item 6'));
    await user.click(screen.getByRole('link', { name: 'Open Item 6' }));
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe('DataTable row detail', () => {
  const renderDetail = (item: Item) => (item.locked ? null : <p>About {item.name}</p>);

  it('opens and closes a row’s detail', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(<Items renderDetail={renderDetail} onExpandedChange={onExpandedChange} />);

    const button = screen.getByRole('button', { name: 'Details for Item 1' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(onExpandedChange).toHaveBeenLastCalledWith(['1']);
    const detail = screen.getByText('About Item 1');
    expect(button).toHaveAttribute('aria-controls', detail.closest('tr')?.id);
    expect(detail.closest('td')).toHaveAttribute('colspan', '3');

    await user.keyboard('{Enter}');
    expect(screen.queryByText('About Item 1')).not.toBeInTheDocument();
    expect(onExpandedChange).toHaveBeenLastCalledWith([]);
  });

  it('has no button for rows without a detail', () => {
    render(<Items renderDetail={renderDetail} />);
    expect(screen.queryByRole('button', { name: 'Details for Item 3' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Details' })).toBeInTheDocument();
  });

  it('opens details from defaultExpandedRowIds and works controlled', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <Items renderDetail={renderDetail} defaultExpandedRowIds={['2']} />,
    );
    expect(screen.getByText('About Item 2')).toBeInTheDocument();

    rerender(
      <Items renderDetail={renderDetail} expandedRowIds={[]} onExpandedChange={onExpandedChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Details for Item 2' }));
    expect(onExpandedChange).toHaveBeenCalledWith(['2']);
    expect(screen.queryByText('About Item 2')).not.toBeInTheDocument();
  });

  it('spans the extra columns in empty and skeleton states', () => {
    render(<Items selectable renderDetail={renderDetail} data={[]} />);
    expect(screen.getByRole('cell', { name: 'No results' })).toHaveAttribute('colspan', '4');
  });
});
