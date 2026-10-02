import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '.';
import { Button } from '../button';
import { Stack } from '../stack';

const meta = {
  title: 'Forms/Input',
  component: Input,
  args: { 'aria-label': 'Search', placeholder: 'Search…' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="sm">
      <Input {...args} size="sm" />
      <Input {...args} size="md" />
      <Input {...args} size="lg" />
    </Stack>
  ),
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'not-an-email' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Read only for now' },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'INV-2026-0042' },
};

export const AlignedWithButton: Story = {
  name: 'Example: aligned with Button',
  render: (args) => (
    <Stack direction="horizontal" gap="xs">
      <Input {...args} />
      <Button>Search</Button>
    </Stack>
  ),
};
