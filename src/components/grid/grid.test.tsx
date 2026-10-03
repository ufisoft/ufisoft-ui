import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Grid } from '.';

describe('Grid', () => {
  it('renders its children', () => {
    render(
      <Grid columns={{ base: 1, md: 3 }}>
        <span>One</span>
        <span>Two</span>
      </Grid>,
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('keeps list semantics when rendered as a list', () => {
    render(
      <Grid as="ul" columns={2}>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </Grid>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('merges className and forwards ref and native props', () => {
    const ref = createRef<HTMLElement>();
    render(<Grid ref={ref} as="section" aria-label="Products" className="products" />);
    const region = screen.getByRole('region', { name: 'Products' });
    expect(ref.current).toBe(region);
    expect(region).toHaveClass('products');
  });
});
