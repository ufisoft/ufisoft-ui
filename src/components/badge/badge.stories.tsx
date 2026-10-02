import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '.';
import { Button } from '../button';
import { Card } from '../card';
import { Heading } from '../heading';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Feedback/Badge',
  component: Badge,
  args: { children: 'Draft' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap="xs" wrap>
      <Badge {...args} tone="neutral">
        Draft
      </Badge>
      <Badge {...args} tone="info">
        Scheduled
      </Badge>
      <Badge {...args} tone="success">
        Published
      </Badge>
      <Badge {...args} tone="warning">
        Needs review
      </Badge>
      <Badge {...args} tone="danger">
        Failed
      </Badge>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="horizontal" gap="xs" align="center">
      <Badge {...args} size="sm">
        Small
      </Badge>
      <Badge {...args} size="md">
        Medium
      </Badge>
    </Stack>
  ),
};

export const InContext: Story = {
  name: 'Example: next to a heading',
  render: () => (
    <Card>
      <Stack gap="xs">
        <Stack direction="horizontal" gap="xs" align="center">
          <Heading level={3} size="md">
            Pricing page
          </Heading>
          <Badge tone="warning">Needs review</Badge>
        </Stack>
        <Text tone="muted">Edited by Ada 2 hours ago.</Text>
      </Stack>
    </Card>
  ),
};

export const DescribingAControl: Story = {
  name: 'Example: count on a button',
  render: () => (
    <Stack direction="horizontal" gap="xs" align="center">
      <Button variant="secondary" aria-describedby="inbox-count">
        Inbox
      </Button>
      <Badge id="inbox-count" tone="info">
        3 unread
      </Badge>
    </Stack>
  ),
};

export const LongText: Story = {
  name: 'Edge case: text longer than the space',
  args: { children: 'Waiting for approval from the legal department' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 160 }}>
        <Story />
      </div>
    ),
  ],
};
