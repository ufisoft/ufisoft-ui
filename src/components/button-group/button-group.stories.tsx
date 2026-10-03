import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from '.';
import { Button } from '../button';
import { DropdownMenu, DropdownMenuItem } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import { Stack } from '../stack';

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8h10" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: 'Actions/ButtonGroup',
  component: ButtonGroup,
  args: {
    'aria-label': 'Clipboard',
    children: (
      <>
        <Button variant="secondary">Cut</Button>
        <Button variant="secondary">Copy</Button>
        <Button variant="secondary">Paste</Button>
      </>
    ),
  },
  argTypes: {
    children: { control: false },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="sm" align="start">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ButtonGroup {...args} key={size} aria-label={`Clipboard, ${size}`}>
          <Button variant="secondary" size={size}>
            Cut
          </Button>
          <Button variant="secondary" size={size}>
            Copy
          </Button>
          <Button variant="secondary" size={size}>
            Paste
          </Button>
        </ButtonGroup>
      ))}
    </Stack>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    'aria-label': 'Zoom',
    children: (
      <>
        <IconButton variant="secondary" aria-label="Zoom in" icon={<PlusIcon />} />
        <IconButton variant="secondary" aria-label="Zoom out" icon={<MinusIcon />} />
      </>
    ),
  },
};

export const Disabled: Story = {
  name: 'With a disabled button',
  args: {
    'aria-label': 'History',
    children: (
      <>
        <Button variant="secondary">Undo</Button>
        <Button variant="secondary" disabled>
          Redo
        </Button>
      </>
    ),
  },
};

export const SplitButton: Story = {
  name: 'Example: split button',
  args: {
    'aria-label': 'Publish',
    children: (
      <>
        <Button>Publish</Button>
        <DropdownMenu
          align="end"
          content={
            <>
              <DropdownMenuItem>Schedule…</DropdownMenuItem>
              <DropdownMenuItem>Save as draft</DropdownMenuItem>
            </>
          }
        >
          <IconButton aria-label="More publish options" icon={<ChevronIcon />} />
        </DropdownMenu>
      </>
    ),
  },
};
