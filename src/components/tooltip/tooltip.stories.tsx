import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tooltip } from '.';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Modal } from '../modal';
import { Stack } from '../stack';

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: 'Overlay/Tooltip',
  component: Tooltip,
  args: {
    content: 'Saves a draft you can publish later',
    children: <Button variant="secondary">Save draft</Button>,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    content: { control: 'text' },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
};

export const Sides: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap="md">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side} {...args} side={side} content={`On the ${side}`}>
          <Button variant="secondary">{side}</Button>
        </Tooltip>
      ))}
    </Stack>
  ),
};

export const OnIconButton: Story = {
  name: 'Example: icon button',
  args: {
    content: 'Delete page',
    children: <IconButton aria-label="Delete page" variant="ghost" icon={<TrashIcon />} />,
  },
};

export const LongContent: Story = {
  name: 'Edge case: long content',
  args: {
    defaultOpen: true,
    content:
      'Drafts are kept for 30 days. After that they are moved to the archive, where only administrators can restore them.',
  },
};

export const InModal: Story = {
  name: 'Example: inside a Modal',
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Publish page"
          footer={
            <Tooltip {...args} content="Visible to everyone immediately">
              <Button onClick={() => setOpen(false)}>Publish</Button>
            </Tooltip>
          }
        >
          Hover or focus the Publish button: the tooltip renders above the modal.
        </Modal>
      </>
    );
  },
};
