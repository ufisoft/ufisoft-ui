import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const filePreviewEvents = defineEvents(
  { component: 'FilePreview', prefix: 'filepreview' },
  {
    'interaction.onRemove': {
      description: 'The user pressed the remove button.',
      payload: payload<{
        file: { name: string; size?: number; type?: string };
        source: EventSource;
      }>(),
      fields: {
        file: '{ name, size?, type? } — the file being removed',
        source: sourceField,
      },
      example: {
        file: { name: 'report.pdf', size: 1572864 },
        source: { data: { attachmentId: 9 } },
      },
    },
  },
);
