import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Radio, RadioGroup, type RadioGroupProps } from '.';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';

function Plans(props: Omit<RadioGroupProps, 'children'>) {
  return (
    <RadioGroup aria-label="Plan" {...props}>
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team">Team</Radio>
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('selects one option at a time when uncontrolled', async () => {
    const user = userEvent.setup();
    render(<Plans defaultValue="free" />);
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Free' })).not.toBeChecked();
  });

  it('works as a controlled group', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('free');
      return (
        <Plans
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onValueChange(next);
          }}
        />
      );
    }
    render(<Controlled />);

    await user.click(screen.getByText('Team'));
    expect(onValueChange).toHaveBeenCalledWith('team');
    expect(screen.getByRole('radio', { name: 'Team' })).toBeChecked();
  });

  it('moves the selection with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Plans defaultValue="free" />);

    await user.tab();
    expect(screen.getByRole('radio', { name: 'Free' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Pro' })).toHaveFocus();
  });

  it('disables every radio when the group is disabled', () => {
    render(<Plans disabled />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
  });

  it('is named, described and validated by a FormField', () => {
    render(
      <FormField invalid required>
        <FormLabel>Plan</FormLabel>
        <RadioGroup>
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
        </RadioGroup>
        <FormDescription>You can change it later.</FormDescription>
        <FormMessage>Choose a plan.</FormMessage>
      </FormField>,
    );
    const group = screen.getByRole('radiogroup', { name: /Plan/ });

    expect(group).toHaveAccessibleDescription('You can change it later. Choose a plan.');
    expect(group).toBeInvalid();
    expect(group).toHaveAttribute('aria-required', 'true');
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeRequired();
  });
});

describe('Radio', () => {
  it('is labelled by its children', () => {
    render(<Radio value="yes">Yes</Radio>);
    expect(screen.getByRole('radio', { name: 'Yes' })).not.toBeChecked();
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Radio value="yes" ref={ref}>
        Yes
      </Radio>,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
