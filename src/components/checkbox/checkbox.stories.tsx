import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Checkbox } from '.';
import { Stack } from '../stack';

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: { children: 'Remember me', onChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <Stack gap="sm">
      <Checkbox>Unchecked</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox invalid>Invalid</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox disabled defaultChecked>
        Disabled and checked
      </Checkbox>
    </Stack>
  ),
};

export const SelectAll: Story = {
  name: 'Example: select all (indeterminate)',
  render: function Render() {
    const items = ['Read', 'Write', 'Delete'];
    const [selected, setSelected] = useState<string[]>(['Read']);
    const all = selected.length === items.length;
    const some = selected.length > 0 && !all;
    return (
      <Stack gap="xs">
        <Checkbox checked={all} indeterminate={some} onChange={() => setSelected(all ? [] : items)}>
          All permissions
        </Checkbox>
        <Stack gap="xs" style={{ paddingInlineStart: 'var(--ufi-space-lg)' }}>
          {items.map((item) => (
            <Checkbox
              key={item}
              checked={selected.includes(item)}
              onChange={(e) =>
                setSelected((prev) =>
                  e.target.checked ? [...prev, item] : prev.filter((i) => i !== item),
                )
              }
            >
              {item}
            </Checkbox>
          ))}
        </Stack>
      </Stack>
    );
  },
};

export const LongLabel: Story = {
  name: 'Edge case: multi-line label',
  args: {
    children:
      'I agree to the terms of service and the privacy policy, and I confirm that I am authorised to accept them on behalf of my organisation.',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
