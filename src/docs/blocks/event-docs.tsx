/**
 * Docs blocks generated from the event registry, so component pages and Event Discovery never
 * repeat event details by hand. Storybook only: not part of the library build.
 */

import { useState, type CSSProperties } from 'react';
import type { EventEntry } from '../../events/define-events';
import { eventRegistry } from '../../events/registry';
import { Badge } from '../../components/badge';
import { Heading } from '../../components/heading';
import { Input } from '../../components/input';
import { Stack } from '../../components/stack';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table';
import { Text } from '../../components/text';
import { formatPayload } from './format-payload';

const entries: EventEntry[] = Object.values(eventRegistry);

const code: CSSProperties = {
  margin: 0,
  padding: 'var(--ufi-space-sm)',
  overflowX: 'auto',
  fontFamily: 'var(--ufi-font-code)',
  fontSize: 'var(--ufi-text-sm)',
  background: 'var(--ufi-color-bg-subtle)',
  borderRadius: 'var(--ufi-radius-md)',
};

const card: CSSProperties = {
  padding: 'var(--ufi-space-md)',
  border: 'var(--ufi-border-width) solid var(--ufi-color-border-default)',
  borderRadius: 'var(--ufi-radius-md)',
};

/** One event: name, domain, description, payload fields and an example. */
/** `level`: 3 under a page's `## Events`, 4 under a component heading in the catalog. */
export function EventDetails({ entry, level }: { entry: EventEntry; level: 3 | 4 }) {
  const domain = entry.name.split('.')[1];
  return (
    <section style={card} aria-labelledby={`event-${entry.name}`}>
      <Stack gap="sm">
        <Stack direction="horizontal" gap="xs" align="center" wrap>
          <Heading level={level} size="sm" id={`event-${entry.name}`}>
            <code>{entry.name}</code>
          </Heading>
          <Badge tone={domain === 'state' ? 'info' : 'neutral'} size="sm">
            {domain}
          </Badge>
        </Stack>
        <Text>{entry.description}</Text>
        <Table caption={`Payload of ${entry.name}`}>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Type and meaning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(entry.fields).map(([field, text]) => (
              <TableRow key={field}>
                <TableCell>
                  <code>{field}</code>
                </TableCell>
                <TableCell>{text}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Text size="sm" weight="semibold">
          Example
        </Text>
        <pre style={code}>
          {`eventBus.on('${entry.name}', (payload) => {\n  // payload = ${formatPayload(entry.example, 1)}\n});`}
        </pre>
      </Stack>
    </section>
  );
}

/** The events of one component, for its docs page (`## Events`). */
export function ComponentEvents({ component }: { component: string }) {
  const own = entries.filter((entry) => entry.component === component);
  if (own.length === 0) return <Text tone="muted">{component} emits no events.</Text>;
  return (
    <Stack gap="md">
      <Text>
        {component} emits these events on the shared <code>eventBus</code> (or the bus of a
        surrounding <code>EventBusProvider</code>), next to its callbacks — the callbacks keep
        working as before. Every payload has <code>source</code>: the component&apos;s{' '}
        <code>id</code> and <code>name</code> props and its <code>eventData</code> prop. In
        development each event is also logged to the browser console. See{' '}
        <em>Architecture › Event System</em>.
      </Text>
      {own.map((entry) => (
        <EventDetails key={entry.name} entry={entry} level={3} />
      ))}
    </Stack>
  );
}

/** Every registered event, grouped by component, with a filter. */
export function EventCatalog() {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const matches = entries.filter(
    (entry) =>
      needle === '' ||
      entry.name.toLowerCase().includes(needle) ||
      entry.component.toLowerCase().includes(needle) ||
      entry.description.toLowerCase().includes(needle),
  );
  const components = [...new Set(matches.map((entry) => entry.component))];

  return (
    <Stack gap="lg">
      <Stack gap="2xs">
        <label htmlFor="event-filter">
          <Text weight="semibold">Filter events</Text>
        </label>
        <Input
          id="event-filter"
          type="search"
          placeholder="e.g. datepicker, onOpen, closed"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Text size="sm" tone="muted" aria-live="polite">
          {matches.length} of {entries.length} events in {components.length} components
        </Text>
      </Stack>
      {components.map((component) => (
        <Stack key={component} gap="sm">
          <Heading level={3} size="md">
            {component}
          </Heading>
          {matches
            .filter((entry) => entry.component === component)
            .map((entry) => (
              <EventDetails key={entry.name} entry={entry} level={4} />
            ))}
        </Stack>
      ))}
    </Stack>
  );
}
