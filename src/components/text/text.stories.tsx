import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from '.';
import { Stack } from '../stack';

const meta = {
  title: 'Foundations/Text',
  component: Text,
  args: { children: 'The quick brown fox jumps over the lazy dog.' },
  argTypes: {
    as: { control: 'select', options: ['p', 'span', 'div', 'strong', 'em', 'small'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    weight: { control: 'inline-radio', options: ['regular', 'medium', 'semibold', 'bold'] },
    tone: { control: 'inline-radio', options: ['default', 'muted', 'subtle', 'danger', 'success'] },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="xs">
      <Text {...args} size="xs" />
      <Text {...args} size="sm" />
      <Text {...args} size="md" />
      <Text {...args} size="lg" />
    </Stack>
  ),
};

export const Weights: Story = {
  render: (args) => (
    <Stack gap="xs">
      <Text {...args} weight="regular" />
      <Text {...args} weight="medium" />
      <Text {...args} weight="semibold" />
      <Text {...args} weight="bold" />
    </Stack>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <Stack gap="xs">
      <Text {...args} tone="default" />
      <Text {...args} tone="muted" />
      <Text {...args} tone="subtle" />
      <Text {...args} tone="danger" />
      <Text {...args} tone="success" />
    </Stack>
  ),
};

export const LongContent: Story = {
  name: 'Edge case: unbroken long word',
  args: {
    children: 'Pneumonoultramicroscopicsilicovolcanoconiosis-and-a-very-long-unbroken-identifier',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 240 }}>
        <Story />
      </div>
    ),
  ],
};
