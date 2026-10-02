import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Tooltip } from '.';
import { Button } from '../button';

describe('Tooltip', () => {
  it('describes the trigger on hover', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Saves a draft">
        <Button>Save</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Save' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.hover(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Saves a draft');
    expect(trigger).toHaveAccessibleDescription('Saves a draft');
  });

  it('opens on keyboard focus and closes with Escape', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Saves a draft">
        <Button>Save</Button>
      </Tooltip>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('works as a controlled tooltip', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Tooltip
          content="Saves a draft"
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            onOpenChange(next);
          }}
        >
          <Button>Save</Button>
        </Tooltip>
      );
    }
    render(<Controlled />);

    await user.hover(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('keeps the trigger working', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tooltip content="Saves a draft">
        <Button onClick={onClick}>Save</Button>
      </Tooltip>,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards ref to the tooltip element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tooltip content="Saves a draft" defaultOpen ref={ref}>
        <Button>Save</Button>
      </Tooltip>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
