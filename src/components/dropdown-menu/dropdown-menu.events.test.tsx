import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DropdownMenu, DropdownMenuItem } from '.';
import { names, recordEvents } from '../../test/record-events';
import { ContextMenu, ContextMenuItem } from '../context-menu';
import { Popover } from '../popover';

describe('overlay events', () => {
  it('Popover emits onOpen and onClose; the trigger button emits its click', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <Popover id="share" content={<p>Share this page</p>}>
        <button type="button">Share</button>
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Share' }));
    await user.keyboard('{Escape}');
    expect(events).toEqual([
      { name: 'popover.state.onOpen', payload: { source: { id: 'share' } } },
      { name: 'popover.state.onClose', payload: { source: { id: 'share' } } },
    ]);
  });

  it('DropdownMenu emits onOpen, onSelect with the item label, and onClose', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <DropdownMenu
        content={
          <>
            <DropdownMenuItem eventData={{ pageId: 42 }}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem textValue="Delete">
              <strong>Delete</strong>
            </DropdownMenuItem>
          </>
        }
      >
        <button type="button">Actions</button>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(names(events)).toEqual([
      'dropdownmenu.state.onOpen',
      'dropdownmenu.interaction.onSelect',
      'dropdownmenu.state.onClose',
    ]);
    expect(events[1]?.payload).toEqual({ label: 'Duplicate', source: { data: { pageId: 42 } } });

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(events[4]?.payload).toEqual({ label: 'Delete', source: {} });
  });

  it('ContextMenu emits onOpen, onSelect and onClose', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <ContextMenu
        eventData={{ fileId: 'f-7' }}
        content={<ContextMenuItem>Rename</ContextMenuItem>}
      >
        <div>report.pdf</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('report.pdf'));
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(events).toEqual([
      { name: 'contextmenu.state.onOpen', payload: { source: { data: { fileId: 'f-7' } } } },
      { name: 'contextmenu.interaction.onSelect', payload: { label: 'Rename', source: {} } },
      { name: 'contextmenu.state.onClose', payload: { source: { data: { fileId: 'f-7' } } } },
    ]);
  });
});
