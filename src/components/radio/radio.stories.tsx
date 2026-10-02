import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Radio, RadioGroup } from '.';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';
import { Text } from '../text';

const meta = {
  title: 'Forms/Radio',
  component: RadioGroup,
  subcomponents: { Radio },
  args: {
    'aria-label': 'Plan',
    defaultValue: 'free',
    onValueChange: fn(),
    children: (
      <>
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="team">Team</Radio>
      </>
    ),
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    children: { control: false },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
};

export const States: Story = {
  render: () => (
    <RadioGroup aria-label="States" defaultValue="checked">
      <Radio value="unchecked">Unchecked</Radio>
      <Radio value="checked">Checked</Radio>
      <Radio value="disabled" disabled>
        Disabled
      </Radio>
    </RadioGroup>
  ),
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: undefined },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Controlled: Story = {
  name: 'Example: controlled',
  render: function Render(args) {
    const [plan, setPlan] = useState('pro');
    return (
      <>
        <RadioGroup {...args} value={plan} onValueChange={setPlan} />
        <Text tone="muted">Selected: {plan}</Text>
      </>
    );
  },
};

export const InFormField: Story = {
  name: 'Example: in a FormField',
  args: { 'aria-label': undefined, defaultValue: undefined },
  render: (args) => (
    <FormField invalid required>
      <FormLabel>Plan</FormLabel>
      <RadioGroup {...args} />
      <FormDescription>You can change your plan at any time.</FormDescription>
      <FormMessage>Choose a plan.</FormMessage>
    </FormField>
  ),
};

export const LongLabel: Story = {
  name: 'Edge case: multi-line label',
  args: {
    children: (
      <>
        <Radio value="free">Free</Radio>
        <Radio value="team">
          Team — shared workspaces, role-based permissions, audit log and priority support for up to
          fifty members
        </Radio>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
