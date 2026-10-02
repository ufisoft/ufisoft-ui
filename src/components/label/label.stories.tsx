import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '.';
import { Stack } from '../stack';

const meta = {
  title: 'Foundations/Label',
  component: Label,
  args: { children: 'Email address', htmlFor: 'label-demo' },
  decorators: [
    (Story) => (
      <Stack gap="2xs">
        <Story />
        <input id="label-demo" />
      </Stack>
    ),
  ],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: { required: true },
};
