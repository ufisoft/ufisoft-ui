import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '.';
import { Button } from '../button';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';
import { Input } from '../input';
import { Stack } from '../stack';

const countries = (
  <>
    <option value="">Choose a country</option>
    <option value="tr">Türkiye</option>
    <option value="de">Germany</option>
    <option value="nl">Netherlands</option>
  </>
);

const meta = {
  title: 'Forms/Select',
  component: Select,
  args: { 'aria-label': 'Country', defaultValue: '', children: countries },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: 'tr' },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="sm">
      <Select {...args} size="sm" />
      <Select {...args} size="md" />
      <Select {...args} size="lg" />
    </Stack>
  ),
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'de' },
};

export const Groups: Story = {
  args: {
    'aria-label': 'Time zone',
    defaultValue: 'Europe/Istanbul',
    children: (
      <>
        <optgroup label="Europe">
          <option value="Europe/Istanbul">Istanbul</option>
          <option value="Europe/Berlin">Berlin</option>
        </optgroup>
        <optgroup label="America">
          <option value="America/New_York">New York</option>
          <option value="America/Chicago" disabled>
            Chicago (unavailable)
          </option>
        </optgroup>
      </>
    ),
  },
};

export const LongOption: Story = {
  name: 'Edge case: long option text',
  args: {
    defaultValue: 'long',
    children: (
      <option value="long">
        A very long option label that does not fit the field and is cut off with an ellipsis
      </option>
    ),
  },
};

export const InFormField: Story = {
  name: 'Example: in a FormField',
  args: { 'aria-label': undefined },
  render: (args) => (
    <FormField invalid required>
      <FormLabel>Country</FormLabel>
      <Select {...args} />
      <FormDescription>Used for tax calculation.</FormDescription>
      <FormMessage>Choose a country.</FormMessage>
    </FormField>
  ),
};

export const AlignedWithInput: Story = {
  name: 'Example: aligned with Input and Button',
  args: { 'aria-label': 'Search in' },
  render: (args) => (
    <Stack direction="horizontal" gap="xs">
      <Select {...args}>
        <option value="">All</option>
        <option value="pages">Pages</option>
        <option value="media">Media</option>
      </Select>
      <Input aria-label="Search" placeholder="Search…" />
      <Button>Search</Button>
    </Stack>
  ),
};
