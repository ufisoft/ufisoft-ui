import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { tr } from 'date-fns/locale/tr';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TimeRangePicker, type TimeRange, type TimeRangePickerProps } from '.';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';

function Hours(props: Partial<TimeRangePickerProps>) {
  return <TimeRangePicker aria-label="Opening hours" {...props} />;
}

const start = () => screen.getByRole('combobox', { name: 'Start time' });
const end = () => screen.getByRole('combobox', { name: 'End time' });
const labels = () => screen.getAllByRole('option').map((option) => option.textContent);

describe('TimeRangePicker', () => {
  it('shows the range in two labelled fields inside a named group', () => {
    render(<Hours locale={tr} defaultValue={{ from: '09:00', to: '17:30' }} />);
    expect(screen.getByRole('group', { name: 'Opening hours' })).toBeInTheDocument();
    expect(start()).toHaveValue('09:00');
    expect(end()).toHaveValue('17:30');
  });

  it('turns typed text into the start and end times', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Hours locale={tr} onValueChange={onValueChange} />);

    await user.type(start(), '9:15');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith({ from: '09:15', to: null });

    await user.type(end(), '17.45{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith({ from: '09:15', to: '17:45' });
    expect(end()).toHaveValue('17:45');
  });

  it('picks times from the lists, the end list starting at the start', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Hours
        locale={tr}
        min="08:00"
        max="12:00"
        step={60}
        defaultValue={{ from: null, to: '11:00' }}
        onValueChange={onValueChange}
      />,
    );

    await user.click(start());
    expect(labels()).toEqual(['08:00', '09:00', '10:00', '11:00']);
    await user.click(screen.getByRole('option', { name: '10:00' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: '10:00', to: '11:00' });

    await user.click(end());
    expect(labels()).toEqual(['10:00', '11:00', '12:00']);
  });

  it('undoes a start after the end, an end before the start and times outside min/max', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Hours
        locale={tr}
        defaultValue={{ from: '09:00', to: '17:00' }}
        max="20:00"
        onValueChange={onValueChange}
      />,
    );

    await user.clear(start());
    await user.type(start(), '18:00');
    await user.tab();
    expect(start()).toHaveValue('09:00');

    await user.clear(end());
    await user.type(end(), '08:00');
    await user.tab();
    expect(end()).toHaveValue('17:00');

    await user.clear(end());
    await user.type(end(), '21:00');
    await user.tab();
    expect(end()).toHaveValue('17:00');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('clears one end when its field is emptied', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Hours defaultValue={{ from: '09:00', to: '17:00' }} onValueChange={onValueChange} />);

    await user.clear(start());
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith({ from: null, to: '17:00' });
  });

  it('submits HH:mm under the start and end names', () => {
    render(
      <form aria-label="Shop">
        <Hours startName="opens" endName="closes" defaultValue={{ from: '09:00', to: null }} />
      </form>,
    );
    const data = new FormData(screen.getByRole('form', { name: 'Shop' }) as HTMLFormElement);
    expect(data.get('opens')).toBe('09:00');
    expect(data.get('closes')).toBe('');
  });

  it('follows a controlled value', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [range, setRange] = useState<TimeRange>({ from: '09:00', to: '17:00' });
      return (
        <>
          <Hours value={range} onValueChange={setRange} />
          <button type="button" onClick={() => setRange({ from: null, to: null })}>
            Reset
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(start()).toHaveValue('9:00 AM');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(start()).toHaveValue('');
    expect(end()).toHaveValue('');
  });

  it('translates field names', () => {
    render(
      <TimeRangePicker
        aria-label="Çalışma saatleri"
        locale={tr}
        startLabel="Açılış"
        endLabel="Kapanış"
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Açılış' })).toHaveAttribute(
      'placeholder',
      'hh:mm',
    );
    expect(screen.getByRole('combobox', { name: 'Kapanış' })).toBeInTheDocument();
  });

  it('disables both fields', () => {
    render(<Hours disabled />);
    expect(start()).toBeDisabled();
    expect(end()).toBeDisabled();
  });

  it('joins a FormField: group label, description, error and states', async () => {
    const user = userEvent.setup();
    render(
      <FormField invalid required>
        <FormLabel>Opening hours</FormLabel>
        <TimeRangePicker />
        <FormDescription>Local time.</FormDescription>
        <FormMessage>Choose the hours.</FormMessage>
      </FormField>,
    );
    expect(screen.getByRole('group', { name: /Opening hours/ })).toBeInTheDocument();
    for (const input of [start(), end()]) {
      expect(input).toBeInvalid();
      expect(input).toBeRequired();
      expect(input).toHaveAccessibleDescription('Local time. Choose the hours.');
    }
    await user.click(screen.getByText('Opening hours'));
    expect(start()).toHaveFocus();
  });

  it('forwards ref to the group element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Hours ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Opening hours' }));
  });
});
