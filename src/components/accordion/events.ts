import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const accordionEvents = defineEvents(
  { component: 'Accordion', prefix: 'accordion' },
  {
    'state.onOpen': {
      description: 'An item opened: the user toggled it, or its open prop became true.',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField + ' — of the AccordionItem' },
      example: { source: { id: 'shipping' } },
    },
    'state.onClose': {
      description:
        'An item closed: the user toggled it, or a sibling opened in a single accordion.',
      payload: payload<{ source: EventSource }>(),
      fields: { source: sourceField + ' — of the AccordionItem' },
      example: { source: { id: 'shipping' } },
    },
  },
);
