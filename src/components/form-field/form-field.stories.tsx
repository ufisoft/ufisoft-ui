import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FormDescription, FormField, FormLabel, FormMessage } from '.';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Input } from '../input';
import { Stack } from '../stack';

const meta = {
  title: 'Forms/FormField',
  component: FormField,
  subcomponents: { FormLabel, FormDescription, FormMessage },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <FormField {...args}>
      <FormLabel>Email</FormLabel>
      <Input type="email" placeholder="name@company.com" />
      <FormDescription>We use this address for login and notifications.</FormDescription>
    </FormField>
  ),
};

export const Required: Story = {
  ...Default,
  args: { required: true },
};

export const Invalid: Story = {
  render: (args) => (
    <FormField {...args} invalid>
      <FormLabel>Email</FormLabel>
      <Input type="email" defaultValue="name@" />
      <FormMessage>Enter a complete email address, e.g. name@company.com.</FormMessage>
    </FormField>
  ),
};

export const Disabled: Story = {
  ...Default,
  args: { disabled: true },
};

export const WithCheckbox: Story = {
  name: 'With checkbox',
  render: (args) => (
    <FormField {...args}>
      <Checkbox>Send me product updates</Checkbox>
      <FormDescription>At most one email per month.</FormDescription>
    </FormField>
  ),
};

export const ValidationFlow: Story = {
  name: 'Example: validation on submit',
  render: function Render() {
    const [error, setError] = useState<string | null>(null);
    return (
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get('username');
          setError(
            typeof value === 'string' && value.length >= 3 ? null : 'Use at least 3 characters.',
          );
        }}
      >
        <Stack gap="md" align="start">
          <FormField invalid={error !== null} required>
            <FormLabel>Username</FormLabel>
            <Input name="username" />
            <FormDescription>Visible to your team.</FormDescription>
            {error && <FormMessage>{error}</FormMessage>}
          </FormField>
          <Button type="submit">Save</Button>
        </Stack>
      </form>
    );
  },
};
