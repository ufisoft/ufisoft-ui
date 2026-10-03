import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Col, Container, Row } from '.';
import { Card } from '../card';
import { Heading } from '../heading';
import { Stack } from '../stack';
import { Text } from '../text';

function Box({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: 'var(--ufi-space-sm)',
        background: 'var(--ufi-color-info-bg)',
        border: '1px dashed var(--ufi-color-info-border)',
        borderRadius: 'var(--ufi-radius-sm)',
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: 'Foundations/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  // Full width shows the container sizes; block padding keeps content off the frame's edge.
  decorators: [
    (Story) => (
      <div style={{ paddingBlock: 'var(--ufi-space-lg)' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    children: <Box>Content, centred at the container width</Box>,
  },
  argTypes: {
    children: { control: false },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    as: { control: 'select', options: ['div', 'main', 'section', 'article', 'header', 'footer'] },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="sm">
      {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
        <Container {...args} key={size} size={size}>
          <Box>size=&quot;{size}&quot;</Box>
        </Container>
      ))}
    </Stack>
  ),
};

export const Columns: Story = {
  name: 'Row and Col: spans',
  render: (args) => (
    <Container {...args}>
      <Stack gap="md">
        <Row>
          <Col span={12}>
            <Box>12</Box>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <Box>6</Box>
          </Col>
          <Col span={6}>
            <Box>6</Box>
          </Col>
        </Row>
        <Row>
          {[1, 2, 3].map((n) => (
            <Col key={n} span={4}>
              <Box>4</Box>
            </Col>
          ))}
        </Row>
        <Row>
          <Col span={3}>
            <Box>3</Box>
          </Col>
          <Col span={9}>
            <Box>9</Box>
          </Col>
        </Row>
      </Stack>
    </Container>
  ),
};

export const Responsive: Story = {
  name: 'Row and Col: responsive',
  render: (args) => (
    <Container {...args}>
      <Row>
        {[1, 2, 3, 4].map((n) => (
          <Col key={n} span={{ base: 12, sm: 6, lg: 3 }}>
            <Box>Item {n}: full width, half from sm, a quarter from lg</Box>
          </Col>
        ))}
      </Row>
    </Container>
  ),
};

export const Start: Story = {
  name: 'Row and Col: start',
  render: (args) => (
    <Container {...args}>
      <Stack gap="md">
        <Row>
          <Col span={6} start={4}>
            <Box>span 6, start 4 (centred)</Box>
          </Col>
        </Row>
        <Row>
          <Col span={4}>
            <Box>span 4</Box>
          </Col>
          <Col span={4} start={9}>
            <Box>span 4, start 9</Box>
          </Col>
        </Row>
      </Stack>
    </Container>
  ),
};

export const Gaps: Story = {
  name: 'Row: gap and align',
  render: (args) => (
    <Container {...args}>
      <Stack gap="lg">
        {(['none', 'sm', 'xl'] as const).map((gap) => (
          <Row key={gap} gap={gap}>
            <Col span={4}>
              <Box>gap=&quot;{gap}&quot;</Box>
            </Col>
            <Col span={4}>
              <Box>gap=&quot;{gap}&quot;</Box>
            </Col>
            <Col span={4}>
              <Box>gap=&quot;{gap}&quot;</Box>
            </Col>
          </Row>
        ))}
        <Row align="center">
          <Col span={6}>
            <Box>
              align=&quot;center&quot;
              <br />
              with a taller column
              <br />
              next to it
            </Box>
          </Col>
          <Col span={6}>
            <Box>Centred</Box>
          </Col>
        </Row>
      </Stack>
    </Container>
  ),
};

export const Dashboard: Story = {
  name: 'Example: page layout',
  args: { as: 'main' },
  render: (args) => (
    <Container {...args}>
      <Stack gap="lg">
        <Heading level={1}>Overview</Heading>
        <Row as="ul" gap="md">
          {['Visitors', 'Orders', 'Revenue', 'Returns'].map((label) => (
            <Col as="li" key={label} span={{ base: 12, sm: 6, lg: 3 }}>
              <Card>
                <Text tone="muted">{label}</Text>
              </Card>
            </Col>
          ))}
        </Row>
        <Row gap="lg">
          <Col span={{ base: 12, lg: 8 }}>
            <Card>
              <Text>Main content</Text>
            </Card>
          </Col>
          <Col as="aside" aria-label="Sidebar" span={{ base: 12, lg: 4 }}>
            <Card>
              <Text>Sidebar</Text>
            </Card>
          </Col>
        </Row>
      </Stack>
    </Container>
  ),
};
