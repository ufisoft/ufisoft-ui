import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading } from '.';

describe('Heading', () => {
  it('renders an h2 by default', () => {
    render(<Heading>Orders</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Orders' })).toBeInTheDocument();
  });

  it('renders the requested outline level regardless of visual size', () => {
    render(
      <Heading level={1} size="sm">
        Dashboard
      </Heading>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  });

  it('passes native attributes through', () => {
    render(<Heading id="section-title">Settings</Heading>);
    expect(screen.getByRole('heading', { name: 'Settings' })).toHaveAttribute(
      'id',
      'section-title',
    );
  });
});
