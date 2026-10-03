import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { tr } from 'react-day-picker/locale';
import { fn } from 'storybook/test';
import { DatePicker } from '.';
import { Button } from '../button';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';
import { Modal } from '../modal';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Forms/DatePicker',
  component: DatePicker,
  args: {
    'aria-label': 'Due date',
    onValueChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    locale: { control: false },
    value: { control: 'date' },
    defaultValue: { control: 'date' },
    min: { control: 'date' },
    max: { control: 'date' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, minHeight: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: new Date(2026, 9, 15) },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="sm">
      <DatePicker {...args} size="sm" />
      <DatePicker {...args} size="md" />
      <DatePicker {...args} size="lg" />
    </Stack>
  ),
};

export const MinMax: Story = {
  name: 'Min and max',
  args: {
    defaultValue: new Date(2026, 9, 15),
    min: new Date(2026, 9, 5),
    max: new Date(2026, 10, 20),
  },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: new Date(2026, 9, 15) },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: new Date(2026, 9, 15) },
};

export const InFormField: Story = {
  name: 'Example: in a FormField',
  args: { 'aria-label': undefined },
  render: (args) => (
    <FormField invalid required>
      <FormLabel>Due date</FormLabel>
      <DatePicker {...args} />
      <FormDescription>Type the date or pick it from the calendar.</FormDescription>
      <FormMessage>Choose a due date.</FormMessage>
    </FormField>
  ),
};

export const Turkish: Story = {
  name: 'Example: Turkish locale',
  args: {
    'aria-label': 'Teslim tarihi',
    locale: tr,
    calendarLabel: 'Tarih seç',
    defaultValue: new Date(2026, 9, 15),
  },
};

export const Controlled: Story = {
  name: 'Example: controlled',
  render: function Render(args) {
    const [date, setDate] = useState<Date | null>(new Date(2026, 9, 15));
    return (
      <Stack gap="sm">
        <DatePicker {...args} value={date} onValueChange={setDate} />
        <Text tone="muted">Selected: {date ? date.toDateString() : 'none'}</Text>
        <Button variant="secondary" onClick={() => setDate(null)}>
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
        <Modal open={open} onOpenChange={setOpen} title="Schedule task">
          <DatePicker {...args} />
        </Modal>
      </>
    );
  },
};
