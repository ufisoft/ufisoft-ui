import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Modal, type ModalProps } from '.';
import { Button } from '../button';
import { FormField, FormLabel } from '../form-field';
import { Input } from '../input';
import { Stack } from '../stack';
import { Text } from '../text';

/** Stories own the open state, as a consumer would. */
function Demo({
  trigger = 'Open modal',
  ...args
}: Omit<ModalProps, 'open'> & { trigger?: string }) {
  const [open, setOpen] = useState(false);
  const change = (next: boolean) => {
    args.onOpenChange(next);
    setOpen(next);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>{trigger}</Button>
      <Modal {...args} open={open} onOpenChange={change} />
    </>
  );
}

const meta = {
  title: 'Overlay/Modal',
  component: Modal,
  args: {
    open: false,
    onOpenChange: fn(),
    title: 'Invite teammates',
    description: 'They will get an email with a link to join.',
    children: <Text>Modal body content.</Text>,
  },
  argTypes: {
    open: { control: false },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => <Demo {...args} />,
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Confirmation: Story = {
  name: 'Example: confirmation',
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete project
        </Button>
        <Modal
          {...args}
          size="sm"
          open={open}
          onOpenChange={setOpen}
          title="Delete project?"
          description="This permanently deletes the project and its data. This cannot be undone."
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setOpen(false)}>
                Delete
              </Button>
            </>
          }
        >
          {null}
        </Modal>
      </>
    );
  },
};

export const WithForm: Story = {
  name: 'Example: form',
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Rename</Button>
        <Modal
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="Rename workspace"
          description={undefined}
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="rename-form">
                Save
              </Button>
            </>
          }
        >
          <form
            id="rename-form"
            onSubmit={(event) => {
              event.preventDefault();
              setOpen(false);
            }}
          >
            <FormField required>
              <FormLabel>Workspace name</FormLabel>
              <Input name="name" defaultValue="UfiSoft" />
            </FormField>
          </form>
        </Modal>
      </>
    );
  },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap="sm">
      <Demo {...args} size="sm" trigger="Small" />
      <Demo {...args} size="md" trigger="Medium" />
      <Demo {...args} size="lg" trigger="Large" />
    </Stack>
  ),
};

export const LongContent: Story = {
  name: 'Edge case: scrolling content',
  args: {
    children: (
      <Stack gap="sm">
        {Array.from({ length: 30 }, (_, i) => (
          <Text key={i}>Paragraph {i + 1}: the body scrolls while header and footer stay put.</Text>
        ))}
      </Stack>
    ),
    footer: <Button>Done</Button>,
  },
};
