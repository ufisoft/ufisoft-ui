import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableColumn, type DataTableProps, type DataTableSort } from '.';
import { Badge } from '../badge';

interface User {
  id: number;
  name: string;
  role: string;
  age: number;
}

const users: User[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: `User ${String(i + 1).padStart(2, '0')}`,
  role: i % 3 === 0 ? 'Admin' : 'Editor',
  age: 20 + ((i * 7) % 30),
}));

const columns: DataTableColumn<User>[] = [
  { id: 'name', header: 'Name', value: (u) => u.name },
  { id: 'role', header: 'Role', value: (u) => u.role, cell: (u) => <Badge>{u.role}</Badge> },
  { id: 'age', header: 'Age', value: (u) => u.age, align: 'end' },
  { id: 'actions', header: 'Actions', cell: (u) => <button type="button">Edit {u.name}</button> },
];

function Users(props: Partial<DataTableProps<User>>) {
  return (
    <DataTable
      caption="Users"
      columns={columns}
      data={users}
      getRowId={(u) => String(u.id)}
      {...props}
    />
  );
}

const table = () => screen.getByRole('table', { name: 'Users' });
const bodyRows = () => within(table()).getAllByRole('row').slice(1);
const firstCells = () => bodyRows().map((row) => within(row).getAllByRole('cell')[0]?.textContent);
const header = (name: string) => screen.getByRole('columnheader', { name: new RegExp(`^${name}`) });
const sortButton = (name: string) => within(header(name)).getByRole('button');

