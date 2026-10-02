import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Stack } from '.';

describe('Stack', () => {
  it('renders its children', () => {
    render(
      <Stack>
        <span>One</span>
        <span>Two</span>
      </Stack>,
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('keeps list semantics when rendered as a list', () => {
    render(
      <Stack as="ul">
        <li>One</li>
        <li>Two</li>
      </Stack>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
