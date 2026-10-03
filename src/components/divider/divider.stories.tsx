import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from '.';
import { Button } from '../button';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Foundations/Divider',
  component: Divider,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    spacing: {
      control: 'select',
      options: ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
  },
  render: (args) => (
    <div style={{ maxWidth: 400 }}>
      <Text>Account settings</Text>
      <Divider {...args} />
      <Text>Notification settings</Text>
    </div>
  ),
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Spacing: Story = {
  render: (args) => (
    <Stack gap="none" style={{ maxWidth: 400 }}>
      {(['none', 'sm', 'xl'] as const).map((spacing) => (
        <div key={spacing}>
          <Text>spacing=&quot;{spacing}&quot;</Text>
          <Divider {...args} spacing={spacing} />
        </div>
      ))}
    </Stack>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical', spacing: 'xs' },
  render: (args) => (
    <Stack direction="horizontal" gap="none" align="center">
      <Button variant="ghost">Edit</Button>
      <Button variant="ghost">Duplicate</Button>
      <Divider {...args} />
      <Button variant="ghost">Delete</Button>
    </Stack>
  ),
};

export const Decorative: Story = {
  name: 'Example: decorative',
  args: { role: 'presentation' },
};
