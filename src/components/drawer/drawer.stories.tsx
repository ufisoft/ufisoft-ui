import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Drawer, type DrawerProps } from '.';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { FormField, FormLabel } from '../form-field';
import { Input } from '../input';
import { Stack } from '../stack';
import { Text } from '../text';

function Demo(args: DrawerProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        {...args}
        open={open}
        onOpenChange={(next) => {
          args.onOpenChange(next);
          setOpen(next);
        }}
      />
    </>
  );
}

const meta = {
  title: 'Overlay/Drawer',
  component: Drawer,
  args: {
    open: false,
    onOpenChange: fn(),
    title: 'Filters',
    description: 'Narrow down the list of pages.',
    children: (
      <Stack gap="sm">
        <FormField>
          <FormLabel>Author</FormLabel>
          <Input />
        </FormField>
        <Checkbox>Published only</Checkbox>
        <Checkbox>Has comments</Checkbox>
      </Stack>
    ),
    footer: <Button>Apply filters</Button>,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['start', 'end', 'bottom'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    open: { control: false },
    children: { control: false },
    footer: { control: false },
  },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Start: Story = {
  name: 'Side: start',
  args: { side: 'start' },
};

export const Bottom: Story = {
  name: 'Side: bottom',
  args: { side: 'bottom' },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap="sm">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Demo key={size} {...args} size={size} title={`Size ${size}`} />
      ))}
    </Stack>
  ),
};

export const LongContent: Story = {
  name: 'Long content (body scrolls)',
  args: {
    title: 'Activity',
    description: undefined,
    footer: undefined,
    children: (
      <Stack gap="sm">
        {Array.from({ length: 40 }, (_, i) => (
          <Text key={i}>
            Page {i + 1} was edited {i + 1} hour{i === 0 ? '' : 's'} ago.
          </Text>
        ))}
      </Stack>
    ),
  },
};

export const Turkish: Story = {
  name: 'Example: Turkish',
  args: {
    title: 'Filtreler',
    description: 'Sayfa listesini daraltın.',
    closeLabel: 'Kapat',
    children: (
      <Stack gap="sm">
        <Checkbox>Yalnızca yayımlananlar</Checkbox>
        <Checkbox>Yorumu olanlar</Checkbox>
      </Stack>
    ),
    footer: <Button>Uygula</Button>,
  },
};
