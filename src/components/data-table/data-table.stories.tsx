import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { tr } from 'react-day-picker/locale';
import { fn } from 'storybook/test';
import {
  DataTable,
  type DataTableColumn,
  type DataTableQuery,
  type DataTableRowAction,
  type DataTableSelection,
} from '.';
import { Badge } from '../badge';
import { Button } from '../button';
import { Stack } from '../stack';
import { Text } from '../text';
import { filterRows } from './filtering';
import { sortRows } from './sorting';
import { moveItem } from './virtual';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Invited' | 'Suspended';
  orders: number;
  createdAt: Date;
  verified: boolean;
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
      verified: i % 4 !== 1,
    };
  });
}

const users = makeUsers(57);

const statusTone = { Active: 'success', Invited: 'info', Suspended: 'danger' } as const;

const columns: DataTableColumn<User>[] = [
  { id: 'name', header: 'Name', value: (u) => u.name, filter: { type: 'text' } },
  { id: 'email', header: 'Email', value: (u) => u.email, filter: { type: 'text' } },
  {
    id: 'role',
    header: 'Role',
    value: (u) => u.role,
    filter: {
      type: 'select',
      multiple: true,
      options: roles.map((role) => ({ value: role, label: role })),
    },
  },
  {
    id: 'status',
    header: 'Status',
    value: (u) => u.status,
    cell: (u) => <Badge tone={statusTone[u.status]}>{u.status}</Badge>,
    filter: {
      type: 'select',
      options: ['Active', 'Invited', 'Suspended'].map((status) => ({
        value: status,
        label: status,
      })),
    },
  },
  {
    id: 'orders',
    header: 'Orders',
    value: (u) => u.orders,
    align: 'end',
    filter: { type: 'number' },
  },
  {
    id: 'createdAt',
    header: 'Created',
    value: (u) => u.createdAt,
    align: 'end',
    filter: { type: 'date' },
  },
  {
    id: 'verified',
    header: 'Verified',
    value: (u) => u.verified,
    cell: (u) => (u.verified ? 'Yes' : 'No'),
    searchable: false,
    filter: { type: 'boolean', trueLabel: 'Verified', falseLabel: 'Not verified' },
  },
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

export const SearchAndFilters: Story = {
  name: 'Search and column filters',
  args: { globalSearch: true },
};

export const PresetFilters: Story = {
  name: 'Preset filters',
  args: {
    globalSearch: true,
    defaultFilters: {
      role: { type: 'select', values: ['Admin', 'Editor'] },
      orders: { type: 'number', min: 50, max: null },
    },
  },
};

export const NoMatches: Story = {
  name: 'Filters with no matches',
  args: { globalSearch: true, defaultSearch: 'nobody-matches-this' },
};

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

/** Row actions shared by the selection stories: the "⋯" button and right-click open the same menu. */
function userActions(log: (message: string) => void): DataTableRowAction<User>[] {
  return [
    { id: 'edit', label: 'Edit', onSelect: (u) => log(`Edit ${u.name}`) },
    { id: 'invite', label: 'Resend invite', onSelect: (u) => log(`Invite sent to ${u.email}`) },
    {
      id: 'suspend',
      label: 'Suspend',
      tone: 'danger',
      disabled: (u) => u.status === 'Suspended',
      onSelect: (u) => log(`Suspend ${u.name}`),
    },
  ];
}

export const SelectionAndActions: Story = {
  name: 'Selection, bulk and row actions',
  render: function Render(args) {
    const [message, setMessage] = useState('Select rows, or open a row’s menu.');
    return (
      <Stack gap="sm">
        <DataTable
          {...args}
          selectable
          globalSearch
          isRowSelectable={(row) => (row as User).role !== 'Admin'}
          bulkActions={[
            {
              id: 'export',
              label: 'Export',
              onSelect: ({ rows }) => setMessage(`Export ${rows.length} users`),
            },
            {
              id: 'delete',
              label: 'Delete',
              tone: 'danger',
              onSelect: ({ rows, clearSelection }) => {
                setMessage(`Delete ${rows.length} users`);
                clearSelection();
              },
            },
          ]}
          rowActions={userActions(setMessage) as DataTableRowAction<unknown>[]}
        />
        <Text size="sm" tone="muted" role="log">
          {message}
        </Text>
      </Stack>
    );
  },
};

export const RowDetail: Story = {
  name: 'Expandable rows and row click',
  render: function Render(args) {
    const [message, setMessage] = useState('Click a row, or open its details.');
    return (
      <Stack gap="sm">
        <DataTable
          {...args}
          defaultExpandedRowIds={['2']}
          onRowClick={(row) => setMessage(`Open ${(row as User).name}`)}
          renderDetail={(row) => {
            const u = row as User;
            return (
              <Stack gap="xs">
                <Text weight="semibold">{u.name}</Text>
                <Text size="sm">
                  {u.email} · {u.role} · {u.orders} orders ·{' '}
                  {u.verified ? 'Verified' : 'Not verified'}
                </Text>
              </Stack>
            );
          }}
        />
        <Text size="sm" tone="muted" role="log">
          {message}
        </Text>
      </Stack>
    );
  },
};

/** Wide columns, so the table scrolls sideways and pinning shows. */
const wideColumns = columns.map((column) => ({
  ...column,
  width: { name: 200, email: 260, role: 140, status: 150, orders: 120, createdAt: 160 }[column.id],
  pinned: column.id === 'name' ? ('start' as const) : undefined,
}));

export const ColumnManagement: Story = {
  name: 'Resize, reorder, hide and pin columns',
  args: {
    columns: wideColumns as DataTableColumn<unknown>[],
    resizableColumns: true,
    reorderableColumns: true,
    columnChooser: true,
    selectable: true,
    rowActions: userActions(() => {}) as DataTableRowAction<unknown>[],
    // Changes survive a reload of this story.
    storageKey: 'storybook-users',
  },
};

export const Virtualized: Story = {
  name: '10,000 rows, virtualized',
  args: {
    caption: 'Users (10,000, only the rows in view are rendered)',
    data: makeUsers(10_000),
    virtualized: true,
    paginated: false,
    selectable: true,
    maxHeight: 'md',
  },
};

export const RowReorder: Story = {
  name: 'Reorder rows by drag or keyboard',
  render: function Render(args) {
    const [rows, setRows] = useState(() => users.slice(0, 8));
    return (
      <DataTable
        {...args}
        caption="Priority queue"
        data={rows}
        paginated={false}
        reorderableRows
        onRowReorder={({ fromIndex, toIndex }) =>
          setRows((current) => moveItem(current, fromIndex, toIndex))
        }
      />
    );
  },
};

export const InfiniteLoading: Story = {
  name: 'Load more on scroll',
  render: function Render(args) {
    const all = useState(() => makeUsers(300))[0];
    const [count, setCount] = useState(40);
    const [loading, setLoading] = useState(false);
    return (
      <DataTable
        {...args}
        caption="Users (40 at a time, up to 300)"
        data={all.slice(0, count)}
        paginated={false}
        maxHeight="md"
        loading={loading}
        hasMore={count < all.length}
        onLoadMore={() => {
          setLoading(true);
          setTimeout(() => {
            setCount((current) => current + 40);
            setLoading(false);
          }, 600);
        }}
      />
    );
  },
};

export const InlineEditing: Story = {
  name: 'Inline editing and keyboard grid',
  render: function Render(args) {
    const [rows, setRows] = useState(() => users.slice(0, 8));
    const [message, setMessage] = useState('Focus a cell and press Enter, or double-click it.');
    return (
      <Stack gap="sm">
        <DataTable
          {...args}
          caption="Users (editable)"
          data={rows}
          paginated={false}
          columns={
            [
              {
                id: 'name',
                header: 'Name',
                value: (u) => u.name,
                editor: { type: 'text', required: true, maxLength: 60 },
              },
              {
                id: 'email',
                header: 'Email',
                value: (u) => u.email,
                editor: {
                  type: 'text',
                  required: true,
                  validate: (value) => (value.includes('@') ? null : 'Enter an email address'),
                },
              },
              {
                id: 'role',
                header: 'Role',
                value: (u) => u.role,
                editor: {
                  type: 'select',
                  required: true,
                  options: roles.map((role) => ({ value: role, label: role })),
                },
                // Admins cannot be demoted here.
                editable: (u) => u.role !== 'Admin',
              },
              {
                id: 'orders',
                header: 'Orders',
                value: (u) => u.orders,
                align: 'end',
                editor: { type: 'number', min: 0 },
              },
              {
                id: 'createdAt',
                header: 'Created',
                value: (u) => u.createdAt,
                align: 'end',
                editor: { type: 'date' },
              },
            ] satisfies DataTableColumn<User>[] as DataTableColumn<unknown>[]
          }
          onCellEdit={({ row, columnId, value }) =>
            new Promise<string | undefined>((resolve) => {
              // A fake save: names starting with "x" are "taken" on the server.
              setTimeout(() => {
                if (columnId === 'name' && String(value).toLowerCase().startsWith('x')) {
                  return resolve('That name is taken');
                }
                setRows((current) =>
                  current.map((u) => (u === row ? { ...u, [columnId]: value } : u)),
                );
                setMessage(`Saved ${columnId} of ${(row as User).name}`);
                resolve(undefined);
              }, 400);
            })
          }
        />
        <Text size="sm" tone="muted" role="log">
          {message}
        </Text>
      </Stack>
    );
  },
};

export const KeyboardGrid: Story = {
  name: 'Keyboard grid without editing',
  args: {
    cellNavigation: true,
    selectable: true,
    rowActions: userActions(() => {}) as DataTableRowAction<unknown>[],
  },
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

/** A fake API: filters, sorts and pages on the "server" after a delay, like a real request. */
const serverUsers = makeUsers(1250);
function fetchUsers(query: DataTableQuery) {
  return new Promise<{ rows: User[]; total: number }>((resolve) => {
    setTimeout(() => {
      const all = filterRows(serverUsers, columns, query.filters, query.search);
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
    const [query, setQuery] = useState<DataTableQuery>({
      sort: [],
      filters: {},
      search: '',
      page: 1,
      pageSize: 10,
    });
    const [result, setResult] = useState<{ rows: User[]; total: number }>({ rows: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [selection, setSelection] = useState<DataTableSelection>({ ids: [], allMatching: false });
    const [message, setMessage] = useState(
      'Select a page, then “Select all” to choose every result.',
    );

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
          globalSearch
          dateLocale={tr}
          data={result.rows}
          totalCount={result.total}
          loading={loading}
          sort={query.sort}
          filters={query.filters}
          search={query.search}
          page={query.page}
          pageSize={query.pageSize}
          onQueryChange={setQuery}
          selectable
          selection={selection}
          onSelectionChange={setSelection}
          bulkActions={[
            {
              id: 'export',
              label: 'Export',
              onSelect: ({ selection: chosen, query: current }) =>
                setMessage(
                  chosen.allMatching
                    ? `Export every user matching ${JSON.stringify(current.filters)}`
                    : `Export users ${chosen.ids.join(', ')}`,
                ),
            },
          ]}
        />
        <Text size="sm" tone="muted">
          Query sent to the server: {JSON.stringify(query)}
        </Text>
        <Text size="sm" tone="muted" role="log">
          {message}
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
      filters: {},
      search: '',
      page: 1,
      pageSize: 10,
    });
    return (
      <Stack gap="sm">
        <DataTable
          {...args}
          globalSearch
          sort={query.sort}
          filters={query.filters}
          search={query.search}
          page={query.page}
          pageSize={query.pageSize}
          onQueryChange={setQuery}
        />
        <Stack direction="horizontal" gap="sm" align="center" wrap>
          <Button
            variant="secondary"
            onClick={() =>
              setQuery({
                sort: [{ columnId: 'orders', direction: 'desc' }],
                filters: { status: { type: 'select', values: ['Active'] } },
                search: '',
                page: 1,
                pageSize: 10,
              })
            }
          >
            Top active customers
          </Button>
          <Text size="sm" tone="muted">
            Keep the query in the URL or a store to restore the view.
          </Text>
        </Stack>
      </Stack>
    );
  },
};
