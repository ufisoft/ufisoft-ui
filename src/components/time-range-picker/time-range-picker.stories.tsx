import type { Meta, StoryObj } from '@storybook/react-vite';
import { tr } from 'date-fns/locale/tr';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { TimeRangePicker, type TimeRange } from '.';
import { Button } from '../button';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';
import { Modal } from '../modal';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Forms/TimeRangePicker',
  component: TimeRangePicker,
  args: {
    'aria-label': 'Opening hours',
    onValueChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    locale: { control: false },
    value: { control: false },
    defaultValue: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, minHeight: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimeRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: { from: '09:00', to: '17:30' } },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="sm">
      <TimeRangePicker {...args} size="sm" />
      <TimeRangePicker {...args} size="md" />
      <TimeRangePicker {...args} size="lg" />
    </Stack>
  ),
};

export const BusinessHours: Story = {
  name: 'Min, max and step',
  args: { min: '08:00', max: '20:00', step: 15, defaultValue: { from: '09:00', to: null } },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: { from: '09:00', to: '17:30' } },
};

export const InFormField: Story = {
  name: 'Example: in a FormField',
  args: { 'aria-label': undefined },
  render: (args) => (
    <FormField invalid required>
      <FormLabel>Opening hours</FormLabel>
      <TimeRangePicker {...args} />
      <FormDescription>Opening and closing time, local time.</FormDescription>
      <FormMessage>Choose the opening hours.</FormMessage>
    </FormField>
  ),
};

export const Turkish: Story = {
  name: 'Example: Turkish locale (24-hour)',
  args: {
    'aria-label': 'Çalışma saatleri',
    locale: tr,
    startLabel: 'Açılış saati',
    endLabel: 'Kapanış saati',
    defaultValue: { from: '09:00', to: '18:00' },
  },
};

export const Controlled: Story = {
  name: 'Example: controlled',
  render: function Render(args) {
    const [range, setRange] = useState<TimeRange>({ from: '09:00', to: '17:30' });
    return (
      <Stack gap="sm">
        <TimeRangePicker {...args} value={range} onValueChange={setRange} />
        <Text tone="muted">
          From {range.from ?? '—'} to {range.to ?? '—'}
        </Text>
        <Button variant="secondary" onClick={() => setRange({ from: null, to: null })}>
          Clear
        </Button>
      </Stack>
    );
  },
};

export const InModal: Story = {
  name: 'Example: inside a Modal',
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal open={open} onOpenChange={setOpen} title="Opening hours">
          <TimeRangePicker {...args} />
        </Modal>
      </>
    );
  },
};
