import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '.';
import { Badge } from '../badge';
import { DropdownMenu, DropdownMenuItem } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import { Pagination } from '../pagination';
import { Stack } from '../stack';

const pages = [
  { title: 'Pricing', status: 'Published', views: 12_048, updated: '2026-09-28' },
  { title: 'About us', status: 'Draft', views: 312, updated: '2026-09-30' },
  { title: 'Careers', status: 'Published', views: 4_870, updated: '2026-09-12' },
  { title: 'Press kit', status: 'Needs review', views: 96, updated: '2026-10-01' },
];

const tone = { Published: 'success', Draft: 'neutral', 'Needs review': 'warning' } as const;

function MoreIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

const rows = (
  <>
    <TableHeader>
      <TableRow>
        <TableHead>Title</TableHead>
        <TableHead>Status</TableHead>
        <TableHead align="end">Views</TableHead>
        <TableHead>Last updated</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {pages.map((page) => (
        <TableRow key={page.title}>
          <TableHead scope="row">{page.title}</TableHead>
          <TableCell>
            <Badge tone={tone[page.status as keyof typeof tone]}>{page.status}</Badge>
          </TableCell>
          <TableCell align="end">{page.views.toLocaleString('en-US')}</TableCell>
          <TableCell>{page.updated}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </>
);

const meta = {
  title: 'Data display/Table',
  component: Table,
  subcomponents: { TableHeader, TableBody, TableRow, TableHead, TableCell },
  args: { caption: 'Pages', children: rows },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRowActions: Story = {
  name: 'Example: row actions',
  args: {
    children: (
      <>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead align="end">Views</TableHead>
            <TableHead align="end">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.title}>
              <TableHead scope="row">{page.title}</TableHead>
              <TableCell align="end">{page.views.toLocaleString('en-US')}</TableCell>
              <TableCell align="end">
                <DropdownMenu
                  align="end"
                  content={
                    <>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem tone="danger">Delete</DropdownMenuItem>
                    </>
                  }
                >
                  <IconButton
                    aria-label={`Actions for ${page.title}`}
                    variant="ghost"
                    size="sm"
                    icon={<MoreIcon />}
                  />
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </>
    ),
  },
};

export const WithPagination: Story = {
  name: 'Example: with pagination',
  render: (args) => (
    <Stack gap="md" align="end">
      <Table {...args} />
      <Pagination page={1} pageCount={8} />
    </Stack>
  ),
};

export const Wide: Story = {
  name: 'Edge case: wider than the screen',
  args: {
    caption: 'Page analytics',
    children: (
      <>
        <TableHeader>
          <TableRow>
            {['Title', 'Author', 'Language', 'Created', 'Last updated'].map((label) => (
              <TableHead key={label}>{label}</TableHead>
            ))}
            {['Views', 'Visitors', 'Avg. time'].map((label) => (
              <TableHead key={label} align="end">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.title}>
              <TableHead scope="row">{page.title}</TableHead>
              <TableCell>Ada Lovelace</TableCell>
              <TableCell>English</TableCell>
              <TableCell>2026-01-15</TableCell>
              <TableCell>{page.updated}</TableCell>
              <TableCell align="end">{page.views.toLocaleString('en-US')}</TableCell>
              <TableCell align="end">
                {Math.round(page.views * 0.7).toLocaleString('en-US')}
              </TableCell>
              <TableCell align="end">1m 42s</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export const Empty: Story = {
  name: 'Edge case: no rows',
  args: {
    children: (
      <>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={2} align="center">
              No pages yet.
            </TableCell>
          </TableRow>
        </TableBody>
      </>
    ),
  },
};
