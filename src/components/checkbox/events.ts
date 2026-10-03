import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const checkboxEvents = defineEvents(
  { component: 'Checkbox', prefix: 'checkbox' },
  {
    'state.onChange': {
      description: 'The user checked or unchecked the box.',
      payload: payload<{ checked: boolean; source: EventSource }>(),
      fields: { checked: 'boolean — the new state', source: sourceField },
      example: { checked: true, source: { name: 'newsletter' } },
    },
  },
);
