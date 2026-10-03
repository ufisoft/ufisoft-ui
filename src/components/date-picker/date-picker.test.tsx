import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { tr } from 'react-day-picker/locale';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker, type DatePickerProps } from '.';
import { eventBus } from '../../events/registry';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';

function Due(props: Partial<DatePickerProps>) {
  return <DatePicker aria-label="Due date" {...props} />;
}

const input = () => screen.getByRole('textbox', { name: 'Due date' });
const calendarButton = () => screen.getByRole('button', { name: 'Choose date' });
const day = (name: RegExp) => screen.getByRole('button', { name });

describe('DatePicker', () => {
  it('shows the value in the locale’s short date format', () => {
    const { rerender } = render(<Due defaultValue={new Date(2026, 9, 3)} />);
    expect(input()).toHaveValue('10/03/2026');

    rerender(<Due key="tr" locale={tr} defaultValue={new Date(2026, 9, 3)} />);
    expect(input()).toHaveValue('03.10.2026');
    expect(input()).toHaveAttribute('placeholder', 'dd.mm.yyyy');
  });

  it('turns typed text into a date on blur', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Due locale={tr} onValueChange={onValueChange} />);

    await user.type(input(), '3.10.2026');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 3));
    expect(input()).toHaveValue('03.10.2026');
  });

  it('commits on Enter and clears when emptied', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Due locale={tr} defaultValue={new Date(2026, 9, 3)} onValueChange={onValueChange} />);

    await user.clear(input());
    await user.type(input(), '15.11.2026{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 10, 15));

    await user.clear(input());
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it('undoes text that is not a valid date in range', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Due
        locale={tr}
        defaultValue={new Date(2026, 9, 3)}
        max={new Date(2026, 11, 31)}
        onValueChange={onValueChange}
      />,
    );

    for (const text of ['31.02.2026', '3.1.26', '01.01.2027', 'tomorrow']) {
      await user.clear(input());
      await user.type(input(), text);
      await user.tab();
      expect(input()).toHaveValue('03.10.2026');
    }
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('picks a date from the calendar and returns focus to the button', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Due defaultValue={new Date(2026, 9, 3)} onValueChange={onValueChange} />);

    await user.click(calendarButton());
    expect(screen.getByRole('dialog', { name: 'Choose date' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
    expect(day(/October 3rd, 2026/)).toHaveFocus();

    await user.click(day(/October 20th, 2026/));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 20));
    expect(input()).toHaveValue('10/20/2026');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(calendarButton()).toHaveFocus();
  });

  it('moves through the calendar with the keyboard', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Due defaultValue={new Date(2026, 9, 3)} onValueChange={onValueChange} />);

    calendarButton().focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowDown}{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 11));

    await user.keyboard('{Enter}');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(calendarButton()).toHaveFocus();
  });

  it('disables days outside min and max', async () => {
    const user = userEvent.setup();
    render(
      <Due
        defaultValue={new Date(2026, 9, 10)}
        min={new Date(2026, 9, 5)}
        max={new Date(2026, 9, 20)}
      />,
    );

    await user.click(calendarButton());
    expect(day(/October 4th, 2026/)).toBeDisabled();
    expect(day(/October 5th, 2026/)).toBeEnabled();
    expect(day(/October 21st, 2026/)).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous month/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('translates the calendar with a locale', async () => {
    const user = userEvent.setup();
    render(<Due locale={tr} calendarLabel="Tarih seç" defaultValue={new Date(2026, 9, 15)} />);

    await user.click(screen.getByRole('button', { name: 'Tarih seç' }));
    expect(screen.getByRole('grid', { name: /Ekim 2026/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^15 Ekim 2026 Perşembe, seçili$/ })).toHaveFocus();
  });

  it('submits an ISO date under its name', () => {
    render(
      <form aria-label="Task">
        <Due name="due" defaultValue={new Date(2026, 9, 3)} />
      </form>,
    );
    const data = new FormData(screen.getByRole('form', { name: 'Task' }) as HTMLFormElement);
    expect(data.get('due')).toBe('2026-10-03');
  });

  it('follows a controlled value', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [date, setDate] = useState<Date | null>(new Date(2026, 0, 1));
      return (
        <>
          <Due value={date} onValueChange={setDate} />
          <button type="button" onClick={() => setDate(new Date(2026, 4, 19))}>
            Set May 19
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(input()).toHaveValue('01/01/2026');

    await user.click(screen.getByRole('button', { name: 'Set May 19' }));
    expect(input()).toHaveValue('05/19/2026');
  });

  it('disables the field and the calendar button', () => {
    render(<Due disabled />);
    expect(input()).toBeDisabled();
    expect(calendarButton()).toBeDisabled();
  });

  it('joins a FormField for label, description and error', () => {
    render(
      <FormField invalid required disabled>
        <FormLabel>Due date</FormLabel>
        <DatePicker />
        <FormDescription>When the task must be done.</FormDescription>
        <FormMessage>Choose a date.</FormMessage>
      </FormField>,
    );
    const field = screen.getByRole('textbox', { name: /Due date/ });
    expect(field).toBeInvalid();
    expect(field).toBeRequired();
    expect(field).toBeDisabled();
    expect(field).toHaveAccessibleDescription('When the task must be done. Choose a date.');
    expect(calendarButton()).toBeDisabled();
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Due ref={ref} />);
    expect(ref.current).toBe(input());
  });
});

