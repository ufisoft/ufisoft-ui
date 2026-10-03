import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Grid } from '.';
import { Card } from '../card';
import { Heading } from '../heading';
import { Stack } from '../stack';
import { Text } from '../text';

function Box({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: 'var(--ufi-space-sm)',
        background: 'var(--ufi-color-info-bg)',
        border: '1px dashed var(--ufi-color-info-border)',
        borderRadius: 'var(--ufi-radius-sm)',
      }}
    >
      {children}
    </div>
  );
}

const items = (count: number) =>
  Array.from({ length: count }, (_, i) => <Box key={i}>Item {i + 1}</Box>);

const meta = {
  title: 'Foundations/Grid',
  component: Grid,
  args: {
    columns: 3,
    children: items(6),
  },
  argTypes: {
    children: { control: false },
    columns: { control: { type: 'range', min: 1, max: 12 } },
    gap: {
      control: 'select',
      options: ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'stretch'] },
    as: { control: 'inline-radio', options: ['div', 'section', 'ul', 'ol'] },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ColumnCounts: Story = {
  name: 'Column counts',
  render: (args) => (
    <Stack gap="lg">
      {([2, 4, 6] as const).map((columns) => (
        <Grid {...args} key={columns} columns={columns}>
          {items(columns)}
        </Grid>
      ))}
    </Stack>
  ),
};

export const Responsive: Story = {
  args: {
    columns: { base: 1, sm: 2, lg: 4 },
    children: items(8),
  },
};

export const Gaps: Story = {
  render: (args) => (
    <Stack gap="lg">
      {(['none', 'sm', 'xl'] as const).map((gap) => (
        <Grid {...args} key={gap} gap={gap}>
          {items(3)}
        </Grid>
      ))}
    </Stack>
  ),
};

export const Align: Story = {
  args: {
    align: 'start',
    children: [
      <Box key="tall">
        A taller item
        <br />
        on two lines
      </Box>,
      <Box key="a">Short</Box>,
      <Box key="b">Short</Box>,
    ],
  },
};

export const ProductList: Story = {
  name: 'Example: card list',
  args: { as: 'ul', columns: { base: 1, sm: 2, lg: 3 }, children: undefined },
  render: (args) => (
    <Stack gap="md">
      <Heading level={2}>Products</Heading>
      <Grid {...args}>
        {['Chair', 'Desk', 'Lamp', 'Shelf', 'Sofa', 'Rug'].map((name) => (
          <li key={name}>
            <Card>
              <Text weight="semibold">{name}</Text>
              <Text tone="muted">In stock</Text>
            </Card>
          </li>
        ))}
      </Grid>
    </Stack>
  ),
};
