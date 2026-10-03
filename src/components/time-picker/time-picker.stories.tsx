import type { Meta, StoryObj } from '@storybook/react-vite';
import { tr } from 'date-fns/locale/tr';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { TimePicker } from '.';
import { Button } from '../button';
import { DatePicker } from '../date-picker';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';
import { Modal } from '../modal';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Forms/TimePicker',
  component: TimePicker,
  args: {
    'aria-label': 'Start time',
    onValueChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    locale: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, minHeight: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: '14:30' },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="sm">
      <TimePicker {...args} size="sm" />
      <TimePicker {...args} size="md" />
      <TimePicker {...args} size="lg" />
    </Stack>
  ),
};

export const BusinessHours: Story = {
  name: 'Min, max and step',
  args: { min: '09:00', max: '18:00', step: 15, defaultValue: '09:00' },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: '14:30' },
};

export const InFormField: Story = {
  name: 'Example: in a FormField',
  args: { 'aria-label': undefined },
  render: (args) => (
    <FormField invalid required>
      <FormLabel>Start time</FormLabel>
      <TimePicker {...args} />
      <FormDescription>Type any time or pick one from the list.</FormDescription>
      <FormMessage>Choose a start time.</FormMessage>
    </FormField>
  ),
};

export const Turkish: Story = {
  name: 'Example: Turkish locale (24-hour)',
  args: { 'aria-label': 'Başlangıç saati', locale: tr, defaultValue: '14:30' },
};

export const WithDatePicker: Story = {
  name: 'Example: date and time',
  args: { 'aria-label': undefined },
  render: function Render(args) {
    const [date, setDate] = useState<Date | null>(new Date(2026, 9, 15));
    const [time, setTime] = useState<string | null>('09:30');
    return (
      <Stack gap="sm">
        <FormField>
          <FormLabel>Meeting date</FormLabel>
          <DatePicker value={date} onValueChange={setDate} />
        </FormField>
        <FormField>
          <FormLabel>Meeting time</FormLabel>
          <TimePicker {...args} value={time} onValueChange={setTime} />
        </FormField>
        <Text tone="muted">
          {date?.toDateString() ?? 'No date'} at {time ?? 'no time'}
        </Text>
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
        <Modal open={open} onOpenChange={setOpen} title="Reminder">
          <TimePicker {...args} />
        </Modal>
      </>
    );
  },
};
