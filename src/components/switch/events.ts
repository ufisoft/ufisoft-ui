import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const switchEvents = defineEvents(
  { component: 'Switch', prefix: 'switch' },
  {
    'state.onChange': {
      description: 'The user turned the switch on or off.',
      payload: payload<{ checked: boolean; source: EventSource }>(),
      fields: { checked: 'boolean — on (true) or off (false)', source: sourceField },
      example: { checked: false, source: { name: 'notifications' } },
    },
  },
);
