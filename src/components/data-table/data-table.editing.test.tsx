import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableColumn, type DataTableProps } from '.';

interface Item {
  id: number;
  name: string;
  stock: number;
  kind: string;
  due: Date;
  locked: boolean;
}

const items: Item[] = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  stock: (i + 1) * 10,
  kind: i === 0 ? 'a' : 'b',
  due: new Date(2026, 2, i + 1),
  locked: i === 2,
}));

const columns: DataTableColumn<Item>[] = [
  {
    id: 'name',
    header: 'Name',
    value: (item) => item.name,
    editor: { type: 'text', required: true },
    editable: (item) => !item.locked,
  },
  { id: 'stock', header: 'Stock', value: (item) => item.stock, editor: { type: 'number', min: 0 } },
  {
    id: 'kind',
    header: 'Kind',
    value: (item) => item.kind,
    cell: (item) => (item.kind === 'a' ? 'Alpha' : 'Beta'),
    editor: {
      type: 'select',
      required: true,
      options: [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ],
    },
  },
  { id: 'due', header: 'Due', value: (item) => item.due, editor: { type: 'date' } },
];

function Items(props: Partial<DataTableProps<Item>>) {
  return (
    <DataTable
      caption="Items"
      locale="en-US"
      columns={columns}
      data={items}
      getRowId={(item) => String(item.id)}
      onCellEdit={() => {}}
      {...props}
    />
  );
}

const cell = (text: string) => screen.getByRole('gridcell', { name: text });
const editor = (column: string, row: string) =>
  screen.getByRole(column === 'Kind' ? 'combobox' : 'textbox', {
    name: `Edit ${column} for ${row}`,
  });

