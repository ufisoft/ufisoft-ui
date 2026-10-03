import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableColumn, type DataTableFilters, type DataTableProps } from '.';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  added: Date;
  active: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Çay bardağı',
    category: 'Kitchen',
    price: 40,
    added: new Date(2026, 9, 1),
    active: true,
  },
  {
    id: 2,
    name: 'Desk lamp',
    category: 'Office',
    price: 350,
    added: new Date(2026, 8, 12),
    active: true,
  },
  {
    id: 3,
    name: 'Office chair',
    category: 'Office',
    price: 2400,
    added: new Date(2026, 6, 3),
    active: false,
  },
  {
    id: 4,
    name: 'Kettle',
    category: 'Kitchen',
    price: 900,
    added: new Date(2026, 9, 2),
    active: true,
  },
  {
    id: 5,
    name: 'Notebook',
    category: 'Stationery',
    price: 25,
    added: new Date(2025, 11, 30),
    active: false,
  },
];

const columns: DataTableColumn<Product>[] = [
  { id: 'name', header: 'Name', value: (p) => p.name, filter: { type: 'text' } },
  {
    id: 'category',
    header: 'Category',
    value: (p) => p.category,
    filter: {
      type: 'select',
      multiple: true,
      options: ['Kitchen', 'Office', 'Stationery'].map((c) => ({ value: c, label: c })),
    },
  },
  { id: 'price', header: 'Price', value: (p) => p.price, filter: { type: 'number' } },
  { id: 'added', header: 'Added', value: (p) => p.added, filter: { type: 'date' } },
  {
    id: 'active',
    header: 'Active',
    value: (p) => p.active,
    searchable: false,
    filter: { type: 'boolean', trueLabel: 'Active', falseLabel: 'Archived' },
  },
];

function Products(props: Partial<DataTableProps<Product>>) {
  return (
    <DataTable
      caption="Products"
      columns={columns}
      data={products}
      getRowId={(p) => String(p.id)}
      searchDebounce={0}
      globalSearch
      {...props}
    />
  );
}

const table = () => screen.getByRole('table', { name: 'Products' });
const names = () =>
  within(table())
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).queryAllByRole('cell')[0]?.textContent);
const filterButton = (column: string) =>
  screen.getByRole('button', { name: new RegExp(`^Filter ${column}`) });
const dialog = () => screen.getByRole('dialog');

