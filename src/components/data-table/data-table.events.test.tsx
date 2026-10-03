import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DataTable } from '.';
import { names, recordEvents } from '../../test/record-events';

const data = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

function Items() {
  return (
    <DataTable
      id="items"
      eventData={{ list: 'catalog' }}
      caption="Items"
      columns={[{ id: 'name', header: 'Name', value: (row: { name: string }) => row.name }]}
      data={data}
      defaultPage={2}
    />
  );
}

const source = { id: 'items', data: { list: 'catalog' } };

describe('DataTable events', () => {
  it('emits datatable.state.onSort, then onPageChange back to page 1', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<Items />);

    await user.click(within(screen.getByRole('columnheader')).getByRole('button'));
    expect(events).toEqual([
      {
        name: 'datatable.state.onSort',
        payload: { sort: [{ columnId: 'name', direction: 'asc' }], previousSort: [], source },
      },
      { name: 'datatable.state.onPageChange', payload: { page: 1, previousPage: 2, source } },
    ]);
  });

  it('emits datatable.state.onPageChange and no pagination or button events', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<Items />);

    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(names(events)).toEqual(['datatable.state.onPageChange']);
    expect(events[0]?.payload).toEqual({ page: 3, previousPage: 2, source });
  });

  it('emits datatable.state.onPageSizeChange and no select event', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<Items />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '25');
    expect(events).toEqual([
      {
        name: 'datatable.state.onPageSizeChange',
        payload: { pageSize: 25, previousPageSize: 10, source },
      },
      { name: 'datatable.state.onPageChange', payload: { page: 1, previousPage: 2, source } },
    ]);
  });

  it('emits datatable.state.onFilter from the header editor, and nothing from its parts', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <DataTable
        id="items"
        caption="Items"
        columns={[
          {
            id: 'name',
            header: 'Name',
            value: (row: { name: string }) => row.name,
            filter: {
              type: 'select',
              multiple: true,
              options: [{ value: 'Item 1', label: 'Item 1' }],
            },
          },
        ]}
        data={data}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Filter Name' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('checkbox', { name: 'Item 1' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Apply' }));
    await user.click(screen.getByRole('button', { name: 'Remove filter: Name: Item 1' }));

    const filters = { name: { type: 'select', values: ['Item 1'] } };
    expect(events).toEqual([
      {
        name: 'datatable.state.onFilter',
        payload: { filters, previousFilters: {}, source: { id: 'items' } },
      },
      {
        name: 'datatable.state.onFilter',
        payload: { filters: {}, previousFilters: filters, source: { id: 'items' } },
      },
    ]);
  });

  it('emits datatable.state.onSearch once typing pauses', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <DataTable
        caption="Items"
        globalSearch
        searchDebounce={0}
        columns={[{ id: 'name', header: 'Name', value: (row: { name: string }) => row.name }]}
        data={data}
      />,
    );

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), '12');
    expect(
      events
        .filter((event) => event.name === 'datatable.state.onSearch')
        .map((event) => event.payload),
    ).toEqual([
      { search: '1', previousSearch: '', source: {} },
      { search: '12', previousSearch: '1', source: {} },
    ]);
    expect(names(events).every((name) => name.startsWith('datatable.'))).toBe(true);
  });

  it('emits datatable.state.onSelect and datatable.interaction.onBulkAction, and nothing from the parts', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <DataTable
        id="items"
        caption="Items"
        selectable
        bulkActions={[{ id: 'export', label: 'Export', onSelect: () => {} }]}
        getRowId={(row) => String(row.id)}
        columns={[{ id: 'name', header: 'Name', value: (row: { name: string }) => row.name }]}
        data={data}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select Item 1' }));
    await user.click(screen.getByRole('button', { name: 'Export' }));
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    const selected = { ids: ['1'], allMatching: false };
    const none = { ids: [], allMatching: false };
    expect(events).toEqual([
      {
        name: 'datatable.state.onSelect',
        payload: { selection: selected, previousSelection: none, source: { id: 'items' } },
      },
      {
        name: 'datatable.interaction.onBulkAction',
        payload: { action: 'export', rowIds: ['1'], allMatching: false, source: { id: 'items' } },
      },
      {
        name: 'datatable.state.onSelect',
        payload: { selection: none, previousSelection: selected, source: { id: 'items' } },
      },
    ]);
  });

  it('emits datatable.interaction.onRowAction from the menu and the context menu', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <DataTable
        caption="Items"
        rowActions={[{ id: 'edit', label: 'Edit', onSelect: () => {} }]}
        getRowId={(row) => String(row.id)}
        columns={[{ id: 'name', header: 'Name', value: (row: { name: string }) => row.name }]}
        data={data}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Actions for Item 1' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    fireEvent.pointerOver(screen.getByRole('cell', { name: 'Item 2' }));
    fireEvent.contextMenu(screen.getByRole('cell', { name: 'Item 2' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(events).toEqual([
      {
        name: 'datatable.interaction.onRowAction',
        payload: { action: 'edit', rowId: '1', source: {} },
      },
      {
        name: 'datatable.interaction.onRowAction',
        payload: { action: 'edit', rowId: '2', source: {} },
      },
    ]);
  });

  it('emits datatable.interaction.onRowClick and datatable.state.onExpand', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <DataTable
        caption="Items"
        onRowClick={() => {}}
        renderDetail={(row: { name: string }) => <p>About {row.name}</p>}
        getRowId={(row) => String(row.id)}
        columns={[{ id: 'name', header: 'Name', value: (row: { name: string }) => row.name }]}
        data={data}
      />,
    );

    await user.click(screen.getByRole('cell', { name: 'Item 3' }));
    await user.click(screen.getByRole('button', { name: 'Details for Item 3' }));

    expect(events).toEqual([
      { name: 'datatable.interaction.onRowClick', payload: { rowId: '3', source: {} } },
      {
        name: 'datatable.state.onExpand',
        payload: { rowId: '3', expanded: true, expandedRowIds: ['3'], source: {} },
      },
    ]);
  });

  it('emits the column events, and nothing from the chooser’s parts', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <DataTable
        caption="Items"
        columnChooser
        resizableColumns
        columns={[
          { id: 'name', header: 'Name', value: (row: { name: string }) => row.name, width: 200 },
          { id: 'id', header: 'Id', value: (row: { id: number }) => row.id },
        ]}
        data={data}
      />,
    );

    screen.getByRole('separator', { name: 'Resize Name' }).focus();
    await user.keyboard('{ArrowRight}');
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    const chooser = screen.getByRole('dialog', { name: 'Columns' });
    await user.click(within(chooser).getByRole('checkbox', { name: 'Id' }));
    await user.click(within(chooser).getByRole('button', { name: 'Move Name down' }));
    await user.selectOptions(within(chooser).getByRole('combobox', { name: 'Pin Id' }), 'end');
    await user.click(within(chooser).getByRole('button', { name: 'Reset columns' }));

    expect(events).toEqual([
      {
        name: 'datatable.state.onColumnResize',
        payload: { columnId: 'name', width: 210, previousWidth: 200, source: {} },
      },
      {
        name: 'datatable.state.onColumnVisibilityChange',
        payload: { columnId: 'id', visible: false, source: {} },
      },
      {
        name: 'datatable.state.onColumnMove',
        payload: {
          columnId: 'name',
          order: ['id', 'name'],
          previousOrder: ['name', 'id'],
          source: {},
        },
      },
      {
        name: 'datatable.state.onColumnPin',
        payload: { columnId: 'id', pinned: 'end', previousPinned: null, source: {} },
      },
      { name: 'datatable.state.onColumnsReset', payload: { source: {} } },
    ]);
  });
  it('emits datatable.interaction.onRowReorder and datatable.interaction.onLoadMore', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <DataTable
        caption="Items"
        reorderableRows
        paginated={false}
        hasMore
        onLoadMore={() => {}}
        getRowId={(row) => String(row.id)}
        columns={[{ id: 'name', header: 'Name', value: (row: { name: string }) => row.name }]}
        data={data.slice(0, 3)}
      />,
    );

    screen.getByRole('button', { name: 'Reorder Item 1' }).focus();
    await user.keyboard(' {ArrowDown} ');
    await user.click(screen.getByRole('button', { name: 'Load more' }));

    expect(events).toEqual([
      {
        name: 'datatable.interaction.onRowReorder',
        payload: {
          rowId: '1',
          targetRowId: '2',
          position: 'after',
          fromIndex: 0,
          toIndex: 1,
          source: {},
        },
      },
      {
        name: 'datatable.interaction.onLoadMore',
        payload: { loaded: 3, trigger: 'button', source: {} },
      },
    ]);
  });
  it('emits datatable.interaction.onCellEdit once a cell edit is saved, and nothing from the editor', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <DataTable
        caption="Items"
        onCellEdit={() => {}}
        getRowId={(row) => String(row.id)}
        columns={[
          {
            id: 'name',
            header: 'Name',
            value: (row: { name: string }) => row.name,
            editor: { type: 'text' },
          },
        ]}
        data={data.slice(0, 2)}
      />,
    );

    screen.getByRole('gridcell', { name: 'Item 1' }).focus();
    await user.keyboard('{Enter}Renamed{Enter}');
    expect(events).toEqual([
      {
        name: 'datatable.interaction.onCellEdit',
        payload: { rowId: '1', columnId: 'name', source: {} },
      },
    ]);
  });
  it('emits grouping, export and saved view events, and nothing from their parts', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    URL.createObjectURL = () => 'blob:csv';
    URL.revokeObjectURL = () => {};
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = () => {};
    render(
      <DataTable
        caption="Items"
        columnMenu
        csvExport
        savedViews
        getRowId={(row) => String(row.id)}
        columns={[
          {
            id: 'name',
            header: 'Name',
            value: (row: { name: string }) => row.name,
            groupable: true,
          },
        ]}
        data={data.slice(0, 2)}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Column options for Name' }));
    await user.click(screen.getByRole('menuitem', { name: 'Group by this column' }));
    await user.click(screen.getByRole('button', { name: 'Name: Item 1 (1)' }));
    await user.click(screen.getByRole('button', { name: 'Export CSV' }));
    await user.click(screen.getByRole('button', { name: 'Views' }));
    await user.type(screen.getByRole('textbox', { name: 'View name' }), 'Mine{Enter}');
    await user.click(screen.getByRole('button', { name: 'Apply view Mine' }));
    await user.click(screen.getByRole('button', { name: 'Views' }));
    await user.click(screen.getByRole('button', { name: 'Delete view Mine' }));
    HTMLAnchorElement.prototype.click = click;

    const viewId = (
      events.find((event) => event.name === 'datatable.state.onViewSave')?.payload as {
        viewId: string;
      }
    ).viewId;
    expect(events).toEqual([
      {
        name: 'datatable.state.onGroupBy',
        payload: { groupBy: ['name'], previousGroupBy: [], source: {} },
      },
      {
        name: 'datatable.state.onGroupToggle',
        payload: { groupKey: 'name:Item%201', expanded: false, source: {} },
      },
      {
        name: 'datatable.interaction.onExport',
        payload: { format: 'csv', rowCount: 2, selected: false, source: {} },
      },
      { name: 'datatable.state.onViewSave', payload: { viewId, name: 'Mine', source: {} } },
      { name: 'datatable.state.onViewApply', payload: { viewId, name: 'Mine', source: {} } },
      { name: 'datatable.state.onViewDelete', payload: { viewId, name: 'Mine', source: {} } },
    ]);
  });
});
