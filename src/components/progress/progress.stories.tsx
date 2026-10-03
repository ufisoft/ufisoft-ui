import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Progress } from '.';
import { Button } from '../button';
import { Label } from '../label';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Feedback/Progress',
  component: Progress,
  args: { 'aria-label': 'Upload', value: 40 },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['default', 'success', 'danger'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="md">
      <Progress {...args} size="sm" />
      <Progress {...args} size="md" />
      <Progress {...args} size="lg" />
    </Stack>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <Stack gap="md">
      <Progress {...args} tone="default" aria-label="Upload" />
      <Progress {...args} tone="success" value={100} aria-label="Upload complete" />
      <Progress {...args} tone="danger" value={65} aria-label="Upload failed" />
    </Stack>
  ),
};

export const Indeterminate: Story = {
  args: { value: undefined, 'aria-label': 'Preparing files' },
};

export const WithLabel: Story = {
  name: 'Example: with a label and value',
  args: { 'aria-label': undefined, id: 'storage' },
  render: (args) => (
    <Stack gap="2xs">
      <Stack direction="horizontal" justify="between">
        <Label htmlFor="storage">Storage</Label>
        <Text size="sm" tone="muted">
          7.2 GB of 10 GB
        </Text>
      </Stack>
      <Progress {...args} value={72} />
    </Stack>
  ),
};

export const Upload: Story = {
  name: 'Example: running task',
  render: function Render(args) {
    const [value, setValue] = useState(0);
    useEffect(() => {
      if (value >= 100) return;
      const timer = setTimeout(() => setValue((v) => Math.min(100, v + 10)), 300);
      return () => clearTimeout(timer);
    }, [value]);
    return (
      <Stack gap="sm">
        <Progress
          {...args}
          value={value}
          tone={value === 100 ? 'success' : 'default'}
          aria-label="Uploading report.pdf"
        />
        <Text size="sm" tone="muted" aria-live="polite">
          {value === 100 ? 'Upload complete' : `${value}%`}
        </Text>
        <Button variant="secondary" onClick={() => setValue(0)}>
          Restart
        </Button>
      </Stack>
    );
  },
};
