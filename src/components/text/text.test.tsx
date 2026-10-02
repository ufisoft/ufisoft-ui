import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Text } from '.';

describe('Text', () => {
  it('renders a paragraph by default', () => {
    render(<Text>Body copy</Text>);
    expect(screen.getByText('Body copy').tagName).toBe('P');
  });

  it('renders the element given in `as`', () => {
    render(<Text as="strong">Important</Text>);
    expect(screen.getByText('Important').tagName).toBe('STRONG');
  });

  it('merges a consumer className', () => {
    render(<Text className="custom">Copy</Text>);
    expect(screen.getByText('Copy')).toHaveClass('custom');
  });
});
