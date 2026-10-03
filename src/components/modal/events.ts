import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const modalEvents = defineEvents(
  { component: 'Modal', prefix: 'modal' },
  {
    'state.onOpen': {
      description: 'The dialog opened (its open prop became true).',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField },
      example: { source: { id: 'delete-page' } },
    },
    'state.onClose': {
      description: 'The dialog closed (its open prop became false).',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField },
      example: { source: { id: 'delete-page' } },
    },
  },
);
