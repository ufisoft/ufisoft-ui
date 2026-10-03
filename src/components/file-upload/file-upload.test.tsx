import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from '.';
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field';

const pdf = (size = 1000) =>
  new File(['x'.repeat(size)], 'report.pdf', { type: 'application/pdf' });
const png = () => new File(['png'], 'photo.png', { type: 'image/png' });

const input = () => screen.getByLabelText<HTMLInputElement>(/^Attachments/);

describe('FileUpload', () => {
  it('is a labelled file input described by the drop zone text', () => {
    render(<FileUpload aria-label="Attachments">PDF up to 5 MB</FileUpload>);
    expect(input()).toHaveAttribute('type', 'file');
    expect(input()).toHaveAccessibleDescription('PDF up to 5 MB');
  });

  it('reports picked files', async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    render(<FileUpload aria-label="Attachments" multiple onFilesChange={onFilesChange} />);

    await user.upload(input(), [pdf(), png()]);
    expect(onFilesChange).toHaveBeenCalledWith([expect.any(File), expect.any(File)]);
    expect(onFilesChange.mock.calls[0]?.[0].map((file: File) => file.name)).toEqual([
      'report.pdf',
      'photo.png',
    ]);
  });

  it('rejects files that are too large or of the wrong type', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onFilesChange = vi.fn();
    const onFilesReject = vi.fn();
    render(
      <FileUpload
        aria-label="Attachments"
        accept=".pdf,image/*"
        maxSize={500}
        multiple
        onFilesChange={onFilesChange}
        onFilesReject={onFilesReject}
      />,
    );
    const text = new File(['notes'], 'notes.txt', { type: 'text/plain' });

    await user.upload(input(), [pdf(1000), png(), text]);
    expect(onFilesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'photo.png' }),
    ]);
    expect(onFilesReject).toHaveBeenLastCalledWith([
      { file: expect.objectContaining({ name: 'report.pdf' }), reason: 'size' },
      { file: text, reason: 'type' },
    ]);
  });

  it('accepts dropped files, keeping only the first without multiple', () => {
    const onFilesChange = vi.fn();
    render(<FileUpload aria-label="Attachments" accept="image/*" onFilesChange={onFilesChange} />);
    const first = png();

    fireEvent.drop(input(), { dataTransfer: { files: [first, png()] } });
    expect(onFilesChange).toHaveBeenLastCalledWith([first]);
  });

  it('ignores drops while disabled', () => {
    const onFilesChange = vi.fn();
    render(<FileUpload aria-label="Attachments" disabled onFilesChange={onFilesChange} />);

    expect(input()).toBeDisabled();
    fireEvent.drop(input(), { dataTransfer: { files: [png()] } });
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it('is reachable by keyboard', async () => {
    const user = userEvent.setup();
    render(<FileUpload aria-label="Attachments" />);
    await user.tab();
    expect(input()).toHaveFocus();
  });

  it('joins a FormField for label, description, error and states', () => {
    render(
      <FormField invalid required>
        <FormLabel>Attachments</FormLabel>
        <FileUpload>Drop a PDF</FileUpload>
        <FormDescription>Up to 5 MB.</FormDescription>
        <FormMessage>Add at least one file.</FormMessage>
      </FormField>,
    );
    expect(input()).toBeInvalid();
    expect(input()).toBeRequired();
    expect(input()).toHaveAccessibleDescription('Drop a PDF Up to 5 MB. Add at least one file.');
  });

  it('forwards ref to the input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<FileUpload ref={ref} aria-label="Attachments" />);
    expect(ref.current).toBe(input());
  });
});
