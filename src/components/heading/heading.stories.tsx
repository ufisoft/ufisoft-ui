import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from '.';
import { Stack } from '../stack';

const meta = {
  title: 'Foundations/Heading',
  component: Heading,
  args: { children: 'Account settings' },
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Levels: Story = {
  render: () => (
    <Stack gap="sm">
      <Heading level={1}>Heading level 1</Heading>
      <Heading level={2}>Heading level 2</Heading>
      <Heading level={3}>Heading level 3</Heading>
      <Heading level={4}>Heading level 4</Heading>
      <Heading level={5}>Heading level 5</Heading>
      <Heading level={6}>Heading level 6</Heading>
    </Stack>
  ),
};

export const LevelIndependentOfSize: Story = {
  name: 'Accessibility: level ≠ size',
  render: () => (
    <Stack gap="sm">
      <Heading level={2} size="sm">
        An h2 that looks small (e.g. inside a sidebar card)
      </Heading>
      <Heading level={3} size="2xl">
        An h3 that looks large
      </Heading>
    </Stack>
  ),
};
