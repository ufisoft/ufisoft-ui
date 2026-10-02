import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb, BreadcrumbItem } from '.';
import { Heading } from '../heading';
import { Stack } from '../stack';

const meta = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  subcomponents: { BreadcrumbItem },
  args: {
    children: (
      <>
        <BreadcrumbItem href="#home">Home</BreadcrumbItem>
        <BreadcrumbItem href="#pages">Pages</BreadcrumbItem>
        <BreadcrumbItem current>Pricing</BreadcrumbItem>
      </>
    ),
  },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoLevels: Story = {
  args: {
    children: (
      <>
        <BreadcrumbItem href="#settings">Settings</BreadcrumbItem>
        <BreadcrumbItem current>Members</BreadcrumbItem>
      </>
    ),
  },
};

export const DeepAndLong: Story = {
  name: 'Edge case: deep trail in a narrow space',
  args: {
    children: (
      <>
        <BreadcrumbItem href="#home">Home</BreadcrumbItem>
        <BreadcrumbItem href="#workspaces">Workspaces</BreadcrumbItem>
        <BreadcrumbItem href="#marketing">Marketing</BreadcrumbItem>
        <BreadcrumbItem href="#campaigns">Campaigns</BreadcrumbItem>
        <BreadcrumbItem href="#q4">Q4 investor relations and quarterly reporting</BreadcrumbItem>
        <BreadcrumbItem current>Landing page — final copy</BreadcrumbItem>
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

export const RouterLinks: Story = {
  name: 'Example: router links with asChild',
  args: {
    children: (
      <>
        <BreadcrumbItem asChild>
          {/* Stand-in for a router's Link component. */}
          <a href="#media">Media</a>
        </BreadcrumbItem>
        <BreadcrumbItem current>Photos</BreadcrumbItem>
      </>
    ),
  },
};

export const PageHeader: Story = {
  name: 'Example: above a page title',
  render: (args) => (
    <Stack gap="xs">
      <Breadcrumb {...args} />
      <Heading level={1} size="xl">
        Pricing
      </Heading>
    </Stack>
  ),
};
