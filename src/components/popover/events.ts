import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const popoverEvents = defineEvents(
  { component: 'Popover', prefix: 'popover' },
  {
    'state.onOpen': {
      description: 'The user opened the popover from its trigger.',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField },
      example: { source: { id: 'share' } },
    },
    'state.onClose': {
      description: 'The user closed the popover (trigger, Escape or a click outside).',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField },
      example: { source: { id: 'share' } },
    },
  },
);
