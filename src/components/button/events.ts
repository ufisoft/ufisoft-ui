import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const buttonEvents = defineEvents(
  { component: 'Button', prefix: 'button' },
  {
    'interaction.onClick': {
      description:
        'The button was activated by click, Enter or Space. Not emitted while loading or disabled.',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField },
      example: { source: { id: 'save', data: { pageId: 42 } } },
    },
  },
);
