import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const iconButtonEvents = defineEvents(
  { component: 'IconButton', prefix: 'iconbutton' },
  {
    'interaction.onClick': {
      description:
        'The icon button was activated by click, Enter or Space. Not emitted while loading or disabled.',
      payload: payload<{ label: string; source: EventSource }>(),
      fields: { label: 'string — the button’s aria-label', source: sourceField },
      example: { label: 'Delete page', source: { data: { pageId: 42 } } },
    },
  },
);
