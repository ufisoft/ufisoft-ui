import type { Meta, StoryObj } from '@storybook/react-vite';
import { EventPlayground } from '../blocks/event-playground';

const meta = {
  title: 'Architecture/Event Playground',
  component: EventPlayground,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EventPlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