describe('DataTable grid navigation', () => {
  it('is a grid with one tab stop when a column is editable', async () => {
    const user = userEvent.setup();
    render(<Items />);

    expect(screen.getByRole('grid', { name: 'Items' })).toBeInTheDocument();
    // The scroll region, then the grid: the header's sort button stands in for its cell.
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Name' })).toHaveFocus();
    const stops = [...document.querySelectorAll('table [tabindex="0"]')];
    expect(stops).toHaveLength(1);
  });

  it('moves between cells with arrows, Home, End and Ctrl+Home/End', async () => {
    const user = userEvent.setup();
    render(<Items />);

    cell('Item 1').focus();
    await user.keyboard('{ArrowRight}');
    expect(cell('10')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(cell('20')).toHaveFocus();
    await user.keyboard('{End}');
    expect(cell('3/2/2026')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(cell('Item 2')).toHaveFocus();
    await user.keyboard('{Control>}{End}{/Control}');
    expect(cell('3/3/2026')).toHaveFocus();
    await user.keyboard('{Control>}{Home}{/Control}');
    expect(screen.getByRole('button', { name: 'Name' })).toHaveFocus();
    await user.keyboard('{PageDown}');
    expect(cell('Item 3')).toHaveFocus();
  });

  it('moves into a cell’s controls with Enter, cycles them with Tab and leaves with Escape', async () => {
    const user = userEvent.setup();
    render(
      <Items
        cellNavigation
        onCellEdit={undefined}
        columns={[
          { id: 'name', header: 'Name', value: (item: Item) => item.name },
          {
            id: 'tools',
            header: 'Tools',
            cell: (item: Item) => (
              <>
                <button type="button">Open {item.name}</button>
                <button type="button">Copy {item.name}</button>
              </>
            ),
          },
        ]}
      />,
    );

    expect(screen.getByRole('grid')).toHaveAttribute('aria-readonly', 'true');
    const tools = screen.getByRole('gridcell', { name: 'Open Item 1 Copy Item 1' });
    cell('Item 1').focus();
    await user.keyboard('{ArrowRight}');
    expect(tools).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Open Item 1' })).toHaveAttribute('tabindex', '-1');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Open Item 1' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Copy Item 1' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(tools).toHaveFocus();
  });

  it('focuses a cell’s only button or checkbox directly, and arrows do not open its menu', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Items
        selectable
        onSelectionChange={onSelectionChange}
        rowActions={[{ id: 'edit', label: 'Edit', onSelect: () => {} }]}
      />,
    );

    screen.getByRole('button', { name: 'Actions for Item 1' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Actions for Item 2' })).toHaveFocus();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.keyboard('{Home}');
    expect(screen.getByRole('checkbox', { name: 'Select Item 2' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onSelectionChange).toHaveBeenCalledWith({ ids: ['2'], allMatching: false });
  });

  it('stays a plain table without editors or cellNavigation', () => {
    render(<Items onCellEdit={undefined} />);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

describe('DataTable inline editing', () => {
  it('edits a cell with Enter and saves with Enter', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(<Items onCellEdit={onCellEdit} />);

    expect(cell('Item 1')).toHaveAccessibleDescription('Press Enter to edit.');
    cell('Item 1').focus();
    await user.keyboard('{Enter}');
    const input = editor('Name', 'Item 1');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('Item 1');
    await user.keyboard('Renamed{Enter}');

    expect(onCellEdit).toHaveBeenCalledWith({
      row: items[0],
      rowId: '1',
      columnId: 'name',
      value: 'Renamed',
      previousValue: 'Item 1',
    });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(cell('Item 1')).toHaveFocus();
  });

  it('starts editing with a typed character, or a double-click', async () => {
    const user = userEvent.setup();
    render(<Items />);

    cell('10').focus();
    await user.keyboard('7');
    expect(editor('Stock', 'Item 1')).toHaveValue('7');
    await user.keyboard('{Escape}');

    await user.dblClick(cell('Item 2'));
    expect(editor('Name', 'Item 2')).toHaveValue('Item 2');
  });

  it('cancels with Escape and saves nothing when the value did not change', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(<Items onCellEdit={onCellEdit} />);

    cell('Item 1').focus();
    await user.keyboard('{Enter}x{Escape}');
    expect(cell('Item 1')).toHaveFocus();
    await user.keyboard('{Enter}{Enter}');
    expect(onCellEdit).not.toHaveBeenCalled();
  });

  it('saves with Tab and moves to the next cell', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(<Items onCellEdit={onCellEdit} />);

    cell('Item 1').focus();
    await user.keyboard('{Enter}New{Tab}');
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ value: 'New' }));
    expect(cell('10')).toHaveFocus();
  });

  it('saves when focus leaves the editor', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(<Items onCellEdit={onCellEdit} />);

    await user.dblClick(cell('20'));
    await user.keyboard('{Control>}a{/Control}25');
    await user.click(screen.getByRole('status'));
    expect(onCellEdit).toHaveBeenCalledWith(
      expect.objectContaining({ value: 25, previousValue: 20 }),
    );
  });

  it('shows validation errors and keeps the editor open', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(<Items onCellEdit={onCellEdit} />);

    cell('Item 1').focus();
    await user.keyboard('{Enter}{Control>}a{/Control}{Backspace}{Enter}');
    const input = editor('Name', 'Item 1');
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('Required');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');

    await user.keyboard('{Escape}{ArrowRight}{Enter}{Control>}a{/Control}-5{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter 0 or more');
    await user.keyboard('{Control>}a{/Control}x{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a number');
    expect(onCellEdit).not.toHaveBeenCalled();
  });

  it('edits with a select and a date field', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi.fn();
    render(<Items onCellEdit={onCellEdit} />);

    cell('Alpha').focus();
    await user.keyboard('{Enter}');
    await user.selectOptions(editor('Kind', 'Item 1'), 'b');
    await user.keyboard('{Enter}');
    expect(onCellEdit).toHaveBeenLastCalledWith(
      expect.objectContaining({ columnId: 'kind', value: 'b', previousValue: 'a' }),
    );

    cell('3/1/2026').focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Control>}a{/Control}03/20/2026{Enter}');
    expect(onCellEdit).toHaveBeenLastCalledWith(
      expect.objectContaining({ columnId: 'due', value: new Date(2026, 2, 20) }),
    );
  });

  it('shows the error onCellEdit returns, or a failure when it rejects', async () => {
    const user = userEvent.setup();
    const onCellEdit = vi
      .fn()
      .mockResolvedValueOnce('Name is taken')
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValueOnce(undefined);
    render(<Items onCellEdit={onCellEdit} />);

    cell('Item 1').focus();
    await user.keyboard('{Enter}Taken{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Name is taken');
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not save. Try again.'),
    );
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
    expect(onCellEdit).toHaveBeenCalledTimes(3);
  });

  it('marks the editor busy while saving', async () => {
    const user = userEvent.setup();
    let resolve: () => void = () => {};
    render(<Items onCellEdit={() => new Promise<void>((done) => (resolve = done))} />);

    cell('Item 1').focus();
    await user.keyboard('{Enter}Slow{Enter}');
    expect(editor('Name', 'Item 1')).toHaveAttribute('readonly');
    expect(screen.getByText('Saving…')).toBeInTheDocument();
    resolve();
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  });

  it('does not edit rows that are not editable, and marks their cells read-only', async () => {
    const user = userEvent.setup();
    render(<Items />);

    expect(cell('Item 3')).toHaveAttribute('aria-readonly', 'true');
    cell('Item 3').focus();
    await user.keyboard('{Enter}');
    await user.dblClick(cell('Item 3'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(within(screen.getByRole('grid')).getAllByRole('gridcell')[0]).not.toHaveAttribute(
      'aria-readonly',
    );
  });
});