describe('DataTable search and filters', () => {
  it('searches every searchable column, forgiving accents', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<Products locale="tr" onSearchChange={onSearchChange} />);

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'cay');
    expect(names()).toEqual(['Çay bardağı']);
    expect(onSearchChange).toHaveBeenLastCalledWith('cay');

    await user.clear(screen.getByRole('searchbox', { name: 'Search' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'office');
    expect(names()).toEqual(['Desk lamp', 'Office chair']);
  });

  it('applies the search after a pause in typing', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSearchChange = vi.fn();
    render(<Products searchDebounce={300} onSearchChange={onSearchChange} />);

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'kett');
    expect(onSearchChange).not.toHaveBeenCalled();
    expect(names()).toHaveLength(5);
    vi.advanceTimersByTime(300);
    await waitFor(() => expect(names()).toEqual(['Kettle']));
    expect(onSearchChange).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('filters a text column from its header and lists the filter', async () => {
    const user = userEvent.setup();
    render(<Products />);

    await user.click(filterButton('Name'));
    expect(dialog()).toHaveAccessibleName('Filter Name');
    await user.selectOptions(
      within(dialog()).getByRole('combobox', { name: 'Condition' }),
      'startsWith',
    );
    await user.type(within(dialog()).getByRole('textbox', { name: 'Value' }), 'o{Enter}');

    expect(names()).toEqual(['Office chair']);
    expect(filterButton('Name')).toHaveAccessibleName('Filter Name (active)');
    expect(screen.getByRole('list', { name: 'Active filters' })).toHaveTextContent(
      'Name starts with “o”',
    );
  });

  // Opens four editors, one with a calendar: over 5 s when the whole suite runs in parallel.
  it('filters by several options, a number range, dates and a yes/no value', async () => {
    const user = userEvent.setup();
    // An explicit locale: summaries format numbers and dates for it, whatever the test machine uses.
    render(<Products locale="en-US" />);

    await user.click(filterButton('Category'));
    await user.click(within(dialog()).getByRole('checkbox', { name: 'Kitchen' }));
    await user.click(within(dialog()).getByRole('checkbox', { name: 'Office' }));
    await user.click(within(dialog()).getByRole('button', { name: 'Apply' }));
    expect(names()).toEqual(['Çay bardağı', 'Desk lamp', 'Office chair', 'Kettle']);

    await user.click(filterButton('Price'));
    await user.type(within(dialog()).getByRole('spinbutton', { name: 'Min' }), '100');
    await user.type(within(dialog()).getByRole('spinbutton', { name: 'Max' }), '1000{Enter}');
    expect(names()).toEqual(['Desk lamp', 'Kettle']);

    await user.click(filterButton('Active'));
    await user.selectOptions(within(dialog()).getByRole('combobox', { name: 'Active' }), 'true');
    await user.click(within(dialog()).getByRole('button', { name: 'Apply' }));
    expect(names()).toEqual(['Desk lamp', 'Kettle']);

    await user.click(filterButton('Added'));
    await user.type(within(dialog()).getByRole('textbox', { name: 'From' }), '10/01/2026');
    await user.tab();
    await user.click(within(dialog()).getByRole('button', { name: 'Apply' }));
    expect(names()).toEqual(['Kettle']);

    expect(
      within(screen.getByRole('list', { name: 'Active filters' }))
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      'Category: Kitchen, Office',
      'Price: 100–1,000',
      'Added ≥ 10/1/2026',
      'Active: Active',
      'Clear all filters',
    ]);
  }, 15_000);

  it('opens a filter with its current value and clears it from the editor', async () => {
    const user = userEvent.setup();
    render(<Products defaultFilters={{ price: { type: 'number', min: 500, max: null } }} />);
    expect(names()).toEqual(['Office chair', 'Kettle']);

    await user.click(filterButton('Price'));
    expect(within(dialog()).getByRole('spinbutton', { name: 'Min' })).toHaveValue(500);
    await user.click(within(dialog()).getByRole('button', { name: 'Clear' }));
    expect(names()).toHaveLength(5);
    expect(screen.queryByRole('list', { name: 'Active filters' })).not.toBeInTheDocument();
  });

  it('removes one filter or all from the list', async () => {
    const user = userEvent.setup();
    render(
      <Products
        defaultFilters={{
          category: { type: 'select', values: ['Office'] },
          active: { type: 'boolean', value: true },
        }}
      />,
    );
    expect(names()).toEqual(['Desk lamp']);

    await user.click(screen.getByRole('button', { name: 'Remove filter: Active: Active' }));
    expect(names()).toEqual(['Desk lamp', 'Office chair']);
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(names()).toHaveLength(5);
  });

  it('offers to clear filters and search when nothing matches', async () => {
    const user = userEvent.setup();
    render(
      <Products
        defaultSearch="zzz"
        defaultFilters={{ active: { type: 'boolean', value: false } }}
      />,
    );
    expect(screen.getByText('No results match the filters.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters and search' }));
    expect(names()).toHaveLength(5);
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
  });

  it('goes back to the first page when filtering', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Products defaultPageSize={2} defaultPage={3} onPageChange={onPageChange} />);

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'e');
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('in server mode reports filters and search in the query and does not filter itself', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    render(<Products mode="server" totalCount={5} onQueryChange={onQueryChange} />);

    await user.click(filterButton('Category'));
    await user.click(within(dialog()).getByRole('checkbox', { name: 'Office' }));
    await user.click(within(dialog()).getByRole('button', { name: 'Apply' }));
    expect(names()).toHaveLength(5);
    expect(onQueryChange).toHaveBeenLastCalledWith({
      sort: [],
      filters: { category: { type: 'select', values: ['Office'] } },
      search: '',
      page: 1,
      pageSize: 10,
    });

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'x');
    expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'x' }));
  });

  it('follows controlled filters and search', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [filters, setFilters] = useState<DataTableFilters>({});
      const [search, setSearch] = useState('');
      return (
        <>
          <Products
            filters={filters}
            onFiltersChange={setFilters}
            search={search}
            onSearchChange={setSearch}
          />
          <button
            type="button"
            onClick={() => {
              setFilters({ category: { type: 'select', values: ['Stationery'] } });
              setSearch('note');
            }}
          >
            Preset
          </button>
        </>
      );
    }
    render(<Controlled />);

    await user.click(screen.getByRole('button', { name: 'Preset' }));
    expect(names()).toEqual(['Notebook']);
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('note');
  });

  it('translates the filter UI', async () => {
    const user = userEvent.setup();
    render(
      <Products
        labels={{
          search: 'Ara',
          filter: (column, active) => `${column} filtresi${active ? ' (etkin)' : ''}`,
          condition: 'Koşul',
          value: 'Değer',
          operators: { contains: 'içerir', equals: 'eşittir', startsWith: 'ile başlar' },
          apply: 'Uygula',
          clear: 'Temizle',
          activeFilters: 'Etkin filtreler',
          removeFilter: (summary) => `Filtreyi kaldır: ${summary}`,
          clearAll: 'Tüm filtreleri temizle',
        }}
      />,
    );
    expect(screen.getByRole('searchbox', { name: 'Ara' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Name filtresi' }));
    await user.type(within(dialog()).getByRole('textbox', { name: 'Değer' }), 'lamp');
    await user.click(within(dialog()).getByRole('button', { name: 'Uygula' }));
    expect(screen.getByRole('button', { name: 'Name filtresi (etkin)' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Filtreyi kaldır: Name içerir “lamp”' }),
    ).toBeInTheDocument();
  });
});
