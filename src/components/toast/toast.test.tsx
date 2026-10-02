import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast, type ToastOptions } from '.';
import { Button } from '../button';

function Trigger(props: { options: ToastOptions; label?: string }) {
  const { toast } = useToast();
  return <Button onClick={() => toast(props.options)}>{props.label ?? 'Save'}</Button>;
}

function renderWithProvider(options: ToastOptions, duration?: number) {
  return render(
    <ToastProvider duration={duration}>
      <Trigger options={options} />
    </ToastProvider>,
  );
}

describe('Toast', () => {
  it('shows a toast with title and description', async () => {
    const user = userEvent.setup();
    renderWithProvider({ title: 'Page saved', description: 'Visible to everyone.' });

    await user.click(screen.getByRole('button', { name: 'Save' }));
    const notifications = screen.getByRole('region', { name: /Notifications/ });
    expect(notifications).toHaveTextContent('Page saved');
    expect(notifications).toHaveTextContent('Visible to everyone.');
  });

  it('closes from its close button', async () => {
    const user = userEvent.setup();
    renderWithProvider({ title: 'Page saved' });

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.getByRole('region', { name: /Notifications/ })).not.toHaveTextContent(
        'Page saved',
      ),
    );
  });

  it('runs its action and closes', async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    renderWithProvider({ title: 'Page deleted', action: { label: 'Undo', onClick: onUndo } });

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument(),
    );
  });

  it('closes by itself after its duration', async () => {
    const user = userEvent.setup();
    renderWithProvider({ title: 'Page saved' }, 100);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Page saved')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Page saved')).not.toBeInTheDocument(), {
      timeout: 2000,
    });
  });

  it('stacks several toasts', async () => {
    const user = userEvent.setup();
    renderWithProvider({ title: 'Uploaded' });

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
  });

  it('uses translated labels', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider label="Bildirimler ({hotkey})" closeLabel="Kapat">
        <Trigger options={{ title: 'Kaydedildi' }} label="Kaydet" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(screen.getByRole('region', { name: /Bildirimler/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kapat' })).toBeInTheDocument();
  });

  it('throws a clear error outside a ToastProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger options={{ title: 'x' }} />)).toThrow(/ToastProvider/);
    vi.mocked(console.error).mockRestore();
  });
});
