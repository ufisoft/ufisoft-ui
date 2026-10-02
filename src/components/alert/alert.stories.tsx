import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from '.';
import { Button } from '../button';
import { Stack } from '../stack';

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  args: {
    title: 'Your trial ends in 3 days',
    children: 'Add a payment method to keep access to all features.',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <Stack gap="sm">
      <Alert tone="info" title="Info">
        A new version is available.
      </Alert>
      <Alert tone="success" title="Success">
        Your changes were saved.
      </Alert>
      <Alert tone="warning" title="Warning">
        Your storage is almost full.
      </Alert>
      <Alert tone="danger" title="Error">
        The payment could not be processed.
      </Alert>
    </Stack>
  ),
};

export const TitleOnly: Story = {
  args: { children: undefined, title: 'Settings saved' },
};

export const WithAction: Story = {
  name: 'Example: with action',
  args: {
    tone: 'warning',
    title: 'Unsaved changes',
    children: (
      <Stack gap="sm" align="start">
        <span>You have changes that are not saved yet.</span>
        <Button size="sm" variant="secondary">
          Save now
        </Button>
      </Stack>
    ),
  },
};

export const StaticContent: Story = {
  name: 'Accessibility: static (no live region)',
  args: { tone: 'warning', role: undefined, title: 'Scheduled maintenance on Sunday' },
};
