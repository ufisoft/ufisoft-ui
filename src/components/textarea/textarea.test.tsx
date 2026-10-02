import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from '.';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';

describe('Textarea', () => {
  it('accepts multi-line text when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.type(textarea, 'line 1{Enter}line 2');
    expect(textarea).toHaveValue('line 1\nline 2');
  });

  it('works as a controlled textarea', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <Textarea
          aria-label="Notes"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toUpperCase());
            onValue(e.target.value);
          }}
        />
      );
    }
    render(<Controlled />);

    await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'ab');
    expect(screen.getByRole('textbox')).toHaveValue('AB');
    expect(onValue).toHaveBeenLastCalledWith('Ab');
  });

  it('is announced as invalid when invalid is set', () => {
    render(<Textarea aria-label="Notes" invalid />);
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInvalid();
  });

  it('does not accept input when disabled', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" disabled />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.type(textarea, 'x');
    expect(textarea).toHaveValue('');
  });

  it('joins a FormField for label, description and error', () => {
    render(
      <FormField invalid required>
        <FormLabel>Comment</FormLabel>
        <Textarea />
        <FormDescription>Visible to the whole team.</FormDescription>
        <FormMessage>Comment is required.</FormMessage>
      </FormField>,
    );
    const textarea = screen.getByRole('textbox', { name: /Comment/ });

    expect(textarea).toBeInvalid();
    expect(textarea).toBeRequired();
    expect(textarea).toHaveAccessibleDescription('Visible to the whole team. Comment is required.');
  });

  it('forwards ref to the textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="Notes" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
