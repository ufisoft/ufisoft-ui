import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '.';
import { Button } from '../button';
import { Heading } from '../heading';
import { Stack } from '../stack';
import { Text } from '../text';

const content = (
  <Stack gap="sm">
    <Heading level={3} size="md">
      Monthly report
    </Heading>
    <Text tone="muted">Page views grew 12% compared to last month.</Text>
  </Stack>
);

const meta = {
  title: 'Layout/Card',
  component: Card,
  args: { children: content },
  argTypes: {
    variant: { control: 'inline-radio', options: ['outlined', 'elevated'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <Stack gap="md">
      <Card {...args} variant="outlined" />
      <Card {...args} variant="elevated" />
    </Stack>
  ),
};

export const Padding: Story = {
  render: (args) => (
    <Stack gap="md">
      {(['sm', 'md', 'lg'] as const).map((padding) => (
        <Card key={padding} {...args} padding={padding}>
          <Text>padding=&quot;{padding}&quot;</Text>
        </Card>
      ))}
    </Stack>
  ),
};

export const WithActions: Story = {
  name: 'Example: with actions',
  args: {
    children: (
      <Stack gap="md">
        <Stack gap="xs">
          <Heading level={3} size="md">
            Upgrade to Team
          </Heading>
          <Text tone="muted">Shared workspaces, roles and an audit log for up to 50 members.</Text>
        </Stack>
        <Stack direction="horizontal" gap="xs" justify="end">
          <Button variant="ghost">Not now</Button>
          <Button>Upgrade</Button>
        </Stack>
      </Stack>
    ),
  },
};

export const List: Story = {
  name: 'Example: list of articles',
  render: () => (
    <Stack
      as="ul"
      gap="md"
      aria-label="Recent pages"
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {[
        { id: 'pricing', title: 'Pricing' },
        { id: 'about', title: 'About us' },
        { id: 'careers', title: 'Careers' },
      ].map(({ id, title }) => (
        <Card key={id} asChild>
          <li>
            <article aria-labelledby={`card-${id}`}>
              <Stack gap="2xs">
                <Heading id={`card-${id}`} level={3} size="sm">
                  <a href={`#${id}`}>{title}</a>
                </Heading>
                <Text size="sm" tone="muted">
                  Edited 2 days ago
                </Text>
              </Stack>
            </article>
          </li>
        </Card>
      ))}
    </Stack>
  ),
};

export const LongContent: Story = {
  name: 'Edge case: long unbroken text',
  args: {
    children: (
      <Text>
        https://cms.example.com/workspaces/marketing/pages/2026/quarterly-investor-relations-update-final-v3
      </Text>
    ),
  },
};
