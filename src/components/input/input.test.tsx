import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '.';

describe('Input', () => {
  it('accepts typed text when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Search" />);
    const input = screen.getByRole('textbox', { name: 'Search' });

    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('works as a controlled input', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <Input
          aria-label="Name"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toUpperCase());
            onValue(e.target.value);
          }}
        />
      );
    }
    render(<Controlled />);

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'ab');
    expect(screen.getByRole('textbox')).toHaveValue('AB');
    expect(onValue).toHaveBeenLastCalledWith('Ab');
  });

  it('is announced as invalid when invalid is set', () => {
    render(<Input aria-label="Email" invalid />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInvalid();
  });

  it('does not accept input when disabled', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Email" disabled />);
    const input = screen.getByRole('textbox', { name: 'Email' });

    await user.type(input, 'x');
    expect(input).toHaveValue('');
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="Email" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