describe('DatePicker events', () => {
  function record() {
    const events: { name: string; payload: unknown }[] = [];
    eventBus.onAny(({ name, payload }) => events.push({ name, payload }));
    return events;
  }

  it('emits datepicker.state.onChange with the value, previous value and source', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const listener = vi.fn();
    eventBus.on('datepicker.state.onChange', listener);
    render(
      <Due
        locale={tr}
        name="due"
        eventData={{ taskId: 7 }}
        defaultValue={new Date(2026, 9, 3)}
        onValueChange={onValueChange}
      />,
    );

    await user.clear(input());
    await user.type(input(), '05.10.2026');
    await user.tab();
    // The existing callback keeps working next to the event.
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 5));
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(
      {
        value: new Date(2026, 9, 5),
        previousValue: new Date(2026, 9, 3),
        source: { name: 'due', data: { taskId: 7 } },
      },
      { name: 'datepicker.state.onChange', timestamp: expect.any(Number) },
    );
  });

  it('emits open, change and close for a calendar pick, and nothing from its inner parts', async () => {
    const user = userEvent.setup();
    const events = record();
    render(<Due id="due" defaultValue={new Date(2026, 9, 3)} />);

    await user.click(calendarButton());
    await user.click(day(/October 10th, 2026/));
    expect(events.map((event) => event.name)).toEqual([
      'datepicker.state.onOpen',
      'datepicker.state.onChange',
      'datepicker.state.onClose',
    ]);
    expect(events[0]?.payload).toEqual({ value: new Date(2026, 9, 3), source: { id: 'due' } });
    expect(events[2]?.payload).toEqual({ value: new Date(2026, 9, 10), source: { id: 'due' } });
  });

  it('emits onClose when the calendar is dismissed', async () => {
    const user = userEvent.setup();
    const events = record();
    render(<Due />);

    await user.click(calendarButton());
    await user.keyboard('{Escape}');
    expect(events.map((event) => event.name)).toEqual([
      'datepicker.state.onOpen',
      'datepicker.state.onClose',
    ]);
  });

  it('emits onChange then onClear when the field is emptied', async () => {
    const user = userEvent.setup();
    const events = record();
    render(<Due defaultValue={new Date(2026, 9, 3)} />);

    await user.clear(input());
    await user.tab();
    expect(events).toEqual([
      {
        name: 'datepicker.state.onChange',
        payload: { value: null, previousValue: new Date(2026, 9, 3), source: {} },
      },
      {
        name: 'datepicker.state.onClear',
        payload: { previousValue: new Date(2026, 9, 3), source: {} },
      },
    ]);
  });

  it('emits nothing when the value does not change', async () => {
    const user = userEvent.setup();
    const events = record();
    render(<Due locale={tr} defaultValue={new Date(2026, 9, 3)} />);

    await user.click(input());
    await user.tab();
    expect(events).toEqual([]);
  });

  it('reports the controlled value as previousValue', async () => {
    const user = userEvent.setup();
    const listener = vi.fn();
    eventBus.on('datepicker.state.onChange', listener);
    function Controlled() {
      const [date, setDate] = useState<Date | null>(new Date(2026, 9, 1));
      return <Due locale={tr} value={date} onValueChange={setDate} />;
    }
    render(<Controlled />);

    await user.clear(input());
    await user.type(input(), '02.10.2026{Enter}');
    await user.clear(input());
    await user.type(input(), '04.10.2026{Enter}');
    expect(listener.mock.calls.map(([payload]) => payload.previousValue)).toEqual([
      new Date(2026, 9, 1),
      new Date(2026, 9, 2),
    ]);
  });
});
