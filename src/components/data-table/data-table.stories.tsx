import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { fn } from 'storybook/test';
import { DataTable, type DataTableColumn, type DataTableQuery } from '.';
import { Badge } from '../badge';
import { Button } from '../button';
import { Stack } from '../stack';
import { Text } from '../text';
import { sortRows } from './sorting';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Invited' | 'Suspended';
  orders: number;
  createdAt: Date;
}

const firstNames = [
  'Ada',
  'Bora',
  'Ceren',
  'Deniz',
  'Ece',
  'Furkan',
  'Gizem',
  'Hakan',
  'Irmak',
  'Kerem',
];
const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Öztürk', 'Aydın', 'Arslan'];
const roles: User['role'][] = ['Admin', 'Editor', 'Viewer'];
const statuses: User['status'][] = ['Active', 'Active', 'Invited', 'Suspended'];

function makeUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => {
    const first = firstNames[i % firstNames.length] as string;
    const last = lastNames[(i * 3) % lastNames.length] as string;
    return {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${i + 1}@example.com`,
      role: roles[i % roles.length] as User['role'],
      status: statuses[(i * 7) % statuses.length] as User['status'],
      orders: (i * 37) % 120,
      createdAt: new Date(2026, (i * 5) % 12, ((i * 11) % 27) + 1),
    };
  });
}

const users = makeUsers(57);

const statusTone = { Active: 'success', Invited: 'info', Suspended: 'danger' } as const;

const columns: DataTableColumn<User>[] = [
  { id: 'name', header: 'Name', value: (u) => u.name },
  { id: 'email', header: 'Email', value: (u) => u.email },
  { id: 'role', header: 'Role', value: (u) => u.role },
  {
    id: 'status',
    header: 'Status',
    value: (u) => u.status,
    cell: (u) => <Badge tone={statusTone[u.status]}>{u.status}</Badge>,
  },
  { id: 'orders', header: 'Orders', value: (u) => u.orders, align: 'end' },
  { id: 'createdAt', header: 'Created', value: (u) => u.createdAt, align: 'end' },
];

const meta = {
  title: 'Data display/DataTable',
  component: DataTable,
  args: {
    caption: 'Users',
    columns: columns as DataTableColumn<unknown>[],
    data: users,
    getRowId: (row) => String((row as User).id),
    onSortChange: fn(),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    onQueryChange: fn(),
  },
  argTypes: {
    columns: { control: false },
    data: { control: false },
    density: { control: 'inline-radio', options: ['normal', 'compact'] },
    maxHeight: { control: 'inline-radio', options: [undefined, 'sm', 'md', 'lg'] },
    mode: { control: false },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultiSort: Story = {
  name: 'Sorted by several columns',
  args: {
    defaultSort: [
      { columnId: 'role', direction: 'asc' },
      { columnId: 'orders', direction: 'desc' },
    ],
  },
};

export const Compact: Story = {
  args: { density: 'compact', defaultPageSize: 25 },
};

export const StickyHeader: Story = {
  name: 'Max height with sticky header',
  args: { maxHeight: 'md', paginated: false },
};

export const Loading: Story = {
  args: { data: [], loading: true },
};

export const Empty: Story = {
  args: { data: [], emptyMessage: 'No users match. Invite your team to get started.' },
};

export const ErrorState: Story = {
  name: 'Error',
  args: { error: 'Could not load users. Check your connection and try again.' },
};

export const Turkish: Story = {
  name: 'Example: Turkish',
  args: {
    caption: 'Kullanıcılar',
    locale: 'tr',
    columns: [
      { id: 'name', header: 'Ad', value: (u: User) => u.name },
      { id: 'email', header: 'E-posta', value: (u: User) => u.email },
      { id: 'orders', header: 'Sipariş', value: (u: User) => u.orders, align: 'end' },
      { id: 'createdAt', header: 'Oluşturulma', value: (u: User) => u.createdAt, align: 'end' },
    ] as DataTableColumn<unknown>[],
    labels: {
      loading: 'Yükleniyor…',
      empty: 'Sonuç yok',
      rowsPerPage: 'Sayfa başına satır',
      range: (from, to, total) => (total === 0 ? '0 sonuç' : `${from}–${to} / ${total}`),
      sorted: (direction, priority) =>
        `${direction === 'asc' ? 'artan' : 'azalan'} sıralı${priority ? `, öncelik ${priority}` : ''}`,
      pagination: 'Sayfalama',
      previous: 'Önceki',
      next: 'Sonraki',
      page: (n) => `Sayfa ${n}`,
    },
  },
};

/** A fake API: sorts and pages on the "server" after a delay, like a real request. */
function fetchUsers(query: DataTableQuery) {
  return new Promise<{ rows: User[]; total: number }>((resolve) => {
    setTimeout(() => {
      const all = makeUsers(1250);
      const sorted = sortRows(
        all,
        query.sort,
        columns,
        new Intl.Collator(undefined, { numeric: true }),
      );
      const start = (query.page - 1) * query.pageSize;
      resolve({ rows: sorted.slice(start, start + query.pageSize), total: all.length });
    }, 600);
  });
}

export const ServerMode: Story = {
  name: 'Example: server-side sorting and paging',
  render: function Render(args) {
    const [query, setQuery] = useState<DataTableQuery>({ sort: [], page: 1, pageSize: 10 });
    const [result, setResult] = useState<{ rows: User[]; total: number }>({ rows: [], total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let current = true;
      setLoading(true);
      void fetchUsers(query).then((next) => {
        if (!current) return;
        setResult(next);
        setLoading(false);
      });
      return () => {
        current = false;
      };
    }, [query]);

    return (
      <Stack gap="sm">
        <DataTable
          {...args}
          caption="Users (1,250 on the server)"
          mode="server"
          data={result.rows}
          totalCount={result.total}
          loading={loading}
          sort={query.sort}
          page={query.page}
          pageSize={query.pageSize}
          onQueryChange={setQuery}
        />
        <Text size="sm" tone="muted">
          Query sent to the server: {JSON.stringify(query)}
        </Text>
      </Stack>
    );
  },
};

export const Controlled: Story = {
  name: 'Example: controlled state',
  render: function Render(args) {
    const [query, setQuery] = useState<DataTableQuery>({
      sort: [{ columnId: 'createdAt', direction: 'desc' }],
      page: 1,
      pageSize: 10,
    });
    return (
      <Stack gap="sm">
        <DataTable
          {...args}
          sort={query.sort}
          page={query.page}
          pageSize={query.pageSize}
          onQueryChange={setQuery}
        />
        <Stack direction="horizontal" gap="sm" align="center" wrap>
          <Button
            variant="secondary"
            onClick={() =>
              setQuery({ sort: [{ columnId: 'orders', direction: 'desc' }], page: 1, pageSize: 10 })
            }
          >
            Top customers
          </Button>
          <Text size="sm" tone="muted">
            Keep the query in the URL or a store to restore the view.
          </Text>
        </Stack>
      </Stack>
    );
  },
};
