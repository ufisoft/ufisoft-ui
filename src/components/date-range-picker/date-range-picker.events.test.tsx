import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DateRangePicker } from '.';
import { names, recordEvents } from '../../test/record-events';

const oct = (d: number) => new Date(2026, 9, d);

describe('DateRangePicker events', () => {
  it('emits open, two changes and close for a calendar pick, nothing from its inner parts', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(
      <DateRangePicker aria-label="Stay" id="stay" defaultValue={{ from: oct(3), to: null }} />,
    );

    await user.click(screen.getByRole('button', { name: 'Choose dates' }));
    await user.click(screen.getByRole('button', { name: /October 5th, 2026/ }));
    expect(names(events)).toEqual([
      'daterangepicker.state.onOpen',
      'daterangepicker.state.onChange',
      'daterangepicker.state.onClose',
    ]);
    expect(events[1]?.payload).toEqual({
      value: { from: oct(3), to: oct(5) },
      previousValue: { from: oct(3), to: null },
      source: { id: 'stay' },
    });
    expect(events[2]?.payload).toEqual({
      value: { from: oct(3), to: oct(5) },
      source: { id: 'stay' },
    });
  });

  it('emits onChange for typed dates', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    render(<DateRangePicker aria-label="Stay" />);

    await user.type(screen.getByRole('textbox', { name: 'Start date' }), '10/03/2026');
    await user.tab();
    expect(events).toEqual([
      {
        name: 'daterangepicker.state.onChange',
        payload: {
          value: { from: oct(3), to: null },
          previousValue: { from: null, to: null },
          source: {},
        },
      },
    ]);
  });
});
