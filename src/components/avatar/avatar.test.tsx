import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Avatar } from '.';

describe('Avatar', () => {
  it('shows the image with the name as its alt text', () => {
    render(<Avatar name="Ada Lovelace" src="/ada.png" />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute('src', '/ada.png');
  });

  it('shows initials as an image of the name when there is no src', () => {
    render(<Avatar name="Ada King Lovelace" />);
    const avatar = screen.getByRole('img', { name: 'Ada King Lovelace' });
    expect(avatar).toHaveTextContent('AL');
  });

  it('uses one initial for a single word and handles extra spaces', () => {
    render(<Avatar name="  Grace  " />);
    expect(screen.getByRole('img', { name: 'Grace' })).toHaveTextContent(/^G$/);
  });

  it('falls back to initials when the image fails, and retries a new src', () => {
    const { rerender } = render(<Avatar name="Ada Lovelace" src="/broken.png" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL');
    expect(screen.getByRole('img').querySelector('img')).toBeNull();

    rerender(<Avatar name="Ada Lovelace" src="/ada.png" />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute('src', '/ada.png');
  });

  it('is hidden from assistive technology when alt is empty', () => {
    render(
      <p>
        <Avatar name="Ada Lovelace" alt="" /> Ada Lovelace
      </p>,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('forwards ref to the root element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar name="Ada" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
