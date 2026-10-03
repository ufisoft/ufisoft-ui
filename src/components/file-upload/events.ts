import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';
import type { FileRejection } from '.';

export const fileUploadEvents = defineEvents(
  { component: 'FileUpload', prefix: 'fileupload' },
  {
    'state.onChange': {
      description: 'The user picked or dropped files; the payload holds the accepted ones.',
      payload: payload<{ files: File[]; source: EventSource }>(),
      fields: { files: 'File[] — the accepted files', source: sourceField },
      example: {
        files: [new File(['%PDF'], 'invoice.pdf', { type: 'application/pdf' })],
        source: { name: 'invoice' },
      },
    },
    'interaction.onReject': {
      description: 'Picked or dropped files did not match accept or exceeded maxSize.',
      payload: payload<{ rejections: FileRejection[]; source: EventSource }>(),
      fields: {
        rejections: "{ file: File; reason: 'type' | 'size' }[] — each rejected file and why",
        source: sourceField,
      },
      example: {
        rejections: [
          { file: new File(['x'], 'notes.txt', { type: 'text/plain' }), reason: 'type' },
        ],
        source: { name: 'invoice' },
      },
    },
  },
);
