import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { tr } from 'date-fns/locale/tr';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker, type TimePickerProps } from '.';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';

function Start(props: Partial<TimePickerProps>) {
  return <TimePicker aria-label="Start time" {...props} />;
}

const input = () => screen.getByRole('combobox', { name: 'Start time' });
const labels = () => screen.getAllByRole('option').map((option) => option.textContent);

describe('TimePicker', () => {
  it('shows the value in the locale’s short time format', () => {
    const { rerender } = render(<Start defaultValue="14:30" />);
    expect(input()).toHaveValue('2:30 PM');

    rerender(<Start key="tr" locale={tr} defaultValue="14:30" />);
    expect(input()).toHaveValue('14:30');
    expect(input()).toHaveAttribute('placeholder', 'hh:mm');
  });

  it('lists times every step within min and max', async () => {
    const user = userEvent.setup();
    render(<Start locale={tr} min="09:00" max="11:00" step={30} />);

    await user.click(input());
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(labels()).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00']);
  });

  it('narrows the list as the user types', async () => {
    const user = userEvent.setup();
    render(<Start />);

    await user.type(input(), '9:3');
    expect(labels()).toEqual(['9:30 AM', '9:30 PM']);
  });

  it('picks a time with the keyboard and highlights it on reopen', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Start locale={tr} min="08:00" max="10:00" onValueChange={onValueChange} />);

    await user.click(input());
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('08:30');
    expect(input()).toHaveValue('08:30');
    expect(input()).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{ArrowDown}');
    expect(input()).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: '08:30' }).id,
    );
  });

  it('picks a time with the mouse', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Start locale={tr} onValueChange={onValueChange} />);

    await user.click(input());
    await user.click(screen.getByRole('option', { name: '13:00' }));
    expect(onValueChange).toHaveBeenLastCalledWith('13:00');
    expect(input()).toHaveValue('13:00');
  });

  it('accepts typed times that are not in the list', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Start onValueChange={onValueChange} />);

    for (const [typed, value, shown] of [
      ['9:05', '09:05', '9:05 AM'],
      ['21:45', '21:45', '9:45 PM'],
      ['7 pm', '19:00', '7:00 PM'],
      ['0815', '08:15', '8:15 AM'],
    ] as const) {
      await user.clear(input());
      await user.type(input(), typed);
      await user.tab();
      expect(onValueChange).toHaveBeenLastCalledWith(value);
      expect(input()).toHaveValue(shown);
    }
  });

  it('commits typed text on Enter', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Start locale={tr} onValueChange={onValueChange} />);

    await user.type(input(), '17.20{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('17:20');
    expect(input()).toHaveValue('17:20');
  });

  it('undoes text that is not a time in range, and clears when emptied', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Start locale={tr} defaultValue="10:00" max="18:00" onValueChange={onValueChange} />);

    for (const typed of ['25:00', '19:00', 'soon']) {
      await user.clear(input());
      await user.type(input(), typed);
      await user.tab();
      expect(input()).toHaveValue('10:00');
    }
    expect(onValueChange).not.toHaveBeenCalled();

    await user.clear(input());
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it('closes the list with Escape without clearing, and lets a closed Escape through', async () => {
    const user = userEvent.setup();
    render(<Start locale={tr} defaultValue="10:00" />);

    await user.click(input());
    expect(fireEvent.keyDown(input(), { key: 'Escape' })).toBe(false);
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).toHaveValue('10:00');

    // Not prevented, so a surrounding modal <dialog> closes as usual.
    expect(fireEvent.keyDown(input(), { key: 'Escape' })).toBe(true);
    expect(input()).toHaveValue('10:00');
  });

  it('keeps an off-list value when it changes from a listed one', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [time, setTime] = useState<string | null>('09:00');
      return (
        <>
          <Start locale={tr} value={time} onValueChange={setTime} />
          <button type="button" onClick={() => setTime('09:07')}>
            Set 09:07
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(input()).toHaveValue('09:00');

    await user.click(screen.getByRole('button', { name: 'Set 09:07' }));
    expect(input()).toHaveValue('09:07');
  });

  it('submits HH:mm under its name', () => {
    render(
      <form aria-label="Meeting">
        <Start name="start" defaultValue="14:30" />
      </form>,
    );
    const data = new FormData(screen.getByRole('form', { name: 'Meeting' }) as HTMLFormElement);
    expect(data.get('start')).toBe('14:30');
  });

  it('joins a FormField for label, description and error', () => {
    render(
      <FormField invalid required>
        <FormLabel>Start time</FormLabel>
        <TimePicker />
        <FormDescription>Local time.</FormDescription>
        <FormMessage>Choose a time.</FormMessage>
      </FormField>,
    );
    const field = screen.getByRole('combobox', { name: /Start time/ });
    expect(field).toBeInvalid();
    expect(field).toBeRequired();
    expect(field).toHaveAccessibleDescription('Local time. Choose a time.');
  });

  it('is disabled', () => {
    render(<Start disabled />);
    expect(input()).toBeDisabled();
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Start ref={ref} />);
    expect(ref.current).toBe(input());
  });
});
