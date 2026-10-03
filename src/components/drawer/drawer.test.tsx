import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Drawer, type DrawerProps } from '.';
import { Button } from '../button';

function Example({
  onOpenChange,
  ...props
}: Partial<DrawerProps> & { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const change = (next: boolean) => {
    onOpenChange?.(next);
    setOpen(next);
  };
  return (
    <>
      <Button onClick={() => change(true)}>Filters</Button>
      <Drawer
        open={open}
        onOpenChange={change}
        title="Filters"
        description="Narrow down the list."
        footer={<Button onClick={() => change(false)}>Apply</Button>}
        {...props}
      >
        Filter fields
      </Drawer>
    </>
  );
}

describe('Drawer', () => {
  it('opens as a named, described dialog with its content', async () => {
    const user = userEvent.setup();
    render(<Example side="start" />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleDescription('Narrow down the list.');
    expect(dialog).toHaveTextContent('Filter fields');
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('closes from the close button and from Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('closes when the visible page beside it is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    // A click on the <dialog> element itself is a click on its backdrop.
    await user.click(screen.getByRole('dialog'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('translates the close button', async () => {
    const user = userEvent.setup();
    render(<Example title="Filtreler" closeLabel="Kapat" />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByRole('button', { name: 'Kapat' })).toBeInTheDocument();
  });

  it('merges className and forwards ref to the dialog', () => {
    const ref = createRef<HTMLDialogElement>();
    render(
      <Drawer ref={ref} open onOpenChange={() => {}} title="Cart" side="bottom" className="cart">
        Items
      </Drawer>,
    );
    expect(ref.current).toBe(screen.getByRole('dialog', { name: 'Cart' }));
    expect(ref.current).toHaveClass('cart');
  });
});
