import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createEventBus } from './event-bus';

interface TestEvents {
  'datepicker.state.onChange': { value: Date | null; previousValue: Date | null };
  'modal.state.onOpen': { id: string };
}

const bus = () => createEventBus<TestEvents>({ debug: false });
const oct = (d: number) => new Date(2026, 9, d);

describe('createEventBus', () => {
  afterEach(() => vi.restoreAllMocks());

  it('calls listeners with the payload and meta', () => {
    const events = bus();
    const listener = vi.fn();
    events.on('datepicker.state.onChange', listener);

    events.emit('datepicker.state.onChange', { value: oct(3), previousValue: null });
    expect(listener).toHaveBeenCalledWith(
      { value: oct(3), previousValue: null },
      { name: 'datepicker.state.onChange', timestamp: expect.any(Number) },
    );
  });

  it('calls every listener of an event, in subscription order', () => {
    const events = bus();
    const calls: string[] = [];
    events.on('modal.state.onOpen', () => calls.push('first'));
    events.on('modal.state.onOpen', () => calls.push('second'));

    events.emit('modal.state.onOpen', { id: 'a' });
    expect(calls).toEqual(['first', 'second']);
  });

  it('keeps events apart', () => {
    const events = bus();
    const listener = vi.fn();
    events.on('modal.state.onOpen', listener);

    events.emit('datepicker.state.onChange', { value: null, previousValue: null });
    expect(listener).not.toHaveBeenCalled();
  });

  it('keeps buses apart', () => {
    const first = bus();
    const second = bus();
    const listener = vi.fn();
    first.on('modal.state.onOpen', listener);

    second.emit('modal.state.onOpen', { id: 'a' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops a listener with the returned unsubscribe or with off', () => {
    const events = bus();
    const a = vi.fn();
    const b = vi.fn();
    const unsubscribe = events.on('modal.state.onOpen', a);
    events.on('modal.state.onOpen', b);

    unsubscribe();
    events.off('modal.state.onOpen', b);
    events.emit('modal.state.onOpen', { id: 'a' });
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it('calls a once listener only for the next emission', () => {
    const events = bus();
    const listener = vi.fn();
    events.once('modal.state.onOpen', listener);

    events.emit('modal.state.onOpen', { id: 'a' });
    events.emit('modal.state.onOpen', { id: 'b' });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ id: 'a' }, expect.anything());
  });

  it('lets a once listener be removed before it fires', () => {
    const events = bus();
    const listener = vi.fn();
    const unsubscribe = events.once('modal.state.onOpen', listener);

    unsubscribe();
    events.emit('modal.state.onOpen', { id: 'a' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('sends every event to onAny listeners', () => {
    const events = bus();
    const listener = vi.fn();
    const unsubscribe = events.onAny(listener);

    events.emit('modal.state.onOpen', { id: 'a' });
    expect(listener).toHaveBeenCalledWith({
      name: 'modal.state.onOpen',
      payload: { id: 'a' },
      timestamp: expect.any(Number),
    });
    unsubscribe();
    events.emit('modal.state.onOpen', { id: 'b' });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('isolates a listener that throws', () => {
    const events = bus();
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    const after = vi.fn();
    events.on('modal.state.onOpen', () => {
      throw new Error('listener failed');
    });
    events.on('modal.state.onOpen', after);

    expect(() => events.emit('modal.state.onOpen', { id: 'a' })).not.toThrow();
    expect(after).toHaveBeenCalledOnce();
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'listener failed' }),
    );
    vi.unstubAllGlobals();
  });

  it('does not skip listeners removed during an emission', () => {
    const events = bus();
    const second = vi.fn();
    const unsubscribeFirst = events.on('modal.state.onOpen', () => unsubscribeFirst());
    events.on('modal.state.onOpen', second);

    events.emit('modal.state.onOpen', { id: 'a' });
    expect(second).toHaveBeenCalledOnce();
  });

  it('clears every listener', () => {
    const events = bus();
    const listener = vi.fn();
    events.on('modal.state.onOpen', listener);
    events.onAny(listener);

    events.clear();
    events.emit('modal.state.onOpen', { id: 'a' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('types payloads by event name', () => {
    const events = bus();
    events.on('datepicker.state.onChange', (payload, meta) => {
      expectTypeOf(payload.value).toEqualTypeOf<Date | null>();
      expectTypeOf(payload.previousValue).toEqualTypeOf<Date | null>();
      expectTypeOf(meta.name).toEqualTypeOf<'datepicker.state.onChange'>();
    });
    events.onAny((event) => {
      if (event.name === 'modal.state.onOpen')
        expectTypeOf(event.payload).toEqualTypeOf<{ id: string }>();
    });

    // @ts-expect-error — previousValue is missing
    events.emit('datepicker.state.onChange', { value: null });
    // @ts-expect-error — value must be a Date or null
    events.emit('datepicker.state.onChange', { value: '2026-10-03', previousValue: null });
    // @ts-expect-error — not an event of this bus
    events.emit('datepicker.state.onSomething', {});
    // @ts-expect-error — listener expects the wrong payload
    events.on('modal.state.onOpen', (payload: { value: Date }) => payload);
  });
});
