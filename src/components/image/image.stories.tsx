import type { Meta, StoryObj } from '@storybook/react-vite';
import { Image } from '.';
import { Card } from '../card';
import { Grid } from '../grid';
import { Stack } from '../stack';
import { Text } from '../text';

/** A landscape picture as an inline SVG, so stories need no network. */
function picture(width: number, height: number, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 70% 75%)"/><stop offset="1" stop-color="hsl(${hue} 60% 92%)"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="${width * 0.75}" cy="${height * 0.3}" r="${height * 0.12}" fill="hsl(45 95% 65%)"/>
    <path d="M0 ${height} L${width * 0.35} ${height * 0.45} L${width * 0.6} ${height * 0.75} L${width * 0.8} ${height * 0.55} L${width} ${height} Z" fill="hsl(${hue + 120} 35% 40%)"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const meta = {
  title: 'Foundations/Image',
  component: Image,
  args: {
    src: picture(800, 500, 200),
    alt: 'Mountains under a blue sky',
    width: 800,
    height: 500,
  },
  argTypes: {
    fit: { control: 'inline-radio', options: ['cover', 'contain'] },
    ratio: { control: 'inline-radio', options: ['auto', '1/1', '4/3', '3/2', '16/9'] },
    radius: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg', 'full'] },
    fallback: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Ratios: Story = {
  render: (args) => (
    <Grid columns={2} gap="sm">
      {(['1/1', '4/3', '3/2', '16/9'] as const).map((ratio) => (
        <Stack key={ratio} gap="2xs">
          <Image {...args} ratio={ratio} radius="md" />
          <Text size="sm" tone="muted">
            ratio=&quot;{ratio}&quot;
          </Text>
        </Stack>
      ))}
    </Grid>
  ),
};

export const Fit: Story = {
  render: (args) => (
    <Grid columns={2} gap="sm">
      {(['cover', 'contain'] as const).map((fit) => (
        <Stack key={fit} gap="2xs">
          <Image
            {...args}
            ratio="1/1"
            fit={fit}
            radius="md"
            style={{ background: 'var(--ufi-color-bg-muted)' }}
          />
          <Text size="sm" tone="muted">
            fit=&quot;{fit}&quot;
          </Text>
        </Stack>
      ))}
    </Grid>
  ),
};

export const Radius: Story = {
  render: (args) => (
    <Grid columns={5} gap="sm">
      {(['none', 'sm', 'md', 'lg', 'full'] as const).map((radius) => (
        <Image {...args} key={radius} ratio="1/1" radius={radius} alt={`radius ${radius}`} />
      ))}
    </Grid>
  ),
};

export const Fallback: Story = {
  name: 'Failed to load',
  args: {
    src: '/does-not-exist.jpg',
    alt: 'Product photo',
    ratio: '4/3',
    radius: 'md',
    fallback: <Text tone="muted">Image unavailable</Text>,
  },
};

export const Decorative: Story = {
  args: { alt: '', ratio: '16/9' },
};

export const CardMedia: Story = {
  name: 'Example: card media',
  render: (args) => (
    <Grid columns={2} gap="md">
      {[200, 20].map((hue) => (
        <Card key={hue} padding="none">
          <Image {...args} src={picture(600, 400, hue)} alt="" ratio="3/2" />
          <Stack gap="2xs" style={{ padding: 'var(--ufi-space-md)' }}>
            <Text weight="semibold">{hue === 200 ? 'Alpine lakes' : 'Desert dunes'}</Text>
            <Text size="sm" tone="muted">
              6 days · from €890
            </Text>
          </Stack>
        </Card>
      ))}
    </Grid>
  ),
};
