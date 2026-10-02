import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '.';

describe('Checkbox', () => {
  it('toggles when its label is clicked', async () => {
    const user = userEvent.setup();
    render(<Checkbox>Remember me</Checkbox>);
    const checkbox = screen.getByRole('checkbox', { name: 'Remember me' });

    await user.click(screen.getByText('Remember me'));
    expect(checkbox).toBeChecked();
  });

  it('toggles with the Space key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Remember me</Checkbox>);

    await user.tab();
    await user.keyboard(' ');
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('exposes the mixed state when indeterminate', () => {
    render(<Checkbox indeterminate>Select all</Checkbox>);
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toBePartiallyChecked();
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(<Checkbox disabled>Remember me</Checkbox>);

    await user.click(screen.getByText('Remember me'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref}>Remember me</Checkbox>);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
