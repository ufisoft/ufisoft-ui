import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createEventBus } from '../../events/event-bus';
import { EventBusProvider } from '../../events/react';
import { eventRegistry } from '../../events/registry';
import { ComponentEvents, EventCatalog } from './event-docs';
import { EventLog } from './event-log';
import { EventPlayground } from './event-playground';
import { formatPayload } from './format-payload';

const log = () => screen.getByRole('region', { name: 'Event log' });

describe('Event Playground', () => {
  it('shows a DatePicker change in the live log', async () => {
    const user = userEvent.setup();
    render(<EventPlayground />);
    expect(within(log()).getByText(/No events yet/)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Publish date' }), '03.10.2026');
    await user.tab();
    const entry = within(log()).getByText('datepicker.state.onChange').closest('li');
    expect(entry).toHaveTextContent('value: Date(');
    expect(entry).toHaveTextContent('previousValue: null');
    expect(entry).toHaveTextContent('data: {');
  });

  it('logs events from the other components, newest first, and clears', async () => {
    const user = userEvent.setup();
    render(<EventPlayground />);

    await user.click(screen.getByRole('checkbox', { name: 'Featured page' }));
    await user.click(screen.getByRole('tab', { name: 'SEO' }));
    const names = within(log())
      .getAllByRole('listitem')
      .map((item) => item.querySelector('code')?.textContent);
    expect(names).toEqual(['tabs.state.onChange', 'checkbox.state.onChange']);

    await user.click(within(log()).getByRole('button', { name: 'Clear log' }));
    expect(within(log()).queryAllByRole('listitem')).toHaveLength(0);
  });

  it('follows the bus of an EventBusProvider', () => {
    const bus = createEventBus({ registry: eventRegistry, debug: false });
    render(
      <EventBusProvider bus={bus}>
        <EventLog />
      </EventBusProvider>,
    );
    act(() => bus.emit('modal.state.onOpen', { source: { id: 'x' } }));
    expect(within(log()).getByText('modal.state.onOpen')).toBeInTheDocument();
  });
});

describe('Event docs blocks', () => {
  it('lists a component’s events from the registry', () => {
    render(<ComponentEvents component="DatePicker" />);
    for (const name of [
      'datepicker.state.onChange',
      'datepicker.state.onOpen',
      'datepicker.state.onClose',
      'datepicker.state.onClear',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
      expect(screen.getByRole('table', { name: `Payload of ${name}` })).toBeInTheDocument();
    }
  });

  it('filters the catalog', async () => {
    const user = userEvent.setup();
    render(<EventCatalog />);
    const total = Object.keys(eventRegistry).length;
    expect(screen.getByText(new RegExp(`^${total} of ${total} events`))).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Filter events' }), 'drawer');
    expect(screen.getByText(/^2 of \d+ events in 1 components/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'drawer.state.onOpen' })).toBeInTheDocument();
  });

  it('formats payloads with dates and files', () => {
    expect(
      formatPayload({ value: new Date(Date.UTC(2026, 9, 3)), files: [new File(['ab'], 'a.pdf')] }),
    ).toBe(
      '{\n  value: Date(2026-10-03T00:00:00.000Z),\n  files: [\n    File("a.pdf", 2 B)\n  ]\n}',
    );
  });
});
