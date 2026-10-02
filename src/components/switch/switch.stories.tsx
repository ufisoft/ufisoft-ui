import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Switch } from '.';
import { FormDescription, FormField } from '../form-field';
import { Stack } from '../stack';
import { Text } from '../text';

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  args: { children: 'Email notifications', onChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <Stack gap="sm">
      <Switch>Off</Switch>
      <Switch defaultChecked>On</Switch>
      <Switch disabled>Disabled</Switch>
      <Switch disabled defaultChecked>
        Disabled and on
      </Switch>
    </Stack>
  ),
};

export const Controlled: Story = {
  name: 'Example: controlled',
  render: function Render() {
    const [on, setOn] = useState(true);
    return (
      <Stack gap="xs">
        <Switch checked={on} onChange={(e) => setOn(e.target.checked)}>
          Autosave
        </Switch>
        <Text tone="muted">Autosave is {on ? 'on' : 'off'}.</Text>
      </Stack>
    );
  },
};

export const SettingsList: Story = {
  name: 'Example: settings list',
  render: () => (
    <Stack gap="md">
      <FormField>
        <Switch defaultChecked>Email notifications</Switch>
        <FormDescription>A summary of activity once a day.</FormDescription>
      </FormField>
      <FormField>
        <Switch>Push notifications</Switch>
        <FormDescription>Mentions and replies, as they happen.</FormDescription>
      </FormField>
    </Stack>
  ),
};

export const LongLabel: Story = {
  name: 'Edge case: multi-line label',
  args: {
    children:
      'Share anonymous usage data to help us improve the editor, including which features you use and how long pages take to load.',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
