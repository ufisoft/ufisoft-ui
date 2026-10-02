import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '.';
import { Button } from '../button';

function Box({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: 'var(--ufi-space-sm)',
        background: 'var(--ufi-color-info-bg)',
        border: '1px dashed var(--ufi-color-info-border)',
        borderRadius: 'var(--ufi-radius-sm)',
      }}
    >
      {label}
    </div>
  );
}

const meta = {
  title: 'Foundations/Stack',
  component: Stack,
  args: {
    children: (
      <>
        <Box label="One" />
        <Box label="Two" />
        <Box label="Three" />
      </>
    ),
  },
  argTypes: {
    children: { control: false },
    direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    gap: {
      control: 'select',
      options: ['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: { control: 'inline-radio', options: ['start', 'center', 'end', 'between'] },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  args: { direction: 'horizontal' },
};

export const ToolbarLayout: Story = {
  name: 'Example: toolbar',
  args: {
    direction: 'horizontal',
    justify: 'between',
    align: 'center',
    children: (
      <>
        <strong>3 items selected</strong>
        <Stack direction="horizontal" gap="xs">
          <Button variant="secondary" size="sm">
            Cancel
          </Button>
          <Button size="sm">Apply</Button>
        </Stack>
      </>
    ),
  },
};

export const Wrapping: Story = {
  name: 'Edge case: wrapping',
  args: {
    direction: 'horizontal',
    wrap: true,
    gap: 'xs',
    children: Array.from({ length: 16 }, (_, i) => <Box key={i} label={`Item ${i + 1}`} />),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export const AsList: Story = {
  name: 'Accessibility: as list',
  args: {
    as: 'ul',
    gap: 'xs',
    children: (
      <>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </>
    ),
  },
};
