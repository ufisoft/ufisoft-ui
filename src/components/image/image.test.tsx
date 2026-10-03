import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Image } from '.';

describe('Image', () => {
  it('renders a lazily loaded image with its alt text', () => {
    render(<Image src="/cat.jpg" alt="A cat on a sofa" ratio="4/3" />);
    const img = screen.getByRole('img', { name: 'A cat on a sofa' });
    expect(img).toHaveAttribute('src', '/cat.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('lets the native loading attribute be overridden', () => {
    render(<Image src="/hero.jpg" alt="Hero" loading="eager" />);
    expect(screen.getByRole('img', { name: 'Hero' })).toHaveAttribute('loading', 'eager');
  });

  it('shows the fallback with the same name when the image fails', () => {
    const onError = vi.fn();
    render(<Image src="/missing.jpg" alt="Product photo" fallback="No image" onError={onError} />);

    fireEvent.error(screen.getByRole('img', { name: 'Product photo' }));
    expect(onError).toHaveBeenCalledOnce();
    const fallback = screen.getByRole('img', { name: 'Product photo' });
    expect(fallback.tagName).toBe('SPAN');
    expect(fallback).toHaveTextContent('No image');
  });

  it('tries again when the source changes', () => {
    const { rerender } = render(<Image src="/missing.jpg" alt="Photo" />);
    fireEvent.error(screen.getByRole('img', { name: 'Photo' }));
    expect(screen.getByRole('img', { name: 'Photo' }).tagName).toBe('SPAN');

    rerender(<Image src="/found.jpg" alt="Photo" />);
    expect(screen.getByRole('img', { name: 'Photo' })).toHaveAttribute('src', '/found.jpg');
  });

  it('hides a decorative fallback', () => {
    const { container } = render(<Image src="" alt="" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges className and forwards ref to the img', () => {
    const ref = createRef<HTMLImageElement>();
    render(<Image ref={ref} src="/cat.jpg" alt="Cat" className="thumb" />);
    expect(ref.current).toBe(screen.getByRole('img', { name: 'Cat' }));
    expect(ref.current).toHaveClass('thumb');
  });
});
