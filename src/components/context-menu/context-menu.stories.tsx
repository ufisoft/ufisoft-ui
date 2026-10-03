import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { ContextMenu, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator } from '.';
import { DropdownMenu, DropdownMenuItem } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import { Stack } from '../stack';
import { Text } from '../text';

const area = {
  display: 'grid',
  placeItems: 'center',
  minHeight: '10rem',
  border: '2px dashed var(--ufi-color-border-default)',
  borderRadius: 'var(--ufi-radius-md)',
  color: 'var(--ufi-color-text-muted)',
};

function MoreIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3" cy="8" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="13" cy="8" r="1.25" />
    </svg>
  );
}

const meta = {
  title: 'Overlay/ContextMenu',
  component: ContextMenu,
  args: {
    onOpenChange: fn(),
    content: (
      <>
        <ContextMenuItem>Cut</ContextMenuItem>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
      </>
    ),
    children: (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable, so the Menu key and Shift+F10 reach it
      <div tabIndex={0} style={area}>
        Right-click here, or focus and press Shift+F10
      </div>
    ),
  },
  argTypes: {
    content: { control: false },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, minHeight: '18rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabelsAndSeparators: Story = {
  name: 'Labels, separators, danger and disabled',
  args: {
    content: (
      <>
        <ContextMenuLabel>Page</ContextMenuLabel>
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem disabled>Move (no permission)</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem tone="danger">Delete</ContextMenuItem>
      </>
    ),
  },
};

export const Disabled: Story = {
  name: 'Disabled (browser menu)',
  args: { disabled: true },
};

export const FileList: Story = {
  name: 'Example: file list with a visible menu too',
  render: function Render(args) {
    const [log, setLog] = useState('Right-click a file, or use its “More” button.');
    const files = ['brief.docx', 'budget.xlsx', 'logo.svg'];
    const actions = (name: string, Item: typeof ContextMenuItem | typeof DropdownMenuItem) => (
      <>
        <Item onSelect={() => setLog(`Opened ${name}`)}>Open</Item>
        <Item onSelect={() => setLog(`Renaming ${name}`)}>Rename</Item>
        <Item tone="danger" onSelect={() => setLog(`Deleted ${name}`)}>
          Delete
        </Item>
      </>
    );
    return (
      <Stack gap="sm">
        <Stack as="ul" gap="2xs" aria-label="Files">
          {files.map((name) => (
            <li key={name}>
              <ContextMenu {...args} content={actions(name, ContextMenuItem)}>
                <div
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable row for Shift+F10
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--ufi-space-2xs) var(--ufi-space-sm)',
                    border: '1px solid var(--ufi-color-border-default)',
                    borderRadius: 'var(--ufi-radius-sm)',
                  }}
                >
                  <Text>{name}</Text>
                  <DropdownMenu align="end" content={actions(name, DropdownMenuItem)}>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      aria-label={`More actions for ${name}`}
                      icon={<MoreIcon />}
                    />
                  </DropdownMenu>
                </div>
              </ContextMenu>
            </li>
          ))}
        </Stack>
        <Text size="sm" tone="muted" aria-live="polite">
          {log}
        </Text>
      </Stack>
    );
  },
};

export const Turkish: Story = {
  name: 'Example: Turkish',
  args: {
    content: (
      <>
        <ContextMenuItem>Kes</ContextMenuItem>
        <ContextMenuItem>Kopyala</ContextMenuItem>
        <ContextMenuItem>Yapıştır</ContextMenuItem>
      </>
    ),
    children: (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable, so the Menu key and Shift+F10 reach it
      <div tabIndex={0} style={area}>
        Sağ tıklayın veya odaklanıp Shift+F10’a basın
      </div>
    ),
  },
};
