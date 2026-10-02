import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Popover } from '.';
import { Button } from '../button';
import { Input } from '../input';

function Filters(props: { onOpenChange?: (open: boolean) => void }) {
  return (
    <>
      <Popover
        aria-label="Filters"
        content={<Input aria-label="Author" />}
        onOpenChange={props.onOpenChange}
      >
        <Button>Filters</Button>
      </Popover>
      <Button>Outside</Button>
    </>
  );
}

describe('Popover', () => {
  it('opens on click and moves focus into the content', async () => {
    const user = userEvent.setup();
    render(<Filters />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Author' })).toHaveFocus());
  });

  it('closes with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Filters />);
    const trigger = screen.getByRole('button', { name: 'Filters' });

    await user.click(trigger);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('closes on an outside click', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Filters onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('can be closed from its content when controlled', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Popover
          aria-label="Share"
          open={open}
          onOpenChange={setOpen}
          content={<Button onClick={() => setOpen(false)}>Done</Button>}
        >
          <Button>Share</Button>
        </Popover>
      );
    }
    render(<Controlled />);

    await user.click(screen.getByRole('button', { name: 'Share' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('forwards ref to the popover element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Popover aria-label="Filters" content="Content" defaultOpen ref={ref}>
        <Button>Filters</Button>
      </Popover>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
