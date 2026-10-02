import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ToastProvider, useToast, type ToastTone } from '.';
import { Button } from '../button';
import { Modal } from '../modal';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Feedback/Toast',
  component: ToastProvider,
  args: { children: null },
  argTypes: { children: { control: false } },
  decorators: [
    (Story, { args }) => (
      <ToastProvider {...args}>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function Basic() {
  const { toast } = useToast();
  return (
    <Button onClick={() => toast({ title: 'Page saved', description: 'Your changes are live.' })}>
      Save page
    </Button>
  );
}

export const Default: Story = { render: () => <Basic /> };

function Tones() {
  const { toast } = useToast();
  const messages: Record<ToastTone, string> = {
    neutral: 'Draft saved',
    info: 'A new version is available',
    success: 'Page published',
    warning: 'Storage is 90% full',
    danger: 'Upload failed',
  };
  return (
    <Stack direction="horizontal" gap="xs" wrap>
      {(Object.keys(messages) as ToastTone[]).map((tone) => (
        <Button
          key={tone}
          variant="secondary"
          onClick={() => toast({ tone, title: messages[tone] })}
        >
          {tone}
        </Button>
      ))}
    </Stack>
  );
}

export const AllTones: Story = { render: () => <Tones /> };

function WithAction() {
  const { toast } = useToast();
  const [deleted, setDeleted] = useState(false);
  return (
    <Stack gap="sm" align="start">
      <Button
        variant="danger"
        onClick={() => {
          setDeleted(true);
          toast({
            title: 'Page deleted',
            action: {
              label: 'Undo',
              altText: 'Restore the page from the trash',
              onClick: () => setDeleted(false),
            },
            duration: 8000,
          });
        }}
      >
        Delete page
      </Button>
      <Text tone="muted">Page is {deleted ? 'deleted' : 'not deleted'}.</Text>
    </Stack>
  );
}

export const UndoAction: Story = { name: 'Example: undo action', render: () => <WithAction /> };

function LongText() {
  const { toast } = useToast();
  return (
    <Button
      onClick={() =>
        toast({
          tone: 'warning',
          title: 'Some images could not be optimised',
          description:
            'hero-banner-final-final-v3-approved-by-marketing.png and 4 other files are larger than 10 MB. They were uploaded unchanged.',
        })
      }
    >
      Upload images
    </Button>
  );
}

export const LongContent: Story = { name: 'Edge case: long content', render: () => <LongText /> };

function InsideModal() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Share page"
        footer={
          <Button
            onClick={() => {
              // Close first: while a modal is open, everything outside it — toasts too — is inert.
              setOpen(false);
              toast({ tone: 'success', title: 'Link copied' });
            }}
          >
            Copy link
          </Button>
        }
      >
        Copying closes the modal, then confirms with a toast.
      </Modal>
    </>
  );
}

export const FromModal: Story = {
  name: 'Example: after closing a Modal',
  render: () => <InsideModal />,
};

export const Translated: Story = {
  name: 'Example: translated labels',
  args: { label: 'Bildirimler ({hotkey})', toastLabel: 'Bildirim', closeLabel: 'Kapat' },
  render: function Render() {
    const { toast } = useToast();
    return <Button onClick={() => toast({ title: 'Sayfa kaydedildi' })}>Kaydet</Button>;
  },
};
