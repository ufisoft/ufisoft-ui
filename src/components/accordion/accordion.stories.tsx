import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Accordion, AccordionItem } from '.';
import { Button } from '../button';
import { Stack } from '../stack';
import { Switch } from '../switch';
import { Text } from '../text';

const faq = (
  <>
    <AccordionItem title="How long does shipping take?" defaultOpen>
      <Text>Orders ship within 2 business days and arrive in 3–5 days.</Text>
    </AccordionItem>
    <AccordionItem title="Can I return an item?">
      <Text>Yes, free of charge within 30 days of delivery.</Text>
    </AccordionItem>
    <AccordionItem title="Do you ship abroad?">
      <Text>We ship to the EU, the UK and Türkiye.</Text>
    </AccordionItem>
  </>
);

const meta = {
  title: 'Navigation/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem },
  args: { children: faq },
  argTypes: {
    type: { control: 'inline-radio', options: ['single', 'multiple'] },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Single: Story = {
  name: 'Single (one open at a time)',
  args: { type: 'single' },
};

export const LongContent: Story = {
  name: 'Edge case: long title and content',
  args: {
    children: (
      <AccordionItem
        defaultOpen
        title="What happens to drafts, scheduled posts and media when a workspace member leaves the organisation?"
      >
        <Stack gap="sm">
          <Text>
            Drafts and scheduled posts are transferred to the workspace owner. Media uploaded by the
            member stays in the library and keeps its usage history.
          </Text>
          <Text>
            In supporting browsers, find-in-page (Ctrl+F) also opens a collapsed item that matches.
          </Text>
        </Stack>
      </AccordionItem>
    ),
  },
};

export const Settings: Story = {
  name: 'Example: settings sections',
  args: {
    children: (
      <>
        <AccordionItem title="Notifications" defaultOpen>
          <Stack gap="sm">
            <Switch defaultChecked>Email notifications</Switch>
            <Switch>Push notifications</Switch>
          </Stack>
        </AccordionItem>
        <AccordionItem title="Privacy">
          <Switch>Show my profile to other members</Switch>
        </AccordionItem>
      </>
    ),
  },
};

export const Controlled: Story = {
  name: 'Example: controlled',
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <Stack gap="md">
        <Accordion {...args}>
          <AccordionItem title="Advanced options" open={open} onOpenChange={setOpen}>
            <Text>Cache settings, webhooks and API access.</Text>
          </AccordionItem>
        </Accordion>
        <Stack direction="horizontal" gap="xs" align="center">
          <Button variant="secondary" onClick={() => setOpen((o) => !o)}>
            {open ? 'Collapse' : 'Expand'} from outside
          </Button>
          <Text tone="muted">Open: {String(open)}</Text>
        </Stack>
      </Stack>
    );
  },
};
