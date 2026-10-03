import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { tr } from 'react-day-picker/locale';
import { fn } from 'storybook/test';
import { DateRangePicker, type DateRange } from '.';
import { Button } from '../button';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';
import { Modal } from '../modal';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Forms/DateRangePicker',
  component: DateRangePicker,
  args: {
    'aria-label': 'Stay',
    onValueChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    locale: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    min: { control: 'date' },
    max: { control: 'date' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, minHeight: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: { from: new Date(2026, 9, 12), to: new Date(2026, 9, 16) } },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="sm">
      <DateRangePicker {...args} size="sm" />
      <DateRangePicker {...args} size="md" />
      <DateRangePicker {...args} size="lg" />
    </Stack>
  ),
};

export const MinMax: Story = {
  name: 'Min and max',
  args: {
    defaultValue: { from: new Date(2026, 9, 12), to: null },
    min: new Date(2026, 9, 5),
    max: new Date(2026, 10, 20),
  },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: { from: new Date(2026, 9, 12), to: new Date(2026, 9, 16) },
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: { from: new Date(2026, 9, 12), to: new Date(2026, 9, 16) },
  },
};

export const InFormField: Story = {
  name: 'Example: in a FormField',
  args: { 'aria-label': undefined },
  render: (args) => (
    <FormField invalid required>
      <FormLabel>Stay</FormLabel>
      <DateRangePicker {...args} />
      <FormDescription>Check-in and check-out dates.</FormDescription>
      <FormMessage>Choose your dates.</FormMessage>
    </FormField>
  ),
};

export const Turkish: Story = {
  name: 'Example: Turkish locale',
  args: {
    'aria-label': 'Konaklama',
    locale: tr,
    startLabel: 'Giriş tarihi',
    endLabel: 'Çıkış tarihi',
    calendarLabel: 'Tarihleri seç',
    defaultValue: { from: new Date(2026, 9, 12), to: new Date(2026, 9, 16) },
  },
};

export const Controlled: Story = {
  name: 'Example: controlled',
  render: function Render(args) {
    const [range, setRange] = useState<DateRange>({
      from: new Date(2026, 9, 12),
      to: new Date(2026, 9, 16),
    });
    return (
      <Stack gap="sm">
        <DateRangePicker {...args} value={range} onValueChange={setRange} />
        <Text tone="muted">
          From {range.from?.toDateString() ?? '—'} to {range.to?.toDateString() ?? '—'}
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
        <Modal open={open} onOpenChange={setOpen} title="Book a stay">
          <DateRangePicker {...args} />
        </Modal>
      </>
    );
  },
};
