import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineEvents, payload } from './define-events';
import { createEventBus } from './event-bus';
import { isDevelopment } from './logger';

const registry = defineEvents(
  { component: 'Demo', prefix: 'demo' },
  {
    'state.onChange': {
      description: 'The demo value changed.',
      payload: payload<{ value: number }>(),
      fields: { value: 'number — the new value' },
      example: { value: 1 },
    },
  },
);

describe('event logging', () => {
  let group: ReturnType<typeof vi.spyOn>;
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    group = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    log = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('logs the name, description, payload, time and how to listen when debug is on', () => {
    const bus = createEventBus({ registry, debug: true });
    bus.emit('demo.state.onChange', { value: 7 });

    expect(group).toHaveBeenCalledOnce();
    expect(group.mock.calls[0]?.[0]).toContain('[UfiSoft Event]');
    expect(group.mock.calls[0]?.[0]).toContain('demo.state.onChange');
    expect(log).toHaveBeenCalledWith('The demo value changed.');
    expect(log).toHaveBeenCalledWith('payload:', { value: 7 });
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^time: +\d\d:\d\d:\d\d\.\d{3}$/));
    expect(log).toHaveBeenCalledWith(
      "listen:  eventBus.on('demo.state.onChange', (payload) => { … })",
    );
  });

  it('logs nothing when debug is off', () => {
    const bus = createEventBus({ registry, debug: false });
    bus.emit('demo.state.onChange', { value: 7 });
    expect(group).not.toHaveBeenCalled();
  });

  it('can be switched on and off at runtime', () => {
    const bus = createEventBus({ registry, debug: false });
    bus.setDebug(true);
    bus.emit('demo.state.onChange', { value: 1 });
    bus.setDebug(false);
    bus.emit('demo.state.onChange', { value: 2 });
    expect(group).toHaveBeenCalledOnce();
  });

  it('never logs in production, even with debug on', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const bus = createEventBus({ registry, debug: true });
    bus.emit('demo.state.onChange', { value: 7 });
    expect(group).not.toHaveBeenCalled();
  });

  it('is on by default in development only', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isDevelopment()).toBe(true);
    createEventBus({ registry }).emit('demo.state.onChange', { value: 1 });
    expect(group).toHaveBeenCalledOnce();

    vi.stubEnv('NODE_ENV', 'test');
    expect(isDevelopment()).toBe(false);
    createEventBus({ registry }).emit('demo.state.onChange', { value: 1 });
    expect(group).toHaveBeenCalledOnce();
  });

  it('logs unregistered events without a description', () => {
    const bus = createEventBus<{ 'custom.state.onPing': { n: number } }>({ debug: true });
    bus.emit('custom.state.onPing', { n: 1 });
    expect(group.mock.calls[0]?.[0]).toContain('custom.state.onPing');
    expect(log).toHaveBeenCalledWith('payload:', { n: 1 });
  });
});
