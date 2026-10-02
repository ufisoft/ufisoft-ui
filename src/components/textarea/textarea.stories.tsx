import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from '.';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';
import { Stack } from '../stack';

const meta = {
  title: 'Forms/Textarea',
  component: Textarea,
  args: { 'aria-label': 'Notes', placeholder: 'Add a note…' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    rows: { control: { type: 'number', min: 1 } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="sm">
      <Textarea {...args} size="sm" />
      <Textarea {...args} size="md" />
      <Textarea {...args} size="lg" />
    </Stack>
  ),
};

export const Rows: Story = {
  args: { rows: 6 },
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'Too short' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Editing is locked for now.' },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'Delivered to the front desk at 14:05.' },
};

export const LongContent: Story = {
  name: 'Edge case: long content',
  args: {
    defaultValue: Array.from(
      { length: 12 },
      (_, i) => `Line ${i + 1}: the field scrolls once content exceeds its rows.`,
    ).join('\n'),
  },
};

export const InFormField: Story = {
  name: 'Example: in a FormField',
  args: { 'aria-label': undefined, maxLength: 500 },
  render: (args) => (
    <FormField invalid required>
      <FormLabel>Comment</FormLabel>
      <Textarea {...args} />
      <FormDescription>Visible to the whole team. Up to 500 characters.</FormDescription>
      <FormMessage>Comment is required.</FormMessage>
    </FormField>
  ),
};
