import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '.';
import { names, recordEvents } from '../../test/record-events';
import { IconButton } from '../icon-button';

describe('Button and IconButton events', () => {
  it('emits button.interaction.onClick with the source, after onClick', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    const onClick = vi.fn(() => expect(events).toEqual([]));
    render(
      <Button id="save" name="intent" eventData={{ pageId: 42 }} onClick={onClick}>
        Save
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(events).toEqual([
      {
        name: 'button.interaction.onClick',
        payload: { source: { id: 'save', name: 'intent', data: { pageId: 42 } } },
      },
    ]);
  });

  it('emits for keyboard activation and for asChild links', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <>
        <Button>Save</Button>
        <Button asChild>
          <a href="#pages">Pages</a>
        </Button>
      </>,
    );

    screen.getByRole('button', { name: 'Save' }).focus();
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('link', { name: 'Pages' }));
    expect(names(events)).toEqual(['button.interaction.onClick', 'button.interaction.onClick']);
  });

  it('emits nothing while loading or disabled', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <>
        <Button loading>Saving</Button>
        <Button disabled>Off</Button>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Saving' }));
    await user.click(screen.getByRole('button', { name: 'Off' }));
    expect(events).toEqual([]);
  });

  it('emits iconbutton.interaction.onClick with its label instead of a button event', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    const onClick = vi.fn();
    render(<IconButton aria-label="Delete page" icon="×" eventData={7} onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Delete page' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(events).toEqual([
      {
        name: 'iconbutton.interaction.onClick',
        payload: { label: 'Delete page', source: { data: 7 } },
      },
    ]);
  });

  it('does not emit for a loading IconButton', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<IconButton aria-label="Refresh" icon="↻" loading />);

    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(events).toEqual([]);
  });
});
