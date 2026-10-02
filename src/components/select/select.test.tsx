import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '.';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';

const options = (
  <>
    <option value="">Choose a country</option>
    <option value="tr">Türkiye</option>
    <option value="de">Germany</option>
  </>
);

describe('Select', () => {
  it('selects an option when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Country">{options}</Select>);
    const select = screen.getByRole('combobox', { name: 'Country' });

    await user.selectOptions(select, 'Germany');
    expect(select).toHaveValue('de');
    expect(screen.getByRole('option', { name: 'Germany' })).toHaveProperty('selected', true);
  });

  it('works as a controlled select', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('tr');
      return (
        <Select
          aria-label="Country"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onValue(e.target.value);
          }}
        >
          {options}
        </Select>
      );
    }
    render(<Controlled />);
    const select = screen.getByRole('combobox', { name: 'Country' });
    expect(select).toHaveValue('tr');

    await user.selectOptions(select, 'de');
    expect(select).toHaveValue('de');
    expect(onValue).toHaveBeenCalledWith('de');
  });

  it('is reachable with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Country">{options}</Select>);

    await user.tab();
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveFocus();
  });

  it('is announced as invalid when invalid is set', () => {
    render(
      <Select aria-label="Country" invalid>
        {options}
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Country' })).toBeInvalid();
  });

  it('is disabled when disabled is set', () => {
    render(
      <Select aria-label="Country" disabled>
        {options}
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Country' })).toBeDisabled();
  });

  it('joins a FormField for label, description and error', () => {
    render(
      <FormField invalid required>
        <FormLabel>Country</FormLabel>
        <Select>{options}</Select>
        <FormDescription>Used for tax calculation.</FormDescription>
        <FormMessage>Choose a country.</FormMessage>
      </FormField>,
    );
    const select = screen.getByRole('combobox', { name: /Country/ });

    expect(select).toBeInvalid();
    expect(select).toBeRequired();
    expect(select).toHaveAccessibleDescription('Used for tax calculation. Choose a country.');
  });

  it('forwards ref to the select element', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select aria-label="Country" ref={ref}>
        {options}
      </Select>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });
});
