import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { tr } from 'react-day-picker/locale';
import { Button } from '../../components/button';
import { DatePicker } from '../../components/date-picker';
import { FormField, FormLabel } from '../../components/form-field';
import { Stack } from '../../components/stack';
import { Switch } from '../../components/switch';
import { Text } from '../../components/text';
import { defineEvents, payload } from '../../events/define-events';
import { createEventBus } from '../../events/event-bus';
import { EventScope, useEventListener } from '../../events/react';
import { eventBus, type UfiEventPayload } from '../../events/registry';
import { formatPayload } from '../blocks/format-payload';

const box = {
  padding: 'var(--ufi-space-sm)',
  border: '1px solid var(--ufi-color-border-default)',
  borderRadius: 'var(--ufi-radius-md)',
};

const meta = {
  title: 'Architecture/Event System',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Another part of the page: it knows nothing about the DatePicker, only the event name. */
function ScheduleSummary() {
  const [last, setLast] = useState<UfiEventPayload<'datepicker.state.onChange'> | null>(null);
  useEventListener('datepicker.state.onChange', (payload) => setLast(payload));
  return (
    <div style={box}>
      <Text weight="semibold">Listener: datepicker.state.onChange</Text>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
        {last ? formatPayload(last) : 'Pick or type a date.'}
      </pre>
    </div>
  );
}

export const EmitAndListen: Story = {
  name: 'Emit and listen',
  render: () => (
    <Stack gap="md" style={{ maxWidth: 480 }}>
      <FormField>
        <FormLabel>Publish date</FormLabel>
        <DatePicker name="publishDate" locale={tr} eventData={{ pageId: 42 }} />
      </FormField>
      <ScheduleSummary />
    </Stack>
  ),
};

export const Once: Story = {
  render: function Render() {
    const [status, setStatus] = useState('Not listening.');
    const [waiting, setWaiting] = useState(false);
    useEffect(() => {
      if (!waiting) return;
      return eventBus.once('datepicker.state.onChange', (payload) => {
        setStatus(
          `Got one change: ${payload.value?.toDateString() ?? 'cleared'}. Stopped listening.`,
        );
        setWaiting(false);
      });
    }, [waiting]);
    return (
      <Stack gap="sm" style={{ maxWidth: 480 }}>
        <EventScope silent>
          <Button
            variant="secondary"
            disabled={waiting}
            onClick={() => {
              setStatus('Waiting for the next datepicker.state.onChange…');
              setWaiting(true);
            }}
          >
            Listen once
          </Button>
        </EventScope>
        <FormField>
          <FormLabel>Date</FormLabel>
          <DatePicker locale={tr} />
        </FormField>
        <Text aria-live="polite">{status}</Text>
      </Stack>
    );
  },
};

export const Unsubscribe: Story = {
  render: function Render() {
    const [listening, setListening] = useState(true);
    const [count, setCount] = useState(0);
    useEffect(() => {
      if (!listening) return;
      const unsubscribe = eventBus.on('switch.state.onChange', () => setCount((n) => n + 1));
      return unsubscribe;
    }, [listening]);
    return (
      <Stack gap="sm" style={{ maxWidth: 480 }}>
        <Switch name="autosave">Autosave</Switch>
        <Text>
          switch.state.onChange received <strong>{count}</strong> times
          {listening ? '' : ' (unsubscribed)'}.
        </Text>
        <EventScope silent>
          <Button variant="secondary" onClick={() => setListening((on) => !on)}>
            {listening ? 'Unsubscribe' : 'Subscribe again'}
          </Button>
        </EventScope>
      </Stack>
    );
  },
};

/** An application's own events, defined the same way as the library's. */
const cmsEvents = defineEvents(
  { component: 'PageEditor', prefix: 'pageeditor' },
  {
    'interaction.onPublish': {
      description: 'The editor published a page.',
      payload: payload<{ pageId: number; title: string }>(),
      fields: { pageId: 'number — the page', title: 'string — its title' },
      example: { pageId: 42, title: 'Pricing' },
    },
  },
);
const cmsBus = createEventBus({ registry: cmsEvents });

export const ApplicationEvents: Story = {
  name: 'Application events on their own bus',
  render: function Render() {
    const [published, setPublished] = useState<string[]>([]);
    useEffect(
      () =>
        cmsBus.on('pageeditor.interaction.onPublish', ({ pageId, title }) =>
          setPublished((list) => [`#${pageId} ${title}`, ...list]),
        ),
      [],
    );
    return (
      <Stack gap="sm" style={{ maxWidth: 480 }}>
        <EventScope silent>
          <Button
            onClick={() =>
              cmsBus.emit('pageeditor.interaction.onPublish', { pageId: 42, title: 'Pricing' })
            }
          >
            Publish “Pricing”
          </Button>
        </EventScope>
        <Text size="sm" tone="muted">
          cmsBus is typed by cmsEvents and logs to the console in development like eventBus.
        </Text>
        <ul aria-label="Published pages">
          {published.map((line, index) => (
            <li key={`${index}-${line}`}>{line}</li>
          ))}
        </ul>
      </Stack>
    );
  },
};

export const DebugLogging: Story = {
  name: 'Debug logging',
  render: function Render() {
    const [debug, setDebug] = useState(true);
    useEffect(() => {
      eventBus.setDebug(debug);
      return () => eventBus.setDebug(true);
    }, [debug]);
    return (
      <Stack gap="sm" style={{ maxWidth: 480 }}>
        <Text>Open the browser console, then change the date.</Text>
        <FormField>
          <FormLabel>Date</FormLabel>
          <DatePicker locale={tr} />
        </FormField>
        <EventScope silent>
          <Switch checked={debug} onChange={(e) => setDebug(e.target.checked)}>
            Log events to the console
          </Switch>
        </EventScope>
      </Stack>
    );
  },
};
