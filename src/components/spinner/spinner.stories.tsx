import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '.';
import { Stack } from '../stack';

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <Stack direction="horizontal" gap="md" align="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Stack>
  ),
};

export const InheritsColor: Story = {
  name: 'Inherits text color',
  render: () => (
    <span style={{ color: 'var(--ufi-color-text-danger)' }}>
      <Spinner />
    </span>
  ),
};

export const CustomLabel: Story = {
  name: 'Accessibility: custom label',
  args: { label: 'Loading orders' },
};
