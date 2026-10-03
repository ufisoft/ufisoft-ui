import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from '.';

describe('Skeleton', () => {
  it('is hidden from assistive technology inside a busy region', () => {
    render(
      <section aria-label="Profile" aria-busy="true">
        <Skeleton shape="circle" />
        <Skeleton lines={3} />
      </section>,
    );
    const region = screen.getByRole('region', { name: 'Profile' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    for (const skeleton of region.children) {
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('renders one placeholder per text line', () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<Skeleton ref={ref} lines={3} />);
    expect(ref.current?.children).toHaveLength(3);

    rerender(<Skeleton ref={ref} lines={0} />);
    expect(ref.current?.children).toHaveLength(1);

    rerender(<Skeleton ref={ref} shape="rect" />);
    expect(ref.current?.children).toHaveLength(0);
  });

  it('merges className and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} shape="rect" className="thumbnail" />);
    expect(ref.current).toHaveClass('thumbnail');
  });
});
