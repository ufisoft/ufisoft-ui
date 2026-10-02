import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { FormDescription, FormField, FormLabel, FormMessage, useFormField } from '.';
import { Input } from '../input';

describe('FormField', () => {
  it('labels the control and describes it with description and message', () => {
    render(
      <FormField invalid>
        <FormLabel>Email</FormLabel>
        <Input />
        <FormDescription>We never share it.</FormDescription>
        <FormMessage>Enter a valid email.</FormMessage>
      </FormField>,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAccessibleDescription('We never share it. Enter a valid email.');
    expect(input).toBeInvalid();
  });

  it('only references descriptions that are rendered', async () => {
    const user = userEvent.setup();
    function Example() {
      const [error, setError] = useState<string | null>('Required');
      return (
        <FormField invalid={error !== null}>
          <FormLabel>Name</FormLabel>
          <Input />
          {error && <FormMessage>{error}</FormMessage>}
          <button type="button" onClick={() => setError(null)}>
            Clear
          </button>
        </FormField>
      );
    }
    render(<Example />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAccessibleDescription('Required');

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).toBeValid();
  });

  it('passes required and disabled state to the control', () => {
    render(
      <FormField required disabled>
        <FormLabel>Email</FormLabel>
        <Input />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });

  it('lets props on the control win over field state', () => {
    render(
      <FormField disabled>
        <FormLabel>Email</FormLabel>
        <Input disabled={false} />
      </FormField>,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeEnabled();
  });

  it('uses controlId as the control id while keeping the label linked', () => {
    render(
      <FormField controlId="email">
        <FormLabel>Email</FormLabel>
        <Input />
      </FormField>,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('id', 'email');
  });

  it('connects custom controls through useFormField', () => {
    function CustomControl() {
      const props = useFormField({});
      return <textarea {...props} />;
    }
    render(
      <FormField>
        <FormLabel>Notes</FormLabel>
        <CustomControl />
        <FormDescription>Optional.</FormDescription>
      </FormField>,
    );
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAccessibleDescription('Optional.');
  });
});
