import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FilePreview } from '.';

describe('FilePreview', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('shows the name and a readable size', () => {
    render(<FilePreview file={{ name: 'report.pdf', size: 1_572_864 }} locale="en" />);
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.5 MB')).toBeInTheDocument();
  });

  it('formats the size for the locale', () => {
    render(<FilePreview file={{ name: 'report.pdf', size: 1_572_864 }} locale="tr" />);
    expect(screen.getByText('1,5 MB')).toBeInTheDocument();
  });

  it('removes the file from a named button', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<FilePreview file={{ name: 'report.pdf' }} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'Remove report.pdf' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('translates the remove button', () => {
    render(
      <FilePreview
        file={{ name: 'rapor.pdf' }}
        onRemove={() => {}}
        removeLabel="Kaldır: rapor.pdf"
      />,
    );
    expect(screen.getByRole('button', { name: 'Kaldır: rapor.pdf' })).toBeInTheDocument();
  });

  it('shows upload progress named by the file, until done', () => {
    const { rerender } = render(<FilePreview file={{ name: 'report.pdf' }} progress={40} />);
    expect(screen.getByRole('progressbar', { name: 'report.pdf' })).toHaveValue(40);

    rerender(<FilePreview file={{ name: 'report.pdf' }} progress={100} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows an error instead of the size and progress', () => {
    render(
      <FilePreview
        file={{ name: 'video.mp4', size: 900 }}
        progress={30}
        error="File is too large"
      />,
    );
    expect(screen.getByText('File is too large')).toBeInTheDocument();
    expect(screen.queryByText('900 B')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('creates and releases a thumbnail for a picked image', () => {
    const file = new File(['png'], 'photo.png', { type: 'image/png' });
    const { container, unmount } = render(<FilePreview file={file} />);
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(container.querySelector('img')).toHaveAttribute('src', 'blob:preview');

    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });

  it('merges className and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<FilePreview ref={ref} file={{ name: 'a.txt' }} className="item" />);
    expect(ref.current).toHaveClass('item');
    expect(ref.current).toHaveTextContent('a.txt');
  });
});
