import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Pagination } from '.';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 20, onPageChange: fn() },
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    pageCount: { control: { type: 'number', min: 0 } },
  },
  render: function Render(args) {
    const [page, setPage] = useState(args.page);
    return (
      <Pagination
        {...args}
        page={page}
        onPageChange={(next) => {
          setPage(next);
          args.onPageChange?.(next);
        }}
      />
    );
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MiddlePage: Story = {
  args: { page: 10 },
};

export const LastPage: Story = {
  args: { page: 20 },
};

export const FewPages: Story = {
  args: { pageCount: 5, page: 2 },
};

export const Links: Story = {
  name: 'Example: links with getHref',
  args: { page: 3, pageCount: 8, getHref: (page) => `?page=${page}` },
  render: (args) => <Pagination {...args} />,
};

export const Translated: Story = {
  name: 'Example: translated labels',
  args: {
    'aria-label': 'Sayfalar',
    previousLabel: 'Önceki',
    nextLabel: 'Sonraki',
    getPageLabel: (n) => `Sayfa ${n}`,
  },
};

export const WithSummary: Story = {
  name: 'Example: under a table',
  render: function Render(args) {
    const [page, setPage] = useState(1);
    const perPage = 25;
    const total = 482;
    const pageCount = Math.ceil(total / perPage);
    return (
      <Stack direction="horizontal" gap="md" align="center" justify="between" wrap>
        <Text size="sm" tone="muted">
          {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total} results
        </Text>
        <Pagination {...args} page={page} pageCount={pageCount} onPageChange={setPage} />
      </Stack>
    );
  },
};

export const Narrow: Story = {
  name: 'Edge case: narrow space',
  args: { page: 10 },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
};
