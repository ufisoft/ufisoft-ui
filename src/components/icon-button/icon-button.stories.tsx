import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { IconButton } from '.';
import { Stack } from '../stack';

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: 'Actions/IconButton',
  component: IconButton,
  args: { 'aria-label': 'Delete item', icon: <TrashIcon />, onClick: fn() },
  argTypes: {
    icon: { control: false },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: 'secondary' },
};

export const Variants: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap="sm">
      <IconButton {...args} variant="primary" />
      <IconButton {...args} variant="secondary" />
      <IconButton {...args} variant="ghost" />
      <IconButton {...args} variant="danger" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap="sm" align="center">
      <IconButton {...args} variant="secondary" size="sm" />
      <IconButton {...args} variant="secondary" size="md" />
      <IconButton {...args} variant="secondary" size="lg" />
    </Stack>
  ),
};

export const Loading: Story = {
  args: { variant: 'secondary', loading: true },
};
