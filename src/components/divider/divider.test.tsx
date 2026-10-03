import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Divider } from '.';

describe('Divider', () => {
  it('is a horizontal separator by default', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).not.toHaveAttribute('aria-orientation');
  });

  it('announces a vertical orientation', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('can be decorative', () => {
    render(<Divider role="presentation" />);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('merges className and forwards ref', () => {
    const ref = createRef<HTMLHRElement>();
    render(<Divider ref={ref} className="rule" />);
    expect(ref.current).toBe(screen.getByRole('separator'));
    expect(ref.current).toHaveClass('rule');
  });
});
