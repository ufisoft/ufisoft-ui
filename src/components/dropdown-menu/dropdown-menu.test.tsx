import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '.';
import { Button } from '../button';

function PageActions(props: { onEdit?: () => void; onDelete?: () => void }) {
  return (
    <DropdownMenu
      content={
        <>
          <DropdownMenuLabel>Page</DropdownMenuLabel>
          <DropdownMenuItem onSelect={props.onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
          <DropdownMenuItem>Move</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem tone="danger" onSelect={props.onDelete}>
            Delete
          </DropdownMenuItem>
        </>
      }
    >
      <Button>Actions</Button>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('opens a menu from its trigger', async () => {
    const user = userEvent.setup();
    render(<PageActions />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Edit',
      'Duplicate',
      'Move',
      'Delete',
    ]);
  });

  it('calls onSelect and closes when an item is chosen', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<PageActions onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('is fully keyboard operable and skips disabled items', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<PageActions onEdit={onEdit} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });

    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Move' })).toHaveFocus();
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await user.keyboard('{ArrowUp}{Enter}');
    expect(onEdit).toHaveBeenCalledOnce();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<PageActions />);
    const trigger = screen.getByRole('button', { name: 'Actions' });

    await user.click(trigger);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('renders a link item with asChild', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        content={
          <DropdownMenuItem asChild>
            <a href="/settings">Settings</a>
          </DropdownMenuItem>
        }
      >
        <Button>Account</Button>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('forwards ref to the menu element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DropdownMenu content={<DropdownMenuItem>Edit</DropdownMenuItem>} defaultOpen ref={ref}>
        <Button>Actions</Button>
      </DropdownMenu>,
    );
    expect(ref.current).toHaveAttribute('role', 'menu');
  });
});
