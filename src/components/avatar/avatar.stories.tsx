import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '.';
import { Stack } from '../stack';
import { Text } from '../text';

// Inline image so stories need no network.
const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#c7d2fe"/><circle cx="32" cy="26" r="12" fill="#4f46e5"/><rect x="12" y="42" width="40" height="30" rx="15" fill="#4f46e5"/></svg>',
)}`;

const meta = {
  title: 'Foundations/Avatar',
  component: Avatar,
  args: { name: 'Ada Lovelace', src: portrait },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Initials: Story = {
  args: { src: undefined },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap="sm" align="center">
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
      <Avatar {...args} src={undefined} size="sm" />
      <Avatar {...args} src={undefined} size="md" />
      <Avatar {...args} src={undefined} size="lg" />
    </Stack>
  ),
};

export const BrokenImage: Story = {
  name: 'Edge case: image fails to load',
  args: { src: '/this-image-does-not-exist.png', name: 'Grace Hopper' },
};

export const TurkishInitials: Story = {
  name: 'Edge case: Turkish initials',
  render: () => (
    <Stack direction="horizontal" gap="sm" align="center" lang="tr">
      <Avatar name="ilker yılmaz" />
      <Avatar name="Şule Çağlar" />
      <Avatar name="Özge" />
    </Stack>
  ),
};

export const WithName: Story = {
  name: 'Example: next to a visible name',
  render: (args) => (
    <Stack direction="horizontal" gap="xs" align="center">
      <Avatar {...args} alt="" />
      <Stack gap="none">
        <Text weight="medium">Ada Lovelace</Text>
        <Text size="sm" tone="muted">
          Edited 2 hours ago
        </Text>
      </Stack>
    </Stack>
  ),
};
