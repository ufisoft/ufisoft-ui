import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from '.';
import { recordEvents } from '../../test/record-events';
import { FilePreview } from '../file-preview';

describe('file events', () => {
  it('FileUpload emits onChange with accepted files and onReject with the rest', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const events = recordEvents();
    render(<FileUpload aria-label="Images" name="images" accept="image/*" multiple />);
    const photo = new File(['png'], 'photo.png', { type: 'image/png' });
    const notes = new File(['txt'], 'notes.txt', { type: 'text/plain' });

    await user.upload(screen.getByLabelText('Images'), [photo, notes]);
    const source = { id: undefined, name: 'images' };
    expect(events.map((event) => event.name)).toEqual([
      'fileupload.interaction.onReject',
      'fileupload.state.onChange',
    ]);
    expect(events[0]?.payload).toEqual({
      rejections: [{ file: notes, reason: 'type' }],
      source: { name: source.name },
    });
    expect(events[1]?.payload).toEqual({ files: [photo], source: { name: source.name } });
  });

  it('FilePreview emits onRemove instead of an icon button event', async () => {
    const user = userEvent.setup();
    const events = recordEvents();
    const onRemove = vi.fn();
    render(
      <FilePreview
        file={{ name: 'report.pdf', size: 1000 }}
        eventData={{ attachmentId: 9 }}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Remove report.pdf' }));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(events).toEqual([
      {
        name: 'filepreview.interaction.onRemove',
        payload: {
          file: { name: 'report.pdf', size: 1000, type: undefined },
          source: { data: { attachmentId: 9 } },
        },
      },
    ]);
  });
});
