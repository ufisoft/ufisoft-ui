import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Tabs, TabsList, TabsPanel, TabsTrigger } from '.';
import { Button } from '../button';
import { FormField, FormLabel } from '../form-field';
import { Input } from '../input';
import { Stack } from '../stack';
import { Switch } from '../switch';
import { Text } from '../text';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  subcomponents: { TabsList, TabsTrigger, TabsPanel },
  args: { defaultValue: 'general', onValueChange: fn() },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Settings">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
      </TabsList>
      <TabsPanel value="general">
        <FormField>
          <FormLabel>Site name</FormLabel>
          <Input defaultValue="UfiSoft" />
        </FormField>
      </TabsPanel>
      <TabsPanel value="notifications">
        <Switch defaultChecked>Email notifications</Switch>
      </TabsPanel>
      <TabsPanel value="members">
        <Text>Ada, Grace and Linus have access to this site.</Text>
      </TabsPanel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
};

export const DisabledTab: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Page">
        <TabsTrigger value="general">Content</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="history" disabled>
          History (no versions yet)
        </TabsTrigger>
      </TabsList>
      <TabsPanel value="general">
        <Text>Page content.</Text>
      </TabsPanel>
      <TabsPanel value="seo">
        <Text>Search engine settings.</Text>
      </TabsPanel>
      <TabsPanel value="history">
        <Text>Version history.</Text>
      </TabsPanel>
    </Tabs>
  ),
};

export const ManyTabs: Story = {
  name: 'Edge case: more tabs than fit',
  args: { defaultValue: 'tab-1' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Months">
        {['January', 'February', 'March', 'April', 'May', 'June', 'July'].map((month, i) => (
          <TabsTrigger key={month} value={`tab-${i + 1}`}>
            {month}
          </TabsTrigger>
        ))}
      </TabsList>
      {['January', 'February', 'March', 'April', 'May', 'June', 'July'].map((month, i) => (
        <TabsPanel key={month} value={`tab-${i + 1}`}>
          <Text>Report for {month}. The tab list scrolls horizontally.</Text>
        </TabsPanel>
      ))}
    </Tabs>
  ),
};

export const Controlled: Story = {
  name: 'Example: controlled',
  render: function Render(args) {
    const [value, setValue] = useState('general');
    return (
      <Stack gap="md">
        <Tabs {...args} value={value} onValueChange={setValue}>
          <TabsList aria-label="Settings">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          <TabsPanel value="general">
            <Text>General settings.</Text>
          </TabsPanel>
          <TabsPanel value="members">
            <Text>Member list.</Text>
          </TabsPanel>
        </Tabs>
        <Stack direction="horizontal" gap="xs" align="center">
          <Button variant="secondary" onClick={() => setValue('members')}>
            Go to members
          </Button>
          <Text tone="muted">Selected: {value}</Text>
        </Stack>
      </Stack>
    );
  },
};
