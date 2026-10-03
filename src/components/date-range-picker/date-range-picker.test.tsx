import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { tr } from 'react-day-picker/locale';
import { describe, expect, it, vi } from 'vitest';
import { DateRangePicker, type DateRange, type DateRangePickerProps } from '.';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';

function Stay(props: Partial<DateRangePickerProps>) {
  return <DateRangePicker aria-label="Stay" {...props} />;
}

const start = () => screen.getByRole('textbox', { name: 'Start date' });
const end = () => screen.getByRole('textbox', { name: 'End date' });
const calendarButton = () => screen.getByRole('button', { name: 'Choose dates' });
const day = (name: RegExp) => screen.getByRole('button', { name });

const oct = (d: number) => new Date(2026, 9, d);

describe('DateRangePicker', () => {
  it('shows the range in two labelled fields inside a named group', () => {
    render(<Stay locale={tr} defaultValue={{ from: oct(3), to: oct(7) }} />);
    expect(screen.getByRole('group', { name: 'Stay' })).toBeInTheDocument();
    expect(start()).toHaveValue('03.10.2026');
    expect(end()).toHaveValue('07.10.2026');
  });

  it('turns typed text into the start and end dates', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Stay locale={tr} onValueChange={onValueChange} />);

    await user.type(start(), '3.10.2026');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith({ from: oct(3), to: null });

    await user.type(end(), '7.10.2026{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith({ from: oct(3), to: oct(7) });
    expect(end()).toHaveValue('07.10.2026');
  });

  it('undoes a start after the end, an end before the start and invalid text', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Stay
        locale={tr}
        defaultValue={{ from: oct(3), to: oct(7) }}
        max={oct(31)}
        onValueChange={onValueChange}
      />,
    );

    await user.clear(start());
    await user.type(start(), '8.10.2026');
    await user.tab();
    expect(start()).toHaveValue('03.10.2026');

    await user.clear(end());
    await user.type(end(), '2.10.2026');
    await user.tab();
    expect(end()).toHaveValue('07.10.2026');

    await user.clear(end());
    await user.type(end(), '1.11.2026');
    await user.tab();
    expect(end()).toHaveValue('07.10.2026');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('clears one end when its field is emptied', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Stay defaultValue={{ from: oct(3), to: oct(7) }} onValueChange={onValueChange} />);

    await user.clear(end());
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith({ from: oct(3), to: null });
  });

  it('picks start and end in the calendar, then closes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Stay defaultValue={{ from: oct(3), to: oct(7) }} onValueChange={onValueChange} />);

    await user.click(calendarButton());
    expect(screen.getByRole('dialog', { name: 'Choose dates' })).toBeInTheDocument();
    expect(day(/October 3rd, 2026/)).toHaveFocus();

    // A complete range: the first click starts a new one.
    await user.click(day(/October 12th, 2026/));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: oct(12), to: null });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(day(/October 16th, 2026/));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: oct(12), to: oct(16) });
    expect(start()).toHaveValue('10/12/2026');
    expect(end()).toHaveValue('10/16/2026');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(calendarButton()).toHaveFocus();
  });

  it('orders a second click before the start', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Stay defaultValue={{ from: oct(20), to: null }} onValueChange={onValueChange} />);

    await user.click(calendarButton());
    await user.click(day(/October 10th, 2026/));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: oct(10), to: oct(20) });
  });

  it('marks the selected days in the calendar', async () => {
    const user = userEvent.setup();
    render(<Stay defaultValue={{ from: oct(3), to: oct(5) }} />);

    await user.click(calendarButton());
    for (const d of ['3rd', '4th', '5th']) {
      expect(day(new RegExp(`October ${d}, 2026, selected`))).toBeInTheDocument();
    }
    expect(day(/October 6th, 2026$/)).toBeInTheDocument();
  });

  it('disables days outside min and max', async () => {
    const user = userEvent.setup();
    render(<Stay defaultValue={{ from: oct(10), to: null }} min={oct(5)} max={oct(20)} />);

    await user.click(calendarButton());
    expect(day(/October 4th, 2026/)).toBeDisabled();
    expect(day(/October 21st, 2026/)).toBeDisabled();
  });

  it('submits ISO dates under the start and end names', () => {
    render(
      <form aria-label="Booking">
        <Stay startName="checkIn" endName="checkOut" defaultValue={{ from: oct(3), to: null }} />
      </form>,
    );
    const data = new FormData(screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement);
    expect(data.get('checkIn')).toBe('2026-10-03');
    expect(data.get('checkOut')).toBe('');
  });

  it('follows a controlled value', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [range, setRange] = useState<DateRange>({ from: oct(1), to: oct(2) });
      return (
        <>
          <Stay value={range} onValueChange={setRange} />
          <button type="button" onClick={() => setRange({ from: null, to: null })}>
            Reset
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(start()).toHaveValue('10/01/2026');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(start()).toHaveValue('');
    expect(end()).toHaveValue('');
  });

  it('translates field and button names', () => {
    render(
      <DateRangePicker
        aria-label="Konaklama"
        locale={tr}
        startLabel="Giriş"
        endLabel="Çıkış"
        calendarLabel="Tarihleri seç"
      />,
    );
    expect(screen.getByRole('textbox', { name: 'Giriş' })).toHaveAttribute(
      'placeholder',
      'dd.mm.yyyy',
    );
    expect(screen.getByRole('textbox', { name: 'Çıkış' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tarihleri seç' })).toBeInTheDocument();
  });

  it('disables both fields and the calendar button', () => {
    render(<Stay disabled />);
    expect(start()).toBeDisabled();
    expect(end()).toBeDisabled();
    expect(calendarButton()).toBeDisabled();
  });

  it('joins a FormField: group label, description, error and states', async () => {
    const user = userEvent.setup();
    render(
      <FormField invalid required>
        <FormLabel>Stay</FormLabel>
        <DateRangePicker />
        <FormDescription>Check-in and check-out.</FormDescription>
        <FormMessage>Choose your dates.</FormMessage>
      </FormField>,
    );
    expect(screen.getByRole('group', { name: /Stay/ })).toBeInTheDocument();
    for (const input of [start(), end()]) {
      expect(input).toBeInvalid();
      expect(input).toBeRequired();
      expect(input).toHaveAccessibleDescription('Check-in and check-out. Choose your dates.');
    }
    await user.click(screen.getByText('Stay'));
    expect(start()).toHaveFocus();
  });

  it('forwards ref to the group element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stay ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Stay' }));
  });
});
