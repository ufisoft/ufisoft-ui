import { defineEvents, payload, sourceField, type EventSource } from '../../events/define-events';

export const selectEvents = defineEvents(
  { component: 'Select', prefix: 'select' },
  {
    'state.onChange': {
      description: 'The user chose another option.',
      payload: payload<{ value: string; previousValue: string; source: EventSource }>(),
      fields: {
        value: 'string — the chosen option’s value',
        previousValue: 'string — the value before the change',
        source: sourceField,
      },
      example: { value: 'tr', previousValue: 'en', source: { name: 'language' } },
    },
  },
);
