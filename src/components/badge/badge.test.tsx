import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Badge } from '.';

describe('Badge', () => {
  it('renders its text as plain inline content', () => {
    render(
      <p>
        Status: <Badge tone="success">Published</Badge>
      </p>,
    );
    const badge = screen.getByText('Published');
    expect(badge.tagName).toBe('SPAN');
    expect(badge.closest('p')).toHaveTextContent('Status: Published');
  });

  it('is not interactive', () => {
    render(<Badge>Draft</Badge>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Draft')).not.toHaveAttribute('tabindex');
  });

  it('can describe a control through its id', () => {
    render(
      <>
        <button type="button" aria-describedby="inbox-count">
          Inbox
        </button>
        <Badge id="inbox-count" tone="info">
          3 unread
        </Badge>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Inbox' })).toHaveAccessibleDescription('3 unread');
  });

  it('forwards ref to the span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>Draft</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
