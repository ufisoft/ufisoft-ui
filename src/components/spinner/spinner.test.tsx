import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from '.';

describe('Spinner', () => {
  it('is announced as a status with a default label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('uses a custom label', () => {
    render(<Spinner label="Saving changes" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saving changes');
  });
});
