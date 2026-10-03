import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Progress } from '.';
import { Label } from '../label';

describe('Progress', () => {
  it('exposes the amount done to assistive technology', () => {
    render(<Progress aria-label="Upload" value={40} />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveValue(40);
    expect(bar).toHaveAttribute('max', '100');
  });

  it('is indeterminate without a value', () => {
    render(<Progress aria-label="Loading" />);
    expect(screen.getByRole('progressbar', { name: 'Loading' })).not.toHaveAttribute('value');
  });

  it('clamps values to 0..max', () => {
    const { rerender } = render(<Progress aria-label="Steps" value={7} max={5} />);
    expect(screen.getByRole('progressbar')).toHaveValue(5);

    rerender(<Progress aria-label="Steps" value={-2} max={5} />);
    expect(screen.getByRole('progressbar')).toHaveValue(0);
  });

  it('is named by a label element', () => {
    render(
      <>
        <Label htmlFor="disk">Disk usage</Label>
        <Progress id="disk" value={70} />
      </>,
    );
    expect(screen.getByRole('progressbar', { name: 'Disk usage' })).toHaveValue(70);
  });

  it('merges className and forwards ref', () => {
    const ref = createRef<HTMLProgressElement>();
    render(<Progress ref={ref} aria-label="Upload" value={10} className="upload" />);
    expect(ref.current).toBe(screen.getByRole('progressbar'));
    expect(ref.current).toHaveClass('upload');
  });
});
