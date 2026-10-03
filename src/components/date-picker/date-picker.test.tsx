import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { tr } from 'react-day-picker/locale';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker, type DatePickerProps } from '.';
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
