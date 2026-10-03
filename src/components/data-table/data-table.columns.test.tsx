import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableColumn, type DataTableProps } from '.';

interface Item {
  id: number;
  name: string;
  email: string;
  role: string;
}

const items: Item[] = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  email: `item${i + 1}@example.com`,
  role: i === 0 ? 'Admin' : 'Editor',
}));

const columns: DataTableColumn<Item>[] = [
  { id: 'name', header: 'Name', value: (item) => item.name, width: 200, minWidth: 80 },
  { id: 'email', header: 'Email', value: (item) => item.email },
  { id: 'role', header: 'Role', value: (item) => item.role, hideable: false },
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

const headers = () => screen.getAllByRole('columnheader').map((header) => header.textContent);
const dialog = () => screen.getByRole('dialog', { name: 'Columns' });

async function openChooser(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Columns' }));
  return dialog();
}

afterEach(() => window.localStorage.clear());

describe('DataTable column chooser', () => {
  it('hides and shows columns', async () => {
    const user = userEvent.setup();
    const onColumnStateChange = vi.fn();
    render(<Items columnChooser onColumnStateChange={onColumnStateChange} />);

    const chooser = await openChooser(user);
    await user.click(within(chooser).getByRole('checkbox', { name: 'Email' }));
    expect(headers()).toEqual(['Name', 'Role']);
    expect(screen.queryByRole('cell', { name: 'item1@example.com' })).not.toBeInTheDocument();
    expect(onColumnStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ hidden: ['email'] }),
    );

    await user.click(within(chooser).getByRole('checkbox', { name: 'Email' }));
    expect(headers()).toEqual(['Name', 'Email', 'Role']);
  });

  it('keeps columns that cannot be hidden, and the last shown column', async () => {
    const user = userEvent.setup();
    render(<Items columnChooser />);

    const chooser = await openChooser(user);
    expect(within(chooser).getByRole('checkbox', { name: 'Role' })).toBeDisabled();
    expect(within(chooser).getByRole('checkbox', { name: 'Name' })).toBeEnabled();
  });

  it('keeps the last shown column', async () => {
    const user = userEvent.setup();
    render(<Items columnChooser defaultColumnState={{ hidden: ['email', 'role'] }} />);

    const chooser = await openChooser(user);
    expect(within(chooser).getByRole('checkbox', { name: 'Name' })).toBeDisabled();
  });

  it('moves columns with the keyboard, keeping focus and announcing the move', async () => {
    const user = userEvent.setup();
    render(<Items columnChooser />);

    const chooser = await openChooser(user);
    expect(within(chooser).getByRole('button', { name: 'Move Name up' })).toBeDisabled();
    within(chooser).getByRole('button', { name: 'Move Name down' }).focus();
    await user.keyboard('{Enter}');
    expect(headers()).toEqual(['Email', 'Name', 'Role']);
    expect(within(chooser).getByRole('button', { name: 'Move Name down' })).toHaveFocus();
    expect(within(chooser).getByRole('status')).toHaveTextContent('Name moved to position 2 of 3');

    // At the end of the list, focus moves to the button that still works.
    await user.keyboard('{Enter}');
    expect(headers()).toEqual(['Email', 'Role', 'Name']);
    expect(within(chooser).getByRole('button', { name: 'Move Name up' })).toHaveFocus();
  });

  it('pins columns to either side', async () => {
    const user = userEvent.setup();
    const onColumnStateChange = vi.fn();
    render(<Items columnChooser onColumnStateChange={onColumnStateChange} />);

    const chooser = await openChooser(user);
    await user.selectOptions(within(chooser).getByRole('combobox', { name: 'Pin Role' }), 'start');
    expect(headers()).toEqual(['Role', 'Name', 'Email']);
    await user.selectOptions(within(chooser).getByRole('combobox', { name: 'Pin Name' }), 'end');
    expect(headers()).toEqual(['Role', 'Email', 'Name']);
    expect(onColumnStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ pinned: { role: 'start', name: 'end' } }),
    );
    // Pinned columns move only within their side.
    expect(within(chooser).getByRole('button', { name: 'Move Role down' })).toBeDisabled();
  });

  it('resets every column change', async () => {
    const user = userEvent.setup();
    render(<Items columnChooser defaultColumnState={{ hidden: ['email'] }} />);

    const chooser = await openChooser(user);
    // The chooser lists hidden columns too: the first step passes hidden Email.
    await user.click(within(chooser).getByRole('button', { name: 'Move Name down' }));
    await user.click(within(chooser).getByRole('button', { name: 'Move Name down' }));
    expect(headers()).toEqual(['Role', 'Name']);
    await user.click(within(chooser).getByRole('button', { name: 'Reset columns' }));
    // Back to the starting state: defaultColumnState over the column definitions.
    expect(headers()).toEqual(['Name', 'Role']);
  });

  it('starts from the columns’ hidden and pinned options', () => {
    render(
      <Items
        columns={[
          { ...columns[0], hidden: true } as DataTableColumn<Item>,
          columns[1] as DataTableColumn<Item>,
          { ...columns[2], pinned: 'start' } as DataTableColumn<Item>,
        ]}
      />,
    );
    expect(headers()).toEqual(['Role', 'Email']);
  });

  it('works controlled', async () => {
    const user = userEvent.setup();
    const onColumnStateChange = vi.fn();
    render(
      <Items
        columnChooser
        columnState={{ order: ['role', 'name', 'email'], hidden: [], widths: {}, pinned: {} }}
        onColumnStateChange={onColumnStateChange}
      />,
    );
    expect(headers()).toEqual(['Role', 'Name', 'Email']);

    const chooser = await openChooser(user);
    await user.click(within(chooser).getByRole('checkbox', { name: 'Email' }));
    expect(onColumnStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ hidden: ['email'] }),
    );
    expect(headers()).toEqual(['Role', 'Name', 'Email']);
  });
});

