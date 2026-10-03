import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Skeleton } from '.';
import { Avatar } from '../avatar';
import { Button } from '../button';
import { Card } from '../card';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  argTypes: {
    shape: { control: 'inline-radio', options: ['text', 'rect', 'circle'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    lines: { control: { type: 'number', min: 1, max: 10 } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { lines: 3 },
};

export const Shapes: Story = {
  render: () => (
    <Stack gap="md">
      <Skeleton shape="text" lines={2} />
      <Skeleton shape="rect" size="lg" />
      <Stack direction="horizontal" gap="sm" align="center">
        <Skeleton shape="circle" size="sm" />
        <Skeleton shape="circle" size="md" />
        <Skeleton shape="circle" size="lg" />
      </Stack>
    </Stack>
  ),
};

export const CustomSize: Story = {
  name: 'Custom size via className',
  render: () => (
    <>
      <style>{'.media { block-size: 12rem; }'}</style>
      <Skeleton shape="rect" className="media" />
    </>
  ),
};

export const LoadingCard: Story = {
  name: 'Example: loading a card',
  render: function Render() {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      if (!loading) return;
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }, [loading]);
    return (
      <Stack gap="sm">
        <Card role="region" aria-busy={loading} aria-label="Author">
          <Stack direction="horizontal" gap="sm" align="center">
            {loading ? (
              <>
                <Skeleton shape="circle" />
                <Skeleton lines={2} style={{ flex: 1 }} />
              </>
            ) : (
              <>
                <Avatar name="Ada Lovelace" />
                <Stack gap="none">
                  <Text weight="semibold">Ada Lovelace</Text>
                  <Text tone="muted">Mathematician</Text>
                </Stack>
              </>
            )}
          </Stack>
        </Card>
        <Button variant="secondary" onClick={() => setLoading(true)}>
          Reload
        </Button>
      </Stack>
    );
  },
};
