import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from '.';

const icon = <svg data-testid="icon" />;

describe('IconButton', () => {
  it('is named by aria-label, not by its icon', () => {
    render(<IconButton aria-label="Delete item" icon={icon} />);
    expect(screen.getByRole('button', { name: 'Delete item' })).toBeInTheDocument();
  });

  it('hides the icon from assistive technology', () => {
    render(<IconButton aria-label="Delete item" icon={icon} />);
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onClick when activated', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton aria-label="Delete item" icon={icon} onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Delete item' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
