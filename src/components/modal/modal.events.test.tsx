import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Modal } from '.';
import { names, recordEvents } from '../../test/record-events';
import { Button } from '../button';
import { Drawer } from '../drawer';

function Example({ as: Dialog }: { as: typeof Modal | typeof Drawer }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Dialog
        id="dialog"
        open={open}
        onOpenChange={setOpen}
        title="Filters"
        footer={<Button>Apply</Button>}
      >
        Body
      </Dialog>
    </>
  );
}

describe('dialog events', () => {
  it('Modal emits onOpen and onClose; the close button emits nothing of its own', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<Example as={Modal} />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(events).toEqual([
      { name: 'modal.state.onOpen', payload: { source: { id: 'dialog' } } },
      { name: 'modal.state.onClose', payload: { source: { id: 'dialog' } } },
    ]);
  });

  it('Modal content keeps emitting its own events', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<Example as={Modal} />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(names(events)).toEqual(['modal.state.onOpen', 'button.interaction.onClick']);
  });

  it('Drawer emits drawer events instead of modal events, and its content still emits', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<Example as={Drawer} />);

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(events).toEqual([
      { name: 'drawer.state.onOpen', payload: { side: 'end', source: { id: 'dialog' } } },
      { name: 'button.interaction.onClick', payload: { source: {} } },
      { name: 'drawer.state.onClose', payload: { side: 'end', source: { id: 'dialog' } } },
    ]);
  });

  it('emits onOpen for a dialog rendered open', () => {
    const events = recordEvents();
    render(
      <Modal open onOpenChange={() => {}} title="Welcome">
        Hi
      </Modal>,
    );
    expect(names(events)).toEqual(['modal.state.onOpen']);
  });
});
