import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Combobox, type ComboboxProps } from '.';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';

const cities = [
  { value: 'ist', label: 'İstanbul' },
  { value: 'ank', label: 'Ankara' },
  { value: 'izm', label: 'İzmir' },
  { value: 'can', label: 'Çanakkale' },
  { value: 'krk', label: 'Kırklareli', disabled: true },
];

function City(props: Partial<ComboboxProps>) {
  return <Combobox aria-label="City" items={cities} {...props} />;
}

const input = () => screen.getByRole('combobox', { name: 'City' });

describe('Combobox', () => {
  it('opens a listbox of all options on click', async () => {
    const user = userEvent.setup();
    render(<City />);
    expect(input()).toHaveAttribute('aria-expanded', 'false');

    await user.click(input());
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('filters ignoring case and Turkish accents', async () => {
    const user = userEvent.setup();
    render(<City />);

    await user.type(input(), 'canak');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Çanakkale']);

    await user.clear(input());
    await user.type(input(), 'iz');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['İzmir']);
  });

  it('selects with the keyboard and calls onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<City onValueChange={onValueChange} />);

    await user.type(input(), 'ank');
    await user.keyboard('{ArrowDown}');
    expect(input()).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Ankara' }).id,
    );
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenLastCalledWith('ank');
    expect(input()).toHaveValue('Ankara');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
  });

  it('selects with the mouse and skips disabled options', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<City onValueChange={onValueChange} />);

    await user.click(input());
    expect(screen.getByRole('option', { name: 'Kırklareli' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await user.click(screen.getByRole('option', { name: 'Kırklareli' }));
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('option', { name: 'İzmir' }));
    expect(onValueChange).toHaveBeenLastCalledWith('izm');
    expect(input()).toHaveValue('İzmir');
  });

  it('shows the empty message and announces the number of results', async () => {
    const user = userEvent.setup();
    render(<City emptyMessage="No cities found" />);

    await user.type(input(), 'xyz');
    expect(screen.getByText('No cities found')).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();

    await user.clear(input());
    await user.type(input(), 'a');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/results available/));
  });

  it('restores the selection on blur and clears it with Escape', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <City defaultValue="ank" onValueChange={onValueChange} />
        <button type="button">Next</button>
      </>,
    );
    expect(input()).toHaveValue('Ankara');

    await user.clear(input());
    await user.type(input(), 'zzz');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(input()).toHaveValue('Ankara');

    await user.click(input());
    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');
    expect(input()).toHaveValue('');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it('keeps a clearing Escape from closing a surrounding dialog', () => {
    render(<City defaultValue="ank" />);
    // A prevented keydown does not trigger the dialog's cancel; an unprevented one does.
    expect(fireEvent.keyDown(input(), { key: 'Escape' })).toBe(false);
    expect(input()).toHaveValue('');
    expect(fireEvent.keyDown(input(), { key: 'Escape' })).toBe(true);
  });

  it('follows a controlled value', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState<string | null>('ist');
      return (
        <>
          <City value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue('can')}>
            Pick Çanakkale
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(input()).toHaveValue('İstanbul');

    await user.click(screen.getByRole('button', { name: 'Pick Çanakkale' }));
    expect(input()).toHaveValue('Çanakkale');
  });

  it('joins a FormField for label, description and error', () => {
    render(
      <FormField invalid required>
        <FormLabel>City</FormLabel>
        <Combobox items={cities} />
        <FormDescription>Where the event takes place.</FormDescription>
        <FormMessage>Choose a city.</FormMessage>
      </FormField>,
    );
    const field = screen.getByRole('combobox', { name: /City/ });
    expect(field).toBeInvalid();
    expect(field).toBeRequired();
    expect(field).toHaveAccessibleDescription('Where the event takes place. Choose a city.');
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<City ref={ref} />);
    expect(ref.current).toBe(input());
  });
});