describe('DataTable', () => {
  it('renders a named table with headers, cells and custom cell content', () => {
    render(<Users paginated={false} />);
    expect(
      within(table())
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Name', 'Role', 'Age', 'Actions']);
    expect(bodyRows()).toHaveLength(23);
    expect(screen.getByRole('button', { name: 'Edit User 01' })).toBeInTheDocument();
  });

  it('sorts by a header: ascending, descending, then back to the original order', async () => {
    const user = userEvent.setup();
    render(<Users paginated={false} />);

    await user.click(sortButton('Age'));
    expect(header('Age')).toHaveAttribute('aria-sort', 'ascending');
    expect(bodyRows()[0]).toHaveTextContent('20');

    await user.click(sortButton('Age'));
    expect(header('Age')).toHaveAttribute('aria-sort', 'descending');
    expect(bodyRows()[0]).toHaveTextContent('49');

    await user.click(sortButton('Age'));
    expect(header('Age')).not.toHaveAttribute('aria-sort');
    expect(firstCells()[0]).toBe('User 01');
  });

  it('sorts by several columns with Shift and describes the priorities', async () => {
    const user = userEvent.setup();
    render(<Users paginated={false} />);

    await user.click(sortButton('Role'));
    await user.keyboard('{Shift>}');
    await user.click(sortButton('Age'));
    await user.click(sortButton('Age'));
    await user.keyboard('{/Shift}');

    expect(header('Role')).toHaveAttribute('aria-sort', 'ascending');
    expect(header('Age')).not.toHaveAttribute('aria-sort');
    expect(sortButton('Role')).toHaveAccessibleDescription('sorted ascending, priority 1');
    expect(sortButton('Age')).toHaveAccessibleDescription('sorted descending, priority 2');
    // Admins first, oldest admin first.
    const firstRole = within(bodyRows()[0] as HTMLElement).getAllByRole('cell');
    expect(firstRole[1]).toHaveTextContent('Admin');
    expect(Number(firstRole[2]?.textContent)).toBeGreaterThanOrEqual(
      Number(within(bodyRows()[1] as HTMLElement).getAllByRole('cell')[2]?.textContent),
    );
  });

  it('does not make columns without value or compare sortable', () => {
    render(<Users />);
    expect(within(header('Actions')).queryByRole('button')).not.toBeInTheDocument();
  });

  it('pages client data and shows the range', async () => {
    const user = userEvent.setup();
    render(<Users />);
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByRole('status')).toHaveTextContent('1–10 of 23');

    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(bodyRows()).toHaveLength(3);
    expect(firstCells()).toEqual(['User 21', 'User 22', 'User 23']);
    expect(screen.getByRole('status')).toHaveTextContent('21–23 of 23');
  });

  it('changes the page size and goes back to the first page', async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    render(<Users defaultPage={2} onPageSizeChange={onPageSizeChange} />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '25');
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
    expect(bodyRows()).toHaveLength(23);
    expect(screen.getByRole('status')).toHaveTextContent('1–23 of 23');
  });

  it('goes back to the first page when the sort changes', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Users defaultPage={3} onPageChange={onPageChange} />);

    await user.click(sortButton('Name'));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    expect(firstCells()[0]).toBe('User 01');
  });

  it('follows controlled sort and page', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [sort, setSort] = useState<DataTableSort[]>([{ columnId: 'name', direction: 'desc' }]);
      const [page, setPage] = useState(1);
      return <Users sort={sort} onSortChange={setSort} page={page} onPageChange={setPage} />;
    }
    render(<Controlled />);
    expect(firstCells()[0]).toBe('User 23');

    await user.click(sortButton('Name'));
    expect(firstCells()[0]).toBe('User 01');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(firstCells()[0]).toBe('User 11');
  });

  it('shows the last page when the page is beyond it', () => {
    render(<Users page={9} />);
    expect(firstCells()).toEqual(['User 21', 'User 22', 'User 23']);
  });

  it('in server mode shows data as the page and reports the whole query', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    const pageOne = users.slice(0, 10);
    render(<Users mode="server" data={pageOne} totalCount={230} onQueryChange={onQueryChange} />);

    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByRole('status')).toHaveTextContent('1–10 of 230');
    expect(screen.getByRole('button', { name: 'Page 23' })).toBeInTheDocument();

    await user.click(sortButton('Age'));
    // The server sorts: the rows stay in the order they came.
    expect(firstCells()[0]).toBe('User 01');
    expect(onQueryChange).toHaveBeenLastCalledWith({
      sort: [{ columnId: 'age', direction: 'asc' }],
      filters: {},
      search: '',
      page: 1,
      pageSize: 10,
    });

    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(onQueryChange).toHaveBeenLastCalledWith({
      sort: [{ columnId: 'age', direction: 'asc' }],
      filters: {},
      search: '',
      page: 2,
      pageSize: 10,
    });
  });

  it('shows skeleton rows while loading without data, and marks the table busy', () => {
    render(<Users data={[]} loading />);
    expect(table()).toHaveAttribute('aria-busy', 'true');
    expect(bodyRows()).toHaveLength(5);
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('keeps the rows while reloading', () => {
    render(<Users loading />);
    expect(bodyRows()).toHaveLength(10);
    expect(firstCells()[0]).toBe('User 01');
  });

  it('shows the empty message and the error', () => {
    const { rerender } = render(<Users data={[]} emptyMessage="No users yet" />);
    expect(screen.getByRole('cell', { name: 'No users yet' })).toHaveAttribute('colspan', '4');
    expect(screen.getByRole('status')).toHaveTextContent('0 results');

    rerender(<Users error="Could not load users." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load users.');
    expect(bodyRows()).toHaveLength(1);
  });

  it('translates labels and formats numbers for the locale', () => {
    render(
      <Users
        locale="tr"
        mode="server"
        data={users.slice(0, 10)}
        totalCount={1250}
        labels={{
          rowsPerPage: 'Sayfa başına satır',
          range: (from, to, total) => `${from}–${to} / ${total.toLocaleString('tr')}`,
          pagination: 'Sayfalama',
          previous: 'Önceki',
          next: 'Sonraki',
          page: (n) => `Sayfa ${n}`,
        }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('1–10 / 1.250');
    expect(screen.getByRole('combobox', { name: 'Sayfa başına satır' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Sayfalama' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sonraki' })).toBeInTheDocument();
  });

  it('formats default cell values: numbers and dates for the locale, nothing for empty', () => {
    interface Order {
      total: number;
      date: Date;
      note?: string;
    }
    const orders: Order[] = [{ total: 1234.5, date: new Date(2026, 9, 3) }];
    render(
      <DataTable
        caption="Orders"
        paginated={false}
        locale="tr"
        columns={[
          {
            id: 'total',
            header: 'Total',
            value: (o: Order) => o.total,
          },
          { id: 'date', header: 'Date', value: (o) => o.date },
          { id: 'note', header: 'Note', value: (o) => o.note },
        ]}
        data={orders}
      />,
    );
    const cells = within(screen.getByRole('table', { name: 'Orders' })).getAllByRole('cell');
    expect(cells.map((cell) => cell.textContent)).toEqual(['1.234,5', '03.10.2026', '']);
  });

  it('merges className and forwards ref and props to the wrapper', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Users ref={ref} id="users" className="users" />);
    expect(ref.current).toHaveAttribute('id', 'users');
    expect(ref.current).toHaveClass('users');
    expect(ref.current).toContainElement(table());
  });
});
