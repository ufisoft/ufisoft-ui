import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ButtonGroup } from '.';
import { Button } from '../button';

describe('ButtonGroup', () => {
  it('groups buttons under one name', () => {
    render(
      <ButtonGroup aria-label="Text alignment">
        <Button variant="secondary">Left</Button>
        <Button variant="secondary">Center</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'Text alignment' });
    expect(group).toContainElement(screen.getByRole('button', { name: 'Left' }));
  });

  it('keeps one Tab stop per button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ButtonGroup aria-label="History">
        <Button variant="secondary">Undo</Button>
        <Button variant="secondary" onClick={onClick}>
          Redo
        </Button>
      </ButtonGroup>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Redo' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('keeps the group role when vertical (group does not support aria-orientation)', () => {
    render(<ButtonGroup aria-label="Zoom" orientation="vertical" />);
    expect(screen.getByRole('group', { name: 'Zoom' })).not.toHaveAttribute('aria-orientation');
  });

  it('merges className and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ButtonGroup ref={ref} aria-label="Zoom" className="toolbar" />);
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Zoom' }));
    expect(ref.current).toHaveClass('toolbar');
  });
});
