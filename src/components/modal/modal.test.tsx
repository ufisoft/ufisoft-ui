import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '.';
import { Button } from '../button';

function Example({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const change = (next: boolean) => {
    onOpenChange?.(next);
    setOpen(next);
  };
  return (
    <>
      <Button onClick={() => change(true)}>Delete project</Button>
      <Modal
        open={open}
        onOpenChange={change}
        title="Delete project?"
        description="This cannot be undone."
        footer={<Button onClick={() => change(false)}>Cancel</Button>}
      >
        Body content
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('opens as a named, described dialog', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole('button', { name: 'Delete project' }));

    const dialog = screen.getByRole('dialog', { name: 'Delete project?' });
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
  });

  it('closes from the close button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
  });

  it('closes from a footer action', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
  });

  it('asks the owner to close on Escape (cancel event) instead of closing itself', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="Settings">
        Body
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Settings' });

    // jsdom has no Escape → cancel mapping; the browser fires this event.
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(dialog, cancel);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog).toHaveAttribute('open');
  });

  it('closes when the backdrop is clicked but not when the content is', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="Settings">
        Body
      </Modal>,
    );

    await user.click(screen.getByText('Body'));
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('dialog', { name: 'Settings' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
