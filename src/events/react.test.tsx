import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createEventBus } from './event-bus';
import { EventBusProvider, EventScope, useEmit, useEventBus, useEventListener } from './react';
import { eventBus, eventRegistry } from './registry';

const payload = { id: 1, tone: 'success' as const, title: 'Saved', source: {} };

function Emitter() {
  const emit = useEmit();
  return (
    <button type="button" onClick={() => emit('toast.state.onOpen', payload)}>
      Emit
    </button>
  );
}

describe('React adapter', () => {
  it('uses the global bus without a provider', () => {
    const listener = vi.fn();
    eventBus.on('toast.state.onOpen', listener);
    render(<Emitter />);
    act(() => screen.getByRole('button').click());
    expect(listener).toHaveBeenCalledWith(payload, expect.anything());
  });

  it('uses the provider’s bus inside an EventBusProvider', () => {
    const bus = createEventBus({ registry: eventRegistry, debug: false });
    const isolated = vi.fn();
    const global = vi.fn();
    bus.on('toast.state.onOpen', isolated);
    eventBus.on('toast.state.onOpen', global);
    function Probe() {
      return <p>{useEventBus() === bus ? 'isolated' : 'global'}</p>;
    }

    render(
      <EventBusProvider bus={bus}>
        <Probe />
        <Emitter />
      </EventBusProvider>,
    );
    act(() => screen.getByRole('button').click());
    expect(screen.getByText('isolated')).toBeInTheDocument();
    expect(isolated).toHaveBeenCalledOnce();
    expect(global).not.toHaveBeenCalled();
  });

  it('listens while mounted with the latest listener', () => {
    const calls: string[] = [];
    function Listener() {
      const [label, setLabel] = useState('first');
      useEventListener('toast.state.onOpen', () => calls.push(label));
      return (
        <button type="button" onClick={() => setLabel('second')}>
          Relabel
        </button>
      );
    }
    const { unmount } = render(<Listener />);

    act(() => eventBus.emit('toast.state.onOpen', payload));
    act(() => screen.getByRole('button', { name: 'Relabel' }).click());
    act(() => eventBus.emit('toast.state.onOpen', payload));
    unmount();
    act(() => eventBus.emit('toast.state.onOpen', payload));
    expect(calls).toEqual(['first', 'second']);
  });

  it('silences components inside a silent scope, and turns them back on below', () => {
    const listener = vi.fn();
    eventBus.on('toast.state.onOpen', listener);
    render(
      <EventScope silent>
        <Emitter />
        <EventScope silent={false}>
          <Emitter />
        </EventScope>
      </EventScope>,
    );
    const [silenced, active] = screen.getAllByRole('button');
    act(() => silenced?.click());
    expect(listener).not.toHaveBeenCalled();
    act(() => active?.click());
    expect(listener).toHaveBeenCalledOnce();
  });
});
