import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '.';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Modal } from '../modal';
import { Stack } from '../stack';
import { Text } from '../text';

function MoreIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

const pageActions = (
  <>
    <DropdownMenuItem onSelect={fn()}>Edit</DropdownMenuItem>
    <DropdownMenuItem onSelect={fn()}>Duplicate</DropdownMenuItem>
    <DropdownMenuItem onSelect={fn()}>Move to…</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem tone="danger" onSelect={fn()}>
      Delete
    </DropdownMenuItem>
  </>
);

const meta = {
  title: 'Overlay/DropdownMenu',
  component: DropdownMenu,
  subcomponents: { DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel },
  args: {
    content: pageActions,
    children: <Button variant="secondary">Actions</Button>,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    content: { control: false },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '16rem', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
};

export const ItemStates: Story = {
  args: {
    defaultOpen: true,
    content: (
      <>
        <DropdownMenuLabel>Page</DropdownMenuLabel>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem disabled>Publish (no changes)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger">Delete</DropdownMenuItem>
      </>
    ),
  },
};

export const OnIconButton: Story = {
  name: 'Example: row actions',
  args: {
    align: 'end',
    children: <IconButton aria-label="More actions" variant="ghost" icon={<MoreIcon />} />,
  },
};

export const LinkItems: Story = {
  name: 'Example: navigation with asChild',
  args: {
    content: (
      <>
        <DropdownMenuLabel>Signed in as Ada</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <a href="#profile">Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="#settings">Settings</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </>
    ),
    children: <Button variant="ghost">Account</Button>,
  },
};

export const LongContent: Story = {
  name: 'Edge case: many and long items',
  args: {
    defaultOpen: true,
    content: (
      <>
        {Array.from({ length: 14 }, (_, i) => (
          <DropdownMenuItem key={i}>
            {i === 0
              ? 'Move to “Quarterly reports and investor relations archive”'
              : `Folder ${i + 1}`}
          </DropdownMenuItem>
        ))}
      </>
    ),
  },
};

export const InModal: Story = {
  name: 'Example: inside a Modal',
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState('nothing');
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal open={open} onOpenChange={setOpen} title="Media library">
          <Stack gap="sm" align="start">
            <Text>Escape closes the menu first, then the modal. Last action: {last}</Text>
            <DropdownMenu
              {...args}
              content={
                <>
                  <DropdownMenuItem onSelect={() => setLast('rename')}>Rename</DropdownMenuItem>
                  <DropdownMenuItem tone="danger" onSelect={() => setLast('delete')}>
                    Delete
                  </DropdownMenuItem>
                </>
              }
            />
          </Stack>
        </Modal>
      </>
    );
  },
};
