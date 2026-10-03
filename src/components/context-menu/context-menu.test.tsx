import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ContextMenu, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator } from '.';

function FileRow(props: {
  onRename?: () => void;
  onDelete?: () => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <ContextMenu
      onOpenChange={props.onOpenChange}
      disabled={props.disabled}
      content={
        <>
          <ContextMenuLabel>report.pdf</ContextMenuLabel>
          <ContextMenuItem onSelect={props.onRename}>Rename</ContextMenuItem>
          <ContextMenuItem disabled>Share</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem tone="danger" onSelect={props.onDelete}>
            Delete
          </ContextMenuItem>
        </>
      }
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a focusable area, so Shift+F10 reaches it */}
      <div tabIndex={0}>report.pdf</div>
    </ContextMenu>
  );
}

const area = () => screen.getByText('report.pdf', { selector: 'div[tabindex]' });

describe('ContextMenu', () => {
  it('opens at the pointer on right-click', () => {
    const onOpenChange = vi.fn();
    render(<FileRow onOpenChange={onOpenChange} />);

    fireEvent.contextMenu(area(), { clientX: 40, clientY: 20 });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Rename',
      'Share',
      'Delete',
    ]);
  });

  it('calls onSelect and closes when an item is chosen', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<FileRow onDelete={onDelete} />);

    fireEvent.contextMenu(area());
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('is keyboard operable and skips disabled items', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(<FileRow onRename={onRename} />);

    // Shift+F10 and the Menu key fire a contextmenu event on the focused element.
    area().focus();
    fireEvent.contextMenu(area());
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{Enter}');
    expect(onRename).toHaveBeenCalledOnce();
  });

  it('closes with Escape', async () => {
    const user = userEvent.setup();
    render(<FileRow />);

    fireEvent.contextMenu(area());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('leaves the browser menu in place when disabled', () => {
    render(<FileRow disabled />);
    expect(fireEvent.contextMenu(area())).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('merges className onto the menu', () => {
    render(
      <ContextMenu className="file-menu" content={<ContextMenuItem>Open</ContextMenuItem>}>
        <div>Target</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Target'));
    expect(screen.getByRole('menu')).toHaveClass('file-menu');
  });
});
