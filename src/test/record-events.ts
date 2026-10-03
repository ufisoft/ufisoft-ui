import { eventBus } from '../events/registry';

export interface RecordedEvent {
  name: string;
  payload: unknown;
}

/** Records every event emitted on the global bus (cleared after each test by setup.ts). */
export function recordEvents(): RecordedEvent[] {
  const events: RecordedEvent[] = [];
  eventBus.onAny(({ name, payload }) => events.push({ name, payload }));
  return events;
}

export const names = (events: RecordedEvent[]) => events.map((event) => event.name);