describe('DataTable column resizing', () => {
  const handle = (name: string) => screen.getByRole('separator', { name: `Resize ${name}` });

  it('adds a labelled handle per header, outside the header’s name', () => {
    render(<Items resizableColumns />);
    expect(handle('Name')).toHaveAttribute('aria-valuenow', '200');
    expect(handle('Name')).toHaveAttribute('aria-valuemin', '80');
    expect(handle('Name')).toHaveAttribute('aria-valuemax', '1200');
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  });

  it('resizes with the arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    const onColumnStateChange = vi.fn();
    render(<Items resizableColumns onColumnStateChange={onColumnStateChange} />);

    handle('Name').focus();
    await user.keyboard('{ArrowRight}');
    expect(handle('Name')).toHaveAttribute('aria-valuenow', '210');
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(handle('Name')).toHaveAttribute('aria-valuenow', '160');
    await user.keyboard('{Home}');
    expect(handle('Name')).toHaveAttribute('aria-valuenow', '80');
    await user.keyboard('{End}');
    expect(onColumnStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ widths: { name: 1200 } }),
    );
  });

  it('resizes by dragging, keeps the width on release and resets on double-click', () => {
    const onColumnStateChange = vi.fn();
    render(<Items resizableColumns onColumnStateChange={onColumnStateChange} />);

    fireEvent.pointerDown(handle('Name'), { button: 0, clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle('Name'), { clientX: 160, pointerId: 1 });
    expect(handle('Name')).toHaveAttribute('aria-valuenow', '260');
    expect(onColumnStateChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(handle('Name'), { clientX: 160, pointerId: 1 });
    expect(onColumnStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ widths: { name: 260 } }),
    );

    fireEvent.doubleClick(handle('Name'));
    expect(onColumnStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ widths: {} }));
    expect(handle('Name')).toHaveAttribute('aria-valuenow', '200');
  });

  it('skips columns that are not resizable', () => {
    render(
      <Items
        resizableColumns
        columns={[{ ...columns[0], resizable: false } as DataTableColumn<Item>]}
      />,
    );
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });
});

describe('DataTable header drag and drop', () => {
  const dataTransfer = () => ({ setData: vi.fn(), effectAllowed: '', dropEffect: '' });

  it('moves a column before or after the header it is dropped on', () => {
    const onColumnStateChange = vi.fn();
    render(<Items reorderableColumns onColumnStateChange={onColumnStateChange} />);

    const name = screen.getByRole('columnheader', { name: 'Name' });
    const role = screen.getByRole('columnheader', { name: 'Role' });
    expect(name).toHaveAttribute('draggable', 'true');

    const transfer = dataTransfer();
    fireEvent.dragStart(name, { dataTransfer: transfer });
    expect(transfer.setData).toHaveBeenCalledWith('text/plain', 'name');
    // jsdom has no layout: a header's middle is at 0, so any positive x drops after it.
    fireEvent.dragOver(role, { clientX: 10, dataTransfer: transfer });
    fireEvent.drop(role, { clientX: 10, dataTransfer: transfer });

    expect(headers()).toEqual(['Email', 'Role', 'Name']);
    expect(onColumnStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ order: ['email', 'role', 'name'] }),
    );
  });

  it('does not drop across pinned groups', () => {
    render(<Items reorderableColumns defaultColumnState={{ pinned: { role: 'start' } }} />);
    const name = screen.getByRole('columnheader', { name: 'Name' });
    const role = screen.getByRole('columnheader', { name: 'Role' });
    const transfer = dataTransfer();
    fireEvent.dragStart(name, { dataTransfer: transfer });
    fireEvent.dragOver(role, { clientX: 10, dataTransfer: transfer });
    fireEvent.drop(role, { clientX: 10, dataTransfer: transfer });
    expect(headers()).toEqual(['Role', 'Name', 'Email']);
  });
});

describe('DataTable column persistence', () => {
  it('restores and saves the column state under storageKey', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      'ufi-datatable:items',
      JSON.stringify({ order: ['email', 'name', 'role'], hidden: ['name'] }),
    );
    render(<Items columnChooser storageKey="items" />);
    expect(headers()).toEqual(['Email', 'Role']);

    const chooser = await openChooser(user);
    await user.click(within(chooser).getByRole('checkbox', { name: 'Name' }));
    expect(JSON.parse(window.localStorage.getItem('ufi-datatable:items') ?? '{}')).toMatchObject({
      order: ['email', 'name', 'role'],
      hidden: [],
    });
  });

  it('ignores a broken stored state', () => {
    window.localStorage.setItem('ufi-datatable:items', '{broken');
    render(<Items storageKey="items" />);
    expect(headers()).toEqual(['Name', 'Email', 'Role']);
  });
});
