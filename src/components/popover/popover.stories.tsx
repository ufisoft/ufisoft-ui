import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Popover } from '.';
import { Button } from '../button';
import { FormField, FormLabel } from '../form-field';
import { Input } from '../input';
import { Modal } from '../modal';
import { Select } from '../select';
import { Stack } from '../stack';
import { Text } from '../text';

const filters = (
  <Stack gap="sm">
    <FormField>
      <FormLabel>Author</FormLabel>
      <Input placeholder="Any author" />
    </FormField>
    <FormField>
      <FormLabel>Status</FormLabel>
      <Select defaultValue="">
        <option value="">Any status</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </Select>
    </FormField>
  </Stack>
);

const meta = {
  title: 'Overlay/Popover',
  component: Popover,
  args: {
    'aria-label': 'Filters',
    content: filters,
    children: <Button variant="secondary">Filters</Button>,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    content: { control: false },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '22rem', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
};

export const Placement: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap="md">
      {(['start', 'center', 'end'] as const).map((align) => (
        <Popover
          key={align}
          {...args}
          aria-label={`Aligned ${align}`}
          align={align}
          content={<Text>Aligned to the {align} of the trigger.</Text>}
        >
          <Button variant="secondary">align {align}</Button>
        </Popover>
      ))}
    </Stack>
  ),
};

export const ClosedFromContent: Story = {
  name: 'Example: closed from its content',
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [applied, setApplied] = useState('none');
    return (
      <Stack gap="sm" align="center">
        <Popover
          {...args}
          open={open}
          onOpenChange={setOpen}
          content={
            <Stack gap="sm">
              {filters}
              <Stack direction="horizontal" gap="xs" justify="end">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setApplied('author and status');
                    setOpen(false);
                  }}
                >
                  Apply
                </Button>
              </Stack>
            </Stack>
          }
        />
        <Text tone="muted">Applied filters: {applied}</Text>
      </Stack>
    );
  },
};

export const LongContent: Story = {
  name: 'Edge case: long content',
  args: {
    'aria-label': 'About drafts',
    defaultOpen: true,
    content: (
      <Text>
        Drafts are kept for 30 days. After that they move to the archive, where only administrators
        can restore them. Published pages are never archived automatically.
      </Text>
    ),
    children: <Button variant="secondary">About drafts</Button>,
  },
};

export const InModal: Story = {
  name: 'Example: inside a Modal',
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal open={open} onOpenChange={setOpen} title="Media library">
          <Stack gap="sm" align="start">
            <Text>Escape closes the popover first, then the modal.</Text>
            <Popover {...args} />
          </Stack>
        </Modal>
      </>
    );
  },
};
