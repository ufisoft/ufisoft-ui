import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '.';
import { recordEvents } from '../../test/record-events';

function Controls() {
  const { toast, dismiss } = useToast();
  return (
    <>
      <button
        type="button"
        onClick={() =>
          toast({
            title: 'Page deleted',
            tone: 'success',
            eventData: { pageId: 42 },
            action: { label: 'Undo', onClick: () => {} },
          })
        }
      >
        Delete
      </button>
      <button type="button" onClick={() => dismiss(1)}>
        Dismiss first
      </button>
    </>
  );
}

describe('Toast events', () => {
  it('emits onOpen, onAction and a single onClose', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <ToastProvider>
        <Controls />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(events.at(-1)?.name).toBe('toast.state.onClose'));
    // A later dismiss of the same toast is not a second close.
    await user.click(screen.getByRole('button', { name: 'Dismiss first' }));

    const source = { data: { pageId: 42 } };
    expect(events).toEqual([
      {
        name: 'toast.state.onOpen',
        payload: { id: 1, tone: 'success', title: 'Page deleted', source },
      },
      { name: 'toast.interaction.onAction', payload: { id: 1, label: 'Undo', source } },
      { name: 'toast.state.onClose', payload: { id: 1, source } },
    ]);
  });

  it('emits onClose when the time runs out', async () => {
    vi.useFakeTimers();
    const events = recordEvents();
    render(
      <ToastProvider duration={1000}>
        <Controls />
      </ToastProvider>,
    );

    act(() => screen.getByRole('button', { name: 'Delete' }).click());
    act(() => vi.advanceTimersByTime(1100));
    expect(events.map((event) => event.name)).toEqual([
      'toast.state.onOpen',
      'toast.state.onClose',
    ]);
    vi.useRealTimers();
  });
});
