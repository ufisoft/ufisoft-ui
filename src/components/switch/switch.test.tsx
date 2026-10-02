import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '.';
import { FormDescription, FormField } from '../form-field';

describe('Switch', () => {
  it('toggles when its label is clicked', async () => {
    const user = userEvent.setup();
    render(<Switch>Email notifications</Switch>);
    const toggle = screen.getByRole('switch', { name: 'Email notifications' });
    expect(toggle).not.toBeChecked();

    await user.click(screen.getByText('Email notifications'));
    expect(toggle).toBeChecked();
  });

  it('toggles with the Space key', async () => {
    const user = userEvent.setup();
    render(<Switch defaultChecked>Dark mode</Switch>);
    const toggle = screen.getByRole('switch', { name: 'Dark mode' });

    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(' ');
    expect(toggle).not.toBeChecked();
  });

  it('works as a controlled switch', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    function Controlled() {
      const [on, setOn] = useState(false);
      return (
        <Switch
          checked={on}
          onChange={(e) => {
            setOn(e.target.checked);
            onCheckedChange(e.target.checked);
          }}
        >
          Autosave
        </Switch>
      );
    }
    render(<Controlled />);

    await user.click(screen.getByRole('switch', { name: 'Autosave' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch', { name: 'Autosave' })).toBeChecked();
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(<Switch disabled>Autosave</Switch>);
    const toggle = screen.getByRole('switch', { name: 'Autosave' });

    await user.click(toggle);
    expect(toggle).toBeDisabled();
    expect(toggle).not.toBeChecked();
  });

  it('is described and disabled by a FormField', () => {
    render(
      <FormField disabled>
        <Switch>Autosave</Switch>
        <FormDescription>Saves a draft every minute.</FormDescription>
      </FormField>,
    );
    const toggle = screen.getByRole('switch', { name: 'Autosave' });

    expect(toggle).toHaveAccessibleDescription('Saves a draft every minute.');
    expect(toggle).toBeDisabled();
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref}>Autosave</Switch>);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
