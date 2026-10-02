import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Label } from '.';

describe('Label', () => {
  it('names the control it points to', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('focuses the control when clicked', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    await user.click(screen.getByText('Email'));
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('keeps the required marker out of the accessible name', () => {
    render(
      <>
        <Label htmlFor="email" required>
          Email
        </Label>
        <input id="email" />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });
});
