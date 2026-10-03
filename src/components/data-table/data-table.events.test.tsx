import { render, screen, within } from '@testing-library/react';
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
});
