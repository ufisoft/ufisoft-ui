import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Combobox } from '.';
import { Button } from '../button';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';
import { Modal } from '../modal';
import { Stack } from '../stack';
import { Text } from '../text';

const cities = [
  'Adana',
  'Ankara',
  'Antalya',
  'Bursa',
  'Çanakkale',
  'Denizli',
  'Diyarbakır',
  'Edirne',
  'Erzurum',
  'Eskişehir',
  'Gaziantep',
  'İstanbul',
  'İzmir',
  'Kayseri',
  'Kırklareli',
  'Konya',
  'Malatya',
  'Mersin',
  'Muğla',
  'Samsun',
  'Şanlıurfa',
  'Trabzon',
  'Van',
].map((label) => ({ value: label.toLocaleLowerCase('tr'), label }));

const meta = {
  title: 'Forms/Combobox',
  component: Combobox,
  args: {
    'aria-label': 'City',
    items: cities,
    placeholder: 'Search a city…',
    onValueChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    items: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, minHeight: '22rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: 'izmir' },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="sm">
      <Combobox {...args} size="sm" />
      <Combobox {...args} size="md" />
      <Combobox {...args} size="lg" />
    </Stack>
  ),
};

export const DisabledOptions: Story = {
  args: {
    items: cities.map((city) => ({ ...city, disabled: ['ankara', 'bursa'].includes(city.value) })),
  },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'ankara' },
};

export const InFormField: Story = {
  name: 'Example: in a FormField',
  args: { 'aria-label': undefined },
  render: (args) => (
    <FormField invalid required>
      <FormLabel>Event city</FormLabel>
      <Combobox {...args} />
      <FormDescription>Type to search 23 cities.</FormDescription>
      <FormMessage>Choose a city.</FormMessage>
    </FormField>
  ),
};

export const Controlled: Story = {
  name: 'Example: controlled',
  render: function Render(args) {
    const [city, setCity] = useState<string | null>('konya');
    return (
      <Stack gap="sm">
        <Combobox {...args} value={city} onValueChange={setCity} />
        <Text tone="muted">Selected: {city ?? 'none'}</Text>
        <Button variant="secondary" onClick={() => setCity(null)}>
          Clear
        </Button>
      </Stack>
    );
  },
};

export const Translated: Story = {
  name: 'Example: translated messages',
  args: {
    placeholder: 'Şehir ara…',
    emptyMessage: 'Sonuç yok',
    getResultsMessage: (count) => `${count} sonuç var`,
  },
};

export const InModal: Story = {
  name: 'Example: inside a Modal',
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal open={open} onOpenChange={setOpen} title="Event location">
          <Combobox {...args} />
        </Modal>
      </>
    );
  },
};
