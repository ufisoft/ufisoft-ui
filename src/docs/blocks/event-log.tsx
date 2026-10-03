/**
 * A live list of the events emitted on the current bus, for the Event Playground and examples.
 * Storybook only: it listens with onAny and adds nothing to the components' API.
 */

import { useEffect, useState, type CSSProperties } from 'react';
import { EventScope, useEventBus } from '../../events/react';
import { Button } from '../../components/button';
import { Stack } from '../../components/stack';
import { Text } from '../../components/text';
import { formatPayload } from './format-payload';

interface LoggedEvent {
  id: number;
  name: string;
  payload: unknown;
  timestamp: number;
}

const list: CSSProperties = {
  display: 'grid',
  gap: 'var(--ufi-space-xs)',
  maxHeight: '24rem',
  margin: 0,
  padding: 0,
  overflowY: 'auto',
  listStyle: 'none',
};

const item: CSSProperties = {
  padding: 'var(--ufi-space-sm)',
  background: 'var(--ufi-color-bg-subtle)',
  border: 'var(--ufi-border-width) solid var(--ufi-color-border-subtle)',
  borderRadius: 'var(--ufi-radius-md)',
};

const pre: CSSProperties = {
  margin: 0,
  fontFamily: 'var(--ufi-font-code)',
  fontSize: 'var(--ufi-text-xs)',
  whiteSpace: 'pre-wrap',
};

export interface EventLogProps {
  /** Only events whose name starts with this, e.g. `datepicker.`. */
  prefix?: string;
  /** Hide a frequent event, e.g. button clicks. */
  exclude?: string[];
}

export function EventLog({ prefix = '', exclude = [] }: EventLogProps) {
  const bus = useEventBus();
  const [events, setEvents] = useState<LoggedEvent[]>([]);
  const excluded = exclude.join('|');

  useEffect(() => {
    let id = 0;
    const skip = excluded ? excluded.split('|') : [];
    return bus.onAny(({ name, payload, timestamp }) => {
      if (!name.startsWith(prefix) || skip.includes(name)) return;
      id += 1;
      const next = { id, name, payload, timestamp };
      setEvents((current) => [next, ...current].slice(0, 50));
    });
  }, [bus, prefix, excluded]);

  return (
    <section aria-label="Event log">
      <Stack gap="sm">
        <Stack direction="horizontal" justify="between" align="center">
          <Text weight="semibold">Event log</Text>
          {/* The log's own button must not show up in the log. */}
          <EventScope silent>
            <Button size="sm" variant="secondary" onClick={() => setEvents([])}>
              Clear log
            </Button>
          </EventScope>
        </Stack>
        {events.length === 0 ? (
          <Text tone="muted">No events yet — use the components above.</Text>
        ) : (
          <ol style={list} aria-live="polite">
            {events.map((event) => (
              <li key={event.id} style={item}>
                <Stack gap="2xs">
                  <Stack direction="horizontal" justify="between" gap="sm">
                    <Text as="strong" size="sm">
                      <code>{event.name}</code>
                    </Text>
                    <Text as="span" size="xs" tone="muted">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </Text>
                  </Stack>
                  <pre style={pre}>{formatPayload(event.payload)}</pre>
                </Stack>
              </li>
            ))}
          </ol>
        )}
      </Stack>
    </section>
  );
}
