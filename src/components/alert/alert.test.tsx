import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert } from '.';

describe('Alert', () => {
  it('announces info politely as a status', () => {
    render(<Alert title="Saved">Your changes are live.</Alert>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveTextContent('Saved');
    expect(alert).toHaveTextContent('Your changes are live.');
  });

  it('announces danger immediately as an alert', () => {
    render(<Alert tone="danger">Payment failed.</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed.');
  });

  it('allows the role to be overridden for static content', () => {
    render(
      <Alert tone="warning" role={undefined}>
        Maintenance on Sunday.
      </Alert>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Maintenance on Sunday.')).toBeInTheDocument();
  });
});
