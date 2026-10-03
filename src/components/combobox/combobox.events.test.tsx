import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { tr } from 'date-fns/locale/tr';
import { describe, expect, it } from 'vitest';
import { Combobox } from '.';
import { names, recordEvents } from '../../test/record-events';
import { TimePicker } from '../time-picker';
import { TimeRangePicker } from '../time-range-picker';

const cities = [
  { value: 'ist', label: 'İstanbul' },
  { value: 'ank', label: 'Ankara' },
];

describe('list-based picker events', () => {
  it('Combobox emits onOpen, onChange and onClose when an option is picked', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<Combobox aria-label="City" name="city" items={cities} />);

    await user.click(screen.getByRole('combobox', { name: 'City' }));
    await user.click(screen.getByRole('option', { name: 'Ankara' }));
    expect(names(events)).toEqual([
      'combobox.state.onOpen',
      // Downshift closes the list before it reports the selection.
      'combobox.state.onClose',
      'combobox.state.onChange',
    ]);
    expect(events[1]?.payload).toEqual({
      value: 'ank',
      source: { name: 'city' },
    });
    expect(events[2]?.payload).toEqual({
      value: 'ank',
      previousValue: null,
      source: { name: 'city' },
    });
  });

  it('TimePicker emits onChange and onClear for typed text', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<TimePicker aria-label="Start" name="start" locale={tr} defaultValue="09:00" />);
    const input = screen.getByRole('combobox', { name: 'Start' });

    await user.clear(input);
    await user.type(input, '14:30{Enter}');
    await user.clear(input);
    await user.tab();
    const changes = events.filter(
      (event) => !event.name.endsWith('onOpen') && !event.name.endsWith('onClose'),
    );
    expect(changes.map((event) => [event.name, event.payload])).toEqual([
      [
        'timepicker.state.onChange',
        {
          value: '14:30',
          previousValue: '09:00',
          source: { name: 'start' },
        },
      ],
      [
        'timepicker.state.onChange',
        { value: null, previousValue: '14:30', source: { name: 'start' } },
      ],
      ['timepicker.state.onClear', { previousValue: '14:30', source: { name: 'start' } }],
    ]);
  });

  it('TimePicker emits onOpen and onClose for its list', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<TimePicker aria-label="Start" locale={tr} />);

    await user.click(screen.getByRole('combobox', { name: 'Start' }));
    await user.keyboard('{Escape}');
    expect(names(events)).toEqual(['timepicker.state.onOpen', 'timepicker.state.onClose']);
  });

  it('TimeRangePicker emits only timerangepicker.state.onChange', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<TimeRangePicker aria-label="Hours" id="hours" locale={tr} />);

    await user.type(screen.getByRole('combobox', { name: 'Start time' }), '09:00');
    await user.tab();
    expect(events).toEqual([
      {
        name: 'timerangepicker.state.onChange',
        payload: {
          value: { from: '09:00', to: null },
          previousValue: { from: null, to: null },
          source: { id: 'hours' },
        },
      },
    ]);
  });
});
